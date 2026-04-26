import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";

const DEFAULT_ADMIN_PASSWORD = "TubilAdmin2026!";

const ensureAdminUser = async () => {
  const adminEmail = env.adminEmail.trim().toLowerCase();

  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL is not configured. Set it in backend/.env before seeding admin.");
  }

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      displayName: "Tubil Admin",
    },
    create: {
      email: adminEmail,
      passwordHash,
      displayName: "Tubil Admin",
    },
  });

  console.log(`Admin user is ready: ${adminEmail}`);
  console.log(`Admin password: ${DEFAULT_ADMIN_PASSWORD}`);
};

ensureAdminUser()
  .catch((error: unknown) => {
    console.error("Failed to seed admin user.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
