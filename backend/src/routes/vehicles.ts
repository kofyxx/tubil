import { FuelType } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const vehiclesRouter = Router();

const vehicleSchema = z.object({
  name: z.string().min(2).max(50),
  fuelType: z.nativeEnum(FuelType),
  efficiencyKmPerL: z.coerce.number().min(3).max(60),
  isPrimary: z.boolean().default(false),
});

vehiclesRouter.get("/vehicles", requireAuth, async (req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { userId: req.user!.sub },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ vehicles });
});

vehiclesRouter.post("/vehicles", requireAuth, async (req, res) => {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  if (parsed.data.isPrimary) {
    await prisma.vehicle.updateMany({
      where: { userId: req.user!.sub },
      data: { isPrimary: false },
    });
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      userId: req.user!.sub,
      name: parsed.data.name,
      fuelType: parsed.data.fuelType,
      efficiencyKmPerL: parsed.data.efficiencyKmPerL,
      isPrimary: parsed.data.isPrimary,
    },
  });

  return res.status(201).json({ vehicle });
});

vehiclesRouter.put("/vehicles/:vehicleId", requireAuth, async (req, res) => {
  const vehicleId = z.string().min(1).parse(req.params.vehicleId);
  const parsed = vehicleSchema.omit({ isPrimary: true }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  const existing = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      userId: req.user!.sub,
    },
  });

  if (!existing) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  const vehicle = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      name: parsed.data.name,
      fuelType: parsed.data.fuelType,
      efficiencyKmPerL: parsed.data.efficiencyKmPerL,
    },
  });

  return res.json({ vehicle });
});

vehiclesRouter.delete("/vehicles/:vehicleId", requireAuth, async (req, res) => {
  const vehicleId = z.string().min(1).parse(req.params.vehicleId);

  const existing = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      userId: req.user!.sub,
    },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  await prisma.vehicle.delete({ where: { id: vehicleId } });
  return res.status(204).send();
});
