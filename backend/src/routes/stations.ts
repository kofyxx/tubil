import { FuelType, Region } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { fetchBoholStations } from "../services/overpass";
import { haversineKm } from "../services/boholRegion";

export const stationsRouter = Router();

const isAdminRequest = (email?: string) => {
  const adminEmail = env.adminEmail.trim().toLowerCase();
  return Boolean(adminEmail) && Boolean(email) && email!.toLowerCase() === adminEmail;
};

const listQuerySchema = z.object({
  lat: z.coerce.number().optional(),
  lon: z.coerce.number().optional(),
  radiusKm: z.coerce.number().min(1).max(50).default(8),
  region: z.nativeEnum(Region).optional(),
});

stationsRouter.get("/stations", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid query", issues: parsed.error.issues });
  }

  const { lat, lon, radiusKm, region } = parsed.data;

  const stations = await prisma.station.findMany({
    where: {
      ...(region ? { region } : {}),
    },
    include: {
      fuelPrices: {
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              reliabilityScore: true,
            },
          },
          votes: {
            select: {
              voterId: true,
              isAccurate: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 400,
  });

  const withDistance = stations
    .map((station) => {
      const latitude = Number(station.latitude);
      const longitude = Number(station.longitude);
      const distanceKm = lat != null && lon != null ? haversineKm(lat, lon, latitude, longitude) : null;

      return {
        ...station,
        latitude,
        longitude,
        distanceKm,
      };
    })
    .filter((station) => (station.distanceKm == null ? true : station.distanceKm <= radiusKm))
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  return res.json({ stations: withDistance });
});

const priceSchema = z.object({
  stationId: z.string().min(1),
  fuelType: z.nativeEnum(FuelType),
  pricePerLiter: z.coerce.number().min(10).max(200),
});

const voteSchema = z.object({
  isAccurate: z.boolean(),
});

const stationSchema = z.object({
  name: z.string().min(2).max(80),
  brand: z.string().max(60).nullable().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  region: z.nativeEnum(Region),
  address: z.string().max(180).nullable().optional(),
  initialGasolinePrice: z.coerce.number().min(10).max(200).optional(),
});

stationsRouter.post("/stations/prices", requireAuth, async (req, res) => {
  const parsed = priceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  const report = await prisma.fuelPrice.create({
    data: {
      stationId: parsed.data.stationId,
      userId: req.user!.sub,
      fuelType: parsed.data.fuelType,
      pricePerLiter: parsed.data.pricePerLiter,
      isVerified: false,
    },
  });

  await prisma.user.update({
    where: { id: req.user!.sub },
    data: { points: { increment: 5 } },
  });

  return res.status(201).json({ report });
});

stationsRouter.post("/stations/prices/:priceId/votes", requireAuth, async (req, res) => {
  const priceId = z.string().min(1).parse(req.params.priceId);
  const parsed = voteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  const price = await prisma.fuelPrice.findUnique({
    where: { id: priceId },
    select: {
      id: true,
      userId: true,
      verificationScore: true,
      isVerified: true,
    },
  });

  if (!price) {
    return res.status(404).json({ message: "Fuel price report not found" });
  }

  if (price.userId && price.userId === req.user!.sub) {
    return res.status(400).json({ message: "You cannot vote on your own report" });
  }

  const existingVote = await prisma.fuelPriceVote.findUnique({
    where: {
      fuelPriceId_voterId: {
        fuelPriceId: price.id,
        voterId: req.user!.sub,
      },
    },
  });

  const vote = await prisma.fuelPriceVote.upsert({
    where: {
      fuelPriceId_voterId: {
        fuelPriceId: price.id,
        voterId: req.user!.sub,
      },
    },
    update: {
      isAccurate: parsed.data.isAccurate,
    },
    create: {
      fuelPriceId: price.id,
      voterId: req.user!.sub,
      isAccurate: parsed.data.isAccurate,
    },
  });

  const aggregate = await prisma.fuelPriceVote.groupBy({
    by: ["isAccurate"],
    where: { fuelPriceId: price.id },
    _count: {
      _all: true,
    },
  });

  const accurateVotes = aggregate.find((entry) => entry.isAccurate)?._count._all ?? 0;
  const inaccurateVotes = aggregate.find((entry) => !entry.isAccurate)?._count._all ?? 0;
  const verificationScore = accurateVotes - inaccurateVotes;
  const isVerified = verificationScore >= 2;

  await prisma.fuelPrice.update({
    where: { id: price.id },
    data: {
      verificationScore,
      isVerified,
    },
  });

  if (!existingVote) {
    await prisma.user.update({
      where: { id: req.user!.sub },
      data: {
        points: {
          increment: 1,
        },
      },
    });
  }

  if (price.userId) {
    const reportOwner = await prisma.user.findUnique({
      where: { id: price.userId },
      select: {
        reliabilityScore: true,
      },
    });

    if (reportOwner) {
      const delta = verificationScore - price.verificationScore;
      const reliabilityScore = Math.min(1, Math.max(0, reportOwner.reliabilityScore + delta * 0.03));
      await prisma.user.update({
        where: { id: price.userId },
        data: {
          points: {
            increment: delta,
          },
          reliabilityScore,
        },
      });
    }
  }

  return res.status(201).json({
    vote,
    summary: {
      accurateVotes,
      inaccurateVotes,
      verificationScore,
      isVerified,
    },
  });
});

stationsRouter.post("/stations/import", requireAuth, async (req, res) => {
  if (!isAdminRequest(req.user?.email)) {
    return res.status(403).json({ message: "Only admin can import stations" });
  }

  const stations = await fetchBoholStations();

  for (const station of stations) {
    await prisma.station.upsert({
      where: { osmId: station.osmId },
      update: {
        name: station.name,
        brand: station.brand,
        latitude: station.latitude,
        longitude: station.longitude,
        region: station.region,
        address: station.address,
      },
      create: {
        osmId: station.osmId,
        name: station.name,
        brand: station.brand,
        latitude: station.latitude,
        longitude: station.longitude,
        region: station.region,
        address: station.address,
      },
    });
  }

  return res.json({ imported: stations.length });
});

stationsRouter.post("/stations", requireAuth, async (req, res) => {
  if (!isAdminRequest(req.user?.email)) {
    return res.status(403).json({ message: "Only admin can create stations" });
  }

  const parsed = stationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  const station = await prisma.station.create({
    data: {
      name: parsed.data.name,
      brand: parsed.data.brand ?? null,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      region: parsed.data.region,
      address: parsed.data.address ?? null,
      fuelPrices:
        parsed.data.initialGasolinePrice != null
          ? {
              create: {
                userId: req.user!.sub,
                fuelType: FuelType.GASOLINE,
                pricePerLiter: parsed.data.initialGasolinePrice,
                isVerified: false,
              },
            }
          : undefined,
    },
  });

  return res.status(201).json({ station });
});

stationsRouter.put("/stations/:stationId", requireAuth, async (req, res) => {
  if (!isAdminRequest(req.user?.email)) {
    return res.status(403).json({ message: "Only admin can edit stations" });
  }

  const stationId = z.string().min(1).parse(req.params.stationId);
  const parsed = stationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  const existing = await prisma.station.findUnique({
    where: { id: stationId },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Station not found" });
  }

  const station = await prisma.station.update({
    where: { id: stationId },
    data: {
      name: parsed.data.name,
      brand: parsed.data.brand ?? null,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      region: parsed.data.region,
      address: parsed.data.address ?? null,
    },
  });

  return res.json({ station });
});

stationsRouter.delete("/stations/:stationId", requireAuth, async (req, res) => {
  if (!isAdminRequest(req.user?.email)) {
    return res.status(403).json({ message: "Only admin can delete stations" });
  }

  const stationId = z.string().min(1).parse(req.params.stationId);

  const existing = await prisma.station.findUnique({
    where: { id: stationId },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Station not found" });
  }

  await prisma.station.delete({ where: { id: stationId } });
  return res.status(204).send();
});
