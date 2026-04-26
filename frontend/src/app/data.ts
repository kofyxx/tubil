import type { FuelType } from "../types";
import type { DashboardSection, UnitPreset } from "./models";

export const fuelTypes: FuelType[] = ["GASOLINE", "DIESEL", "PREMIUM"];

export const dashboardSections: DashboardSection[] = [
  "map",
  "estimator",
  "history",
  "garage",
  "verify",
  "leaderboard",
  "profile",
  "admin",
];

export const garagePresetsStorageKey = "tubil_garage_unit_presets";

export const imageFallback = (() => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" fill="none">
      <rect width="640" height="360" rx="24" fill="#e2e8f0" />
      <rect x="24" y="24" width="592" height="312" rx="20" fill="#f8fafc" stroke="#cbd5e1" />
      <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#334155">Tubil Garage</text>
      <text x="50%" y="56%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#64748b">Image loading...</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
})();

export const defaultUnitPresets: UnitPreset[] = [
  { name: "Toyota Vios", fuelType: "GASOLINE", efficiencyKmPerL: 14.5, category: "Vehicle" },
  { name: "Toyota Wigo", fuelType: "GASOLINE", efficiencyKmPerL: 18.0, category: "Vehicle" },
  { name: "Toyota Raize 1.2", fuelType: "GASOLINE", efficiencyKmPerL: 17.0, category: "Vehicle" },
  { name: "Toyota Corolla Altis", fuelType: "GASOLINE", efficiencyKmPerL: 13.5, category: "Vehicle" },
  { name: "Toyota Yaris Cross Hybrid", fuelType: "GASOLINE", efficiencyKmPerL: 20.0, category: "Vehicle" },
  { name: "Toyota Hilux", fuelType: "DIESEL", efficiencyKmPerL: 10.5, category: "Vehicle" },
  { name: "Honda City", fuelType: "GASOLINE", efficiencyKmPerL: 16.0, category: "Vehicle" },
  { name: "Honda Brio", fuelType: "GASOLINE", efficiencyKmPerL: 18.5, category: "Vehicle" },
  { name: "Honda BR-V", fuelType: "GASOLINE", efficiencyKmPerL: 13.2, category: "Vehicle" },
  { name: "Honda Civic RS Turbo", fuelType: "PREMIUM", efficiencyKmPerL: 12.0, category: "Vehicle" },
  { name: "Honda CR-V Turbo", fuelType: "PREMIUM", efficiencyKmPerL: 11.0, category: "Vehicle" },
  { name: "Mitsubishi Mirage G4", fuelType: "GASOLINE", efficiencyKmPerL: 17.5, category: "Vehicle" },
  { name: "Mitsubishi Xpander", fuelType: "GASOLINE", efficiencyKmPerL: 12.5, category: "Vehicle" },
  { name: "Mitsubishi Montero Sport", fuelType: "DIESEL", efficiencyKmPerL: 9.0, category: "Vehicle" },
  { name: "Mitsubishi Strada", fuelType: "DIESEL", efficiencyKmPerL: 10.0, category: "Vehicle" },
  { name: "Nissan Almera Turbo", fuelType: "GASOLINE", efficiencyKmPerL: 14.0, category: "Vehicle" },
  { name: "Nissan Navara", fuelType: "DIESEL", efficiencyKmPerL: 10.5, category: "Vehicle" },
  { name: "Nissan Terra", fuelType: "DIESEL", efficiencyKmPerL: 9.5, category: "Vehicle" },
  { name: "Suzuki Ertiga", fuelType: "GASOLINE", efficiencyKmPerL: 14.0, category: "Vehicle" },
  { name: "Suzuki Dzire", fuelType: "GASOLINE", efficiencyKmPerL: 17.0, category: "Vehicle" },
  { name: "Suzuki S-Presso", fuelType: "GASOLINE", efficiencyKmPerL: 19.0, category: "Vehicle" },
  { name: "Kia Soluto", fuelType: "GASOLINE", efficiencyKmPerL: 14.5, category: "Vehicle" },
  { name: "Hyundai Stargazer", fuelType: "GASOLINE", efficiencyKmPerL: 13.0, category: "Vehicle" },
  { name: "Ford Ranger", fuelType: "DIESEL", efficiencyKmPerL: 9.5, category: "Vehicle" },
  { name: "Isuzu D-Max", fuelType: "DIESEL", efficiencyKmPerL: 12.0, category: "Vehicle" },
  { name: "Isuzu mu-X", fuelType: "DIESEL", efficiencyKmPerL: 11.0, category: "Vehicle" },
  { name: "Geely Coolray", fuelType: "PREMIUM", efficiencyKmPerL: 10.5, category: "Vehicle" },
  { name: "MG ZS", fuelType: "GASOLINE", efficiencyKmPerL: 11.0, category: "Vehicle" },
  { name: "Honda Click 125i", fuelType: "GASOLINE", efficiencyKmPerL: 46.0, category: "Motorcycle" },
  { name: "Honda Beat", fuelType: "GASOLINE", efficiencyKmPerL: 52.0, category: "Motorcycle" },
  { name: "Honda ADV 160", fuelType: "GASOLINE", efficiencyKmPerL: 40.0, category: "Motorcycle" },
  { name: "Honda PCX 160", fuelType: "GASOLINE", efficiencyKmPerL: 43.0, category: "Motorcycle" },
  { name: "Honda XRM 125", fuelType: "GASOLINE", efficiencyKmPerL: 50.0, category: "Motorcycle" },
  { name: "Honda TMX 125", fuelType: "GASOLINE", efficiencyKmPerL: 45.0, category: "Motorcycle" },
  { name: "Yamaha Mio i125", fuelType: "GASOLINE", efficiencyKmPerL: 45.0, category: "Motorcycle" },
  { name: "Yamaha NMAX", fuelType: "GASOLINE", efficiencyKmPerL: 39.0, category: "Motorcycle" },
  { name: "Yamaha Aerox", fuelType: "GASOLINE", efficiencyKmPerL: 35.0, category: "Motorcycle" },
  { name: "Yamaha Sniper 155", fuelType: "GASOLINE", efficiencyKmPerL: 40.0, category: "Motorcycle" },
  { name: "Yamaha Fazzio", fuelType: "GASOLINE", efficiencyKmPerL: 48.0, category: "Motorcycle" },
  { name: "Yamaha YTX 125", fuelType: "GASOLINE", efficiencyKmPerL: 45.0, category: "Motorcycle" },
  { name: "Suzuki Raider R150 FI", fuelType: "GASOLINE", efficiencyKmPerL: 37.0, category: "Motorcycle" },
  { name: "Suzuki Burgman Street", fuelType: "GASOLINE", efficiencyKmPerL: 48.0, category: "Motorcycle" },
  { name: "Suzuki Skydrive Sport", fuelType: "GASOLINE", efficiencyKmPerL: 45.0, category: "Motorcycle" },
  { name: "Kawasaki Barako II", fuelType: "GASOLINE", efficiencyKmPerL: 38.0, category: "Motorcycle" },
  { name: "Kawasaki Rouser NS160", fuelType: "GASOLINE", efficiencyKmPerL: 38.0, category: "Motorcycle" },
  { name: "Bajaj CT100", fuelType: "GASOLINE", efficiencyKmPerL: 65.0, category: "Motorcycle" },
  { name: "KTM Duke 200", fuelType: "PREMIUM", efficiencyKmPerL: 28.0, category: "Motorcycle" },
  { name: "CFMOTO 250 NK", fuelType: "PREMIUM", efficiencyKmPerL: 30.0, category: "Motorcycle" },
  { name: "Rusi Classic 250", fuelType: "GASOLINE", efficiencyKmPerL: 30.0, category: "Motorcycle" },
];
