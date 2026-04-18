import type { Request, Response } from "express";
import { officers } from "../../../../data/store.js";

function normalizeLogin(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

export default async function handler(req: Request, res: Response) {
  try {
    const { employeeId, password } = req.body || {};
    const login = normalizeLogin(employeeId);
    const pass = String(password || "");

    if (!login || !pass) {
      return res.status(400).json({ error: "Employee ID and password are required" });
    }

    const officer = officers.find(
      (o) => o.employeeId.toLowerCase() === login || o.email.toLowerCase() === login,
    );

    if (!officer || officer.passwordHash !== pass) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = `officer-${officer.id}-${Date.now()}`;

    return res.json({
      token,
      officer: {
        id: officer.id,
        name: officer.name,
        employeeId: officer.employeeId,
        department: officer.department,
        assignedWards: officer.assignedWards,
        role: officer.role,
        email: officer.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Login failed", message: String(error) });
  }
}
