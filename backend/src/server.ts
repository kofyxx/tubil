import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { stationsRouter } from "./routes/stations";
import { vehiclesRouter } from "./routes/vehicles";
import { tripsRouter } from "./routes/trips";
import { refuelsRouter } from "./routes/refuels";
import { leaderboardRouter } from "./routes/leaderboard";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.frontendUrls.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(express.json());

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api", stationsRouter);
app.use("/api", vehiclesRouter);
app.use("/api", tripsRouter);
app.use("/api", refuelsRouter);
app.use("/api", leaderboardRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
});

app.listen(env.port, () => {
  console.log(`Tubil backend running on http://localhost:${env.port}`);
});
