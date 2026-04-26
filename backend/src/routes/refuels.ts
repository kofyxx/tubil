import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const refuelsRouter = Router();

const refuelSchema = z.object({
  vehicleId: z.string().min(1),
  stationId: z.string().min(1),
  liters: z.coerce.number().min(1).max(200),
  totalCost: z.coerce.number().min(1).max(50000),
  odometerKm: z.coerce.number().optional(),
});

refuelsRouter.post("/refuels", requireAuth, async (req, res) => {
  const parsed = refuelSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  const refuel = await prisma.refuel.create({
    data: {
      userId: req.user!.sub,
      vehicleId: parsed.data.vehicleId,
      stationId: parsed.data.stationId,
      liters: parsed.data.liters,
      totalCost: parsed.data.totalCost,
      odometerKm: parsed.data.odometerKm,
    },
  });

  return res.status(201).json({ refuel });
});

refuelsRouter.get("/refuels", requireAuth, async (req, res) => {
  const refuels = await prisma.refuel.findMany({
    where: { userId: req.user!.sub },
    include: {
      vehicle: true,
      station: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return res.json({ refuels });
});

refuelsRouter.put("/refuels/:refuelId", requireAuth, async (req, res) => {
  const refuelId = z.string().min(1).parse(req.params.refuelId);
  const parsed = refuelSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  const existing = await prisma.refuel.findFirst({
    where: {
      id: refuelId,
      userId: req.user!.sub,
    },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Refuel record not found" });
  }

  const refuel = await prisma.refuel.update({
    where: { id: refuelId },
    data: {
      vehicleId: parsed.data.vehicleId,
      stationId: parsed.data.stationId,
      liters: parsed.data.liters,
      totalCost: parsed.data.totalCost,
      odometerKm: parsed.data.odometerKm,
    },
  });

  return res.json({ refuel });
});

refuelsRouter.delete("/refuels/:refuelId", requireAuth, async (req, res) => {
  const refuelId = z.string().min(1).parse(req.params.refuelId);

  const existing = await prisma.refuel.findFirst({
    where: {
      id: refuelId,
      userId: req.user!.sub,
    },
    select: { id: true },
  });

  if (!existing) {
    return res.status(404).json({ message: "Refuel record not found" });
  }

  await prisma.refuel.delete({ where: { id: refuelId } });
  return res.status(204).send();
});
