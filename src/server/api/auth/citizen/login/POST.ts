import type { Request, Response } from "express";
import { citizens } from "../../../../data/store.js";

function normalizeLogin(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

function buildCitizenToken(citizenId: string): string {
  return `citizen-${citizenId}-${Date.now()}`;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { uid, password } = req.body || {};
    const login = normalizeLogin(uid);
    const pass = String(password || "");

    if (!login || !pass) {
      return res.status(400).json({ error: "UID/Phone/Email and password are required" });
    }

    const citizen = citizens.find((c) => {
      const byUid = c.uid.toLowerCase() === login;
      const byPhone = c.phone.toLowerCase() === login;
      const byEmail = c.email.toLowerCase() === login;
      return byUid || byPhone || byEmail;
    });

    if (!citizen || citizen.passwordHash !== pass) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = buildCitizenToken(citizen.id);

    return res.json({
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
    return res.status(500).json({ error: "Login failed", message: String(error) });
  }
}
