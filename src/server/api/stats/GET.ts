import type { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  try {
    const [{ db }, { issues, citizens }] = await Promise.all([
      import("../../db/client.js"),
      import("../../db/schema.js"),
    ]);

    const allIssues = await db.select().from(issues);
    const allCitizens = await db.select({ id: citizens.id }).from(citizens);

    const total = allIssues.length;
    const resolved = allIssues.filter(
      (i) => i.status === "fixed" || i.status === "resolved",
    ).length;
    const inProgress = allIssues.filter((i) =>
      ["assigned", "under_review", "in_progress"].includes(i.status),
    ).length;
    const submitted = allIssues.filter((i) => i.status === "submitted").length;

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    res.json({
      totalIssues: total,
      resolvedIssues: resolved,
      inProgressIssues: inProgress,
      submittedIssues: submitted,
      totalCitizens: allCitizens.length,
      resolutionRate,
      avgResolutionDays: 3,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch stats", message: String(error) });
  }
}
