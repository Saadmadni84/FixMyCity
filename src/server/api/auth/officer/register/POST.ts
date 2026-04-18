import type { Request, Response } from "express";
import { officers, type Department } from "../../../../data/store.js";
import { parseWardsInput } from "../../../../../lib/wards.js";

const DEPARTMENTS: Department[] = [
  "electricity",
  "civil_works",
  "horticulture",
  "drainage",
  "sanitation",
  "water",
];

function nextOfficerId(): string {
  const max = officers.reduce((acc, o) => {
    const n = Number(o.id.replace(/^o/i, ""));
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `o${max + 1}`;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { name, employeeId, department, email, password, assignedWards } =
      req.body || {};

    const dept = String(department || "").trim() as Department;
    const emp = String(employeeId || "").trim();
    const mail = String(email || "").trim().toLowerCase();
    const wards = parseWardsInput(assignedWards);

    if (!name || !emp || !dept || !mail || !password || wards.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!DEPARTMENTS.includes(dept)) {
      return res.status(400).json({ error: "Invalid department" });
    }

    if (officers.some((o) => o.employeeId.toLowerCase() === emp.toLowerCase())) {
      return res.status(409).json({ error: "Employee ID already registered" });
    }

    if (officers.some((o) => o.email.toLowerCase() === mail)) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const officer = {
      id: nextOfficerId(),
      name: String(name).trim(),
      employeeId: emp,
      department: dept,
      assignedWards: wards,
      role: "officer" as const,
      email: mail,
      passwordHash: String(password),
      createdAt: new Date().toISOString(),
    };

    officers.push(officer);

    const token = `officer-${officer.id}-${Date.now()}`;

    return res.status(201).json({
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
    return res.status(500).json({ error: "Registration failed", message: String(error) });
  }
}
