import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

const isAdminEmail = (email: string) => {
  const adminEmail = env.adminEmail.trim().toLowerCase();
  return adminEmail.length > 0 && email.toLowerCase() === adminEmail;
};

const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(40),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  if (isAdminEmail(parsed.data.email)) {
    return res.status(403).json({ message: "Admin account cannot be created through registration." });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      displayName: parsed.data.displayName,
      passwordHash,
    },
  });

  const token = jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, { expiresIn: "7d" });

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      points: user.points,
      reliabilityScore: user.reliabilityScore,
      isAdmin: isAdminEmail(user.email),
    },
  });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload", issues: parsed.error.issues });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const passwordOk = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!passwordOk) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, { expiresIn: "7d" });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      points: user.points,
      reliabilityScore: user.reliabilityScore,
      isAdmin: isAdminEmail(user.email),
    },
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    select: {
      id: true,
      email: true,
      displayName: true,
      points: true,
      reliabilityScore: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    user: {
      ...user,
      isAdmin: isAdminEmail(user.email),
    },
  });
});
