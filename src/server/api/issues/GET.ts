import type { Request, Response } from "express";
import {
  issues as memoryIssues,
  citizens as memoryCitizens,
  type Issue as MemoryIssue,
} from "../../data/store.js";

function normalizeStatus(status: string): string {
  return status === "reported" ? "submitted" : status;
}

function normalizeIssue<T extends { status: string }>(issue: T): T {
  const status = String(issue.status || "submitted");
  return {
    ...issue,
    status: normalizeStatus(status),
  };
}

function parseWardsQuery(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

export default async function handler(req: Request, res: Response) {
  try {
    const { citizenId, department, status, wards } = req.query;
    const wardFilter = parseWardsQuery(wards);
    const wardSet = new Set(wardFilter);

    const [{ db }, { issues, citizens }, { eq, desc }] = await Promise.all([
      import("../../db/client.js"),
      import("../../db/schema.js"),
      import("drizzle-orm"),
    ]);

    let rows = await db.select().from(issues).orderBy(desc(issues.createdAt));

    if (citizenId) {
      rows = rows.filter((i) => i.citizenId === Number(citizenId));
    }
    if (department) {
      rows = rows.filter((i) => i.department === department);
    }
    if (status) {
      rows = rows.filter((i) => i.status === status);
    }
    if (wardFilter.length > 0) {
      rows = rows.filter((i) => wardSet.has(String(i.ward || "").trim()));
    }

    // Attach citizen names
    const citizenIds = [...new Set(rows.map((i) => i.citizenId))];

    // Fetch all relevant citizens
    const allCitizens = citizenIds.length
      ? await Promise.all(
          citizenIds.map((id) =>
            db
              .select({ id: citizens.id, name: citizens.name })
              .from(citizens)
              .where(eq(citizens.id, id))
              .limit(1),
          ),
        ).then((results) => results.flat())
      : [];

    const citizenMap = Object.fromEntries(
      allCitizens.map((c) => [c.id, c.name]),
    );

    const enriched = rows.map((issue) => ({
      ...issue,
      status: normalizeStatus(issue.status),
      citizenName: citizenMap[issue.citizenId] || "Unknown",
    }));

    res.json({ issues: enriched, total: enriched.length });
  } catch (error) {
    let fallbackRows: MemoryIssue[] = memoryIssues.map((issue) =>
      normalizeIssue(issue),
    );

    const { citizenId, department, status, wards } = req.query;
    const wardFilter = parseWardsQuery(wards);
    const wardSet = new Set(wardFilter);
    if (citizenId) {
      fallbackRows = fallbackRows.filter(
        (i) => String(i.citizenId) === String(citizenId),
      );
    }
    if (department) {
      fallbackRows = fallbackRows.filter(
        (i) => String(i.department) === String(department),
      );
    }
    if (status) {
      fallbackRows = fallbackRows.filter(
        (i) => String(i.status) === String(status),
      );
    }
    if (wardFilter.length > 0) {
      fallbackRows = fallbackRows.filter((i) =>
        wardSet.has(String(i.ward || "").trim()),
      );
    }

    const withCitizenNames = fallbackRows.map((issue) => {
      const citizen = memoryCitizens.find((c) => c.id === issue.citizenId);
      return {
        ...issue,
        citizenName: issue.citizenName || citizen?.name || "Unknown",
      };
    });

    return res.json({ issues: withCitizenNames, total: withCitizenNames.length });
  }
}
