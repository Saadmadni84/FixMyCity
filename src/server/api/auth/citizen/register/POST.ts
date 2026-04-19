import type { Request, Response } from "express";
import { citizens } from "../../../../data/store.js";
import { sendWelcomeEmail } from "../../../../lib/email.js";

function nextCitizenId(): string {
  const max = citizens.reduce((acc, c) => {
    const n = Number(c.id.replace(/^c/i, ""));
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `c${max + 1}`;
}

function generateUid(): string {
  const year = new Date().getFullYear();
  const suffix = String(Math.floor(100000 + Math.random() * 900000));
  return `UID-${year}-${suffix}`;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { name, phone, email, ward, password } = req.body || {};

    const normalizedPhone = String(phone || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!name || !normalizedPhone || !normalizedEmail || !ward || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (citizens.some((c) => c.phone === normalizedPhone)) {
      return res.status(409).json({ error: "Phone number already registered" });
    }

    if (citizens.some((c) => c.email.toLowerCase() === normalizedEmail)) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const citizen = {
      id: nextCitizenId(),
      uid: generateUid(),
      name: String(name).trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      ward: String(ward).trim(),
      passwordHash: String(password),
      points: 0,
      reportsCount: 0,
      verifiedReports: 0,
      badges: ["Welcome Badge"],
      createdAt: new Date().toISOString(),
    };

    citizens.push(citizen);

    sendWelcomeEmail({
      toEmail: citizen.email,
      toName: citizen.name,
      userRole: "citizen",
    }).catch((error) => {
      console.error("Failed to send citizen welcome email:", error);
    });

    const token = `citizen-${citizen.id}-${Date.now()}`;

    return res.status(201).json({
      token,
      citizen: {
        id: citizen.id,
        uid: citizen.uid,
        name: citizen.name,
        phone: citizen.phone,
        email: citizen.email,
        ward: citizen.ward,
        points: citizen.points,
        reportsCount: citizen.reportsCount,
        verifiedReports: citizen.verifiedReports,
        badges: citizen.badges,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Registration failed", message: String(error) });
  }
}
