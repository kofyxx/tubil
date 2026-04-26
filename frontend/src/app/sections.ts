import type { DashboardSection } from "./models";

export type DashboardSectionItem = {
  key: DashboardSection;
  label: string;
};

export const userSections: DashboardSectionItem[] = [
  { key: "map", label: "Live Map" },
  { key: "estimator", label: "Trip Estimator" },
  { key: "history", label: "Refuel History" },
  { key: "garage", label: "Vehicle Garage" },
  { key: "verify", label: "Verify Reports" },
  { key: "leaderboard", label: "Leaderboard" },
  { key: "profile", label: "Profile" },
];

export const adminSections: DashboardSectionItem[] = [
  { key: "admin", label: "Admin Center" },
  ...userSections,
];

export const sectionDescriptions: Record<DashboardSection, string> = {
  map: "Track nearby stations, prices, and routing insights in real time.",
  estimator: "Plan destination-based trip costs with live distance and fuel estimates.",
  history: "Review and log your past refuels for better fuel spending awareness.",
  garage: "Manage your vehicles and motorcycles with tuned efficiency profiles.",
  verify: "Help validate community fuel price reports to keep map data reliable.",
  leaderboard: "See top contributors ranked by trust score and community points.",
  profile: "Manage your account identity, stats, and personal dashboard summary.",
  admin: "Run station import and other elevated controls for platform operations.",
};

export const getSectionsForDashboard = (isAdminView: boolean): DashboardSectionItem[] =>
  isAdminView ? adminSections : userSections;
