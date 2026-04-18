import type { Request, Response } from "express";
import {
  issues as memoryIssues,
  citizens as memoryCitizens,
} from "../../data/store.js";

type StatsSourceIssue = {
  status: string;
};

function buildStats(issues: StatsSourceIssue[], citizensCount: number) {
  const total = issues.length;
  const resolved = issues.filter(
    (i) => i.status === "fixed" || i.status === "resolved",
  ).length;
  const inProgress = issues.filter((i) =>
    ["assigned", "under_review", "in_progress"].includes(i.status),
  ).length;
  const submitted = issues.filter((i) => i.status === "submitted").length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return {
    totalIssues: total,
    resolvedIssues: resolved,
    inProgressIssues: inProgress,
    submittedIssues: submitted,
    totalCitizens: citizensCount,
    resolutionRate,
    avgResolutionDays: 3,
  };
}

export default async function handler(req: Request, res: Response) {
  try {
    const [{ db }, { issues, citizens }] = await Promise.all([
      import("../../db/client.js"),
      import("../../db/schema.js"),
    ]);

    const allIssues = await db.select().from(issues);
    const allCitizens = await db.select({ id: citizens.id }).from(citizens);
    res.json(buildStats(allIssues, allCitizens.length));
  } catch (error) {
    console.warn("DB stats query failed, using in-memory fallback:", error);
    res.json(buildStats(memoryIssues, memoryCitizens.length));
  }
}
