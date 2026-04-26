import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  return res.json({
    status: "ok",
    service: "tubil-backend",
    timestamp: new Date().toISOString(),
  });
});
