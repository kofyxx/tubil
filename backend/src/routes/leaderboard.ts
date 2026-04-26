import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";

export const leaderboardRouter = Router();

leaderboardRouter.get("/leaderboard", requireAuth, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      points: true,
      reliabilityScore: true,
    },
    take: 20,
  });

  const entries = users
    .map((user) => {
      const combinedScore = Number((user.points + user.reliabilityScore * 100).toFixed(2));
      return {
        id: user.id,
        displayName: user.displayName,
        points: user.points,
        reliabilityScore: user.reliabilityScore,
        combinedScore,
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  return res.json({ leaderboard: entries.slice(0, 8) });
});
