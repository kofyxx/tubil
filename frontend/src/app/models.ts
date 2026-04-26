import type { FuelType } from "../types";

export type DashboardSection =
  | "map"
  | "estimator"
  | "history"
  | "garage"
  | "verify"
  | "leaderboard"
  | "profile"
  | "admin";

export type DashboardMode = "user" | "admin";

export type UnitPreset = {
  name: string;
  fuelType: FuelType;
  efficiencyKmPerL: number;
  category: "Vehicle" | "Motorcycle";
};

export type RouteEstimate = {
  distanceKm: number;
  durationMin: number;
  provider: string;
  path?: Array<{ lat: number; lon: number }>;
};
