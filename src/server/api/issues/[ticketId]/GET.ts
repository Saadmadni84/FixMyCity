import type { Request, Response } from "express";
import { issues as memoryIssues } from "../../../data/store.js";

function normalizeStatus(status: string): string {
  // UI flow expects "submitted" instead of legacy "reported".
  return status === "reported" ? "submitted" : status;
}

function getFallbackIssue(ticketId: string) {
  const issue = memoryIssues.find(
    (i) => i.ticketId.toLowerCase() === ticketId.toLowerCase(),
  );
  if (!issue) return null;

  return {
    ...issue,
    status: normalizeStatus(issue.status),
    statusHistory: issue.statusHistory.map((h) => ({
      ...h,
      status: normalizeStatus(h.status),
    })),
  };
}

export default async function handler(req: Request, res: Response) {
  const rawTicketId = req.params.ticketId;
  const ticketId =
    typeof rawTicketId === "string"
      ? rawTicketId.trim()
      : Array.isArray(rawTicketId)
        ? (rawTicketId[0] || "").trim()
        : "";
  if (!ticketId) return res.status(400).json({ error: "Ticket ID is required" });

  // Serve demo/seeded in-memory data first so tracking works even when DB
  // config is unavailable in local/dev preview environments.
  const fallbackIssue = getFallbackIssue(ticketId);
  if (fallbackIssue) return res.json({ issue: fallbackIssue });

  try {
    const [{ db }, { issues, citizens }, { eq }] = await Promise.all([
      import("../../../db/client.js"),
      import("../../../db/schema.js"),
      import("drizzle-orm"),
    ]);

    const rows = await db
      .select()
      .from(issues)
      .where(eq(issues.ticketId, ticketId))
      .limit(1);
    if (!rows[0]) return res.status(404).json({ error: "Issue not found" });

    const issue = rows[0];
    const citizenRows = await db
      .select({ name: citizens.name })
      .from(citizens)
      .where(eq(citizens.id, issue.citizenId))
      .limit(1);

    res.json({
      issue: {
        ...issue,
        status: normalizeStatus(issue.status),
        citizenName: citizenRows[0]?.name || "Unknown",
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch issue", message: String(error) });
  }
}
