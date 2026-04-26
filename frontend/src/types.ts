export type FuelType = "GASOLINE" | "DIESEL" | "PREMIUM";

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  points: number;
  reliabilityScore: number;
  isAdmin: boolean;
};

export type Region = "DAUIS" | "PANGLAO" | "BOHOL_PROPER";

export type FuelPriceVote = {
  voterId: string;
  isAccurate: boolean;
};

export type PriceReporter = {
  id: string;
  displayName: string;
  reliabilityScore: number;
};

export type FuelPrice = {
  id: string;
  fuelType: FuelType;
  pricePerLiter: string | number;
  isVerified: boolean;
  verificationScore: number;
  createdAt: string;
  user: PriceReporter | null;
  votes: FuelPriceVote[];
};

export type Station = {
  id: string;
  name: string;
  brand: string | null;
  latitude: number;
  longitude: number;
  region: Region;
  address: string | null;
  distanceKm: number | null;
  fuelPrices: FuelPrice[];
};

export type Vehicle = {
  id: string;
  name: string;
  fuelType: FuelType;
  efficiencyKmPerL: number;
  isPrimary: boolean;
};

export type Trip = {
  id: string;
  origin: string;
  destination: string;
  distanceKm: number;
  durationMin: number | null;
  estimatedCost: string | number;
  createdAt: string;
  vehicle: Vehicle;
};

export type Refuel = {
  id: string;
  liters: number;
  totalCost: string | number;
  createdAt: string;
  vehicle: Vehicle;
  station: Station;
};

export type LeaderboardEntry = {
  id: string;
  displayName: string;
  points: number;
  reliabilityScore: number;
  combinedScore: number;
  rank: number;
};
