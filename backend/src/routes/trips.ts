import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const tripsRouter = Router();

const estimateSchema = z.object({
  vehicleId: z.string().min(1),
  distanceKm: z.coerce.number().min(1).max(2000),
  durationMin: z.coerce.number().min(1).max(6000).optional(),
  fuelPricePerLiter: z.coerce.number().min(10).max(200),
  origin: z.string().min(2).max(100),
  destination: z.string().min(2).max(100),
});

const routeSchema = z.object({
  originLat: z.number().min(-90).max(90),
  originLon: z.number().min(-180).max(180),
  destinationLat: z.number().min(-90).max(90),
  destinationLon: z.number().min(-180).max(180),
});

tripsRouter.post("/trips/route", requireAuth, async (req, res) => {
  const parsed = routeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid route payload", issues: parsed.error.issues });
  }

  const {
    originLat,
    originLon,
    destinationLat,
    destinationLon,
  } = parsed.data;

  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destinationLon},${destinationLat}?overview=full&geometries=geojson&alternatives=false&steps=false`;

  try {
    const response = await fetch(osrmUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return res.status(502).json({ message: "Failed to fetch routing data" });
    }

    const data = (await response.json()) as {
      code?: string;
      routes?: Array<{ distance?: number; duration?: number; geometry?: { coordinates?: Array<[number, number]> } }>;
    };

    const route = data.routes?.[0];
    if (!route || route.distance == null || route.duration == null) {
      return res.status(502).json({ message: "Routing response missing distance or duration" });
    }

    const path = route.geometry?.coordinates?.map(([lon, lat]) => ({ lat, lon })) ?? [];

    return res.json({
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
      provider: "OSRM",
      path,
    });
  } catch {
    return res.status(502).json({ message: "Routing service unavailable" });
  }
});

tripsRouter.post("/trips/estimate", requireAuth, async (req, res) => {
  const parsed = estimateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: parsed.data.vehicleId,
      userId: req.user!.sub,
    },
  });

  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  const litersNeeded = parsed.data.distanceKm / vehicle.efficiencyKmPerL;
  const estimatedCost = litersNeeded * parsed.data.fuelPricePerLiter;

  const trip = await prisma.trip.create({
    data: {
      userId: req.user!.sub,
      vehicleId: vehicle.id,
      origin: parsed.data.origin,
      destination: parsed.data.destination,
      distanceKm: parsed.data.distanceKm,
      durationMin: parsed.data.durationMin ?? null,
      estimatedCost,
    },
  });

  return res.status(201).json({
    trip,
    estimate: {
      litersNeeded,
      estimatedCost,
    },
  });
});

tripsRouter.get("/trips", requireAuth, async (req, res) => {
  const trips = await prisma.trip.findMany({
    where: { userId: req.user!.sub },
    orderBy: { createdAt: "desc" },
    include: {
      vehicle: true,
    },
    take: 100,
  });

  return res.json({ trips });
});
