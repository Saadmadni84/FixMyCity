import type { Request, Response } from "express";
import {
  sendOfficerAssignmentEmail,
  sendStatusUpdateEmail,
} from "../../lib/email.js";
import { inferWardFromText } from "../../../lib/area-ward.js";
import { normalizeWard } from "../../../lib/wards.js";
import { createNotification } from "../../lib/notifications.js";
import {
  issues as memoryIssues,
  citizens as memoryCitizens,
  officers as memoryOfficers,
  getCategoryDept,
  type IssueCategory,
  type IssueStatus,
  type Department,
} from "../../data/store.js";

const categoryDeptMap: Record<string, string> = {
  streetlight: "Electricity",
  damaged_wall: "Civil Works",
  park: "Horticulture",
  drainage: "Drainage",
  road: "Civil Works",
  garbage: "Sanitation",
  water_supply: "Water Supply",
  other: "General",
};

function generateTicketId(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(10000 + Math.random() * 90000);
  return `FMC-${year}-${num}`;
}

async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "FixMyCity/1.0" },
    });
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    /* ignore geocoding errors */
  }
  return null;
}

function nextMemoryIssueId(): string {
  const max = memoryIssues.reduce((acc, issue) => {
    const n = Number(String(issue.id).replace(/^i/i, ""));
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `i${max + 1}`;
}

function toMemoryCitizenId(rawCitizenId: unknown): string {
  const value = String(rawCitizenId || "").trim();
  if (!value) return "";
  if (value.startsWith("c")) return value;
  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && asNumber > 0) return `c${asNumber}`;
  return value;
}

function isIssueCategory(value: string): value is IssueCategory {
  return [
    "streetlight",
    "damaged_wall",
    "park",
    "drainage",
    "road",
    "garbage",
    "water_supply",
    "other",
  ].includes(value);
}

function findMatchingOfficerId(department: Department, ward: string): string | undefined {
  const wardValue = String(ward || "").trim();
  const departmentOfficers = memoryOfficers.filter(
    (officer) => officer.department === department,
  );

  if (departmentOfficers.length === 0) return undefined;

  if (wardValue) {
    const wardOfficer = departmentOfficers.find((officer) =>
      officer.assignedWards.includes(wardValue),
    );
    if (wardOfficer) return wardOfficer.id;
  }

  return departmentOfficers[0]?.id;
}

export default async function handler(req: Request, res: Response) {
  const {
    citizenId,
    category,
    title,
    description,
    address,
    area,
    ward,
    photoCount,
  } = req.body || {};

  if (!citizenId || !category || !title || !description || !address) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const hasPhotos = (photoCount || 0) > 0;
  const pointsAwarded = hasPhotos ? 20 : 10;
  const ticketId = generateTicketId();
  const now = new Date().toISOString();
  const combinedLocationText = [String(area || ""), String(address || "")]
    .filter(Boolean)
    .join(" ");
  const resolvedWard =
    normalizeWard(ward) || inferWardFromText(combinedLocationText) || "";

  // Geocode address in background (don't block submission)
  const coords = await geocodeAddress(String(address));

  const initialHistory = [
    {
      status: "submitted",
      note: "Issue reported by citizen",
      updatedBy: "System",
      timestamp: now,
    },
  ];

  try {
    const [{ db }, { issues, citizens }, { eq }] = await Promise.all([
      import("../../db/client.js"),
      import("../../db/schema.js"),
      import("drizzle-orm"),
    ]);

    const department = categoryDeptMap[category] || "General";

    const result = await db.insert(issues).values({
      ticketId,
      citizenId: Number(citizenId),
      category,
      title,
      description,
      address,
      ward: resolvedWard,
      status: "submitted",
      department,
      pointsAwarded,
      photoCount: photoCount || 0,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      statusHistory: initialHistory,
    });

    const insertId = Number(result[0].insertId);
    const rows = await db
      .select()
      .from(issues)
      .where(eq(issues.id, insertId))
      .limit(1);

    // Update citizen points and report count
    const citizenRows = await db
      .select()
      .from(citizens)
      .where(eq(citizens.id, Number(citizenId)))
      .limit(1);
    if (citizenRows[0]) {
      const c = citizenRows[0];
      const newPoints = c.points + pointsAwarded;
      const newCount = c.reportsCount + 1;
      const newBadges = [...(c.badges || [])];
      if (newCount >= 5 && !newBadges.includes("Active Reporter"))
        newBadges.push("Active Reporter");
      if (newCount >= 10 && !newBadges.includes("Community Champion"))
        newBadges.push("Community Champion");
      if (newPoints >= 100 && !newBadges.includes("Point Collector"))
        newBadges.push("Point Collector");
      await db
        .update(citizens)
        .set({ points: newPoints, reportsCount: newCount, badges: newBadges })
        .where(eq(citizens.id, Number(citizenId)));

      // Send submission confirmation email (fire-and-forget)
      if (c.email) {
        sendStatusUpdateEmail({
          toEmail: c.email,
          toName: c.name,
          ticketId,
          issueTitle: title,
          newStatus: "submitted",
          note: "Your issue has been received and will be reviewed shortly.",
          updatedBy: "FixMyCity System",
          updatedAt: now,
        }).catch((err) => {
          console.error(
            `[email] Failed to send submission confirmation for ${ticketId}:`,
            err.message,
          );
        });
      }
    }

    res.status(201).json({ success: true, issue: rows[0] });
  } catch (error) {
    // Fallback for local/dev environments without DB config.
    const memoryCitizenId = toMemoryCitizenId(citizenId);
    const memoryCitizen = memoryCitizens.find((c) => c.id === memoryCitizenId);
    const fallbackCitizenId = memoryCitizen?.id || memoryCitizenId || "c0";
    const fallbackCitizenName = memoryCitizen?.name || "Citizen User";

    const categoryValue = String(category || "").trim();
    const normalizedCategory: IssueCategory = isIssueCategory(categoryValue)
      ? categoryValue
      : "other";
    const department = getCategoryDept(normalizedCategory);
    const wardValue =
      resolvedWard || normalizeWard(memoryCitizen?.ward) || "";
    const assignedOfficerId = findMatchingOfficerId(department, wardValue);
    const assignedOfficer = assignedOfficerId
      ? memoryOfficers.find((o) => o.id === assignedOfficerId)
      : undefined;
    const routedStatus: IssueStatus = assignedOfficerId ? "assigned" : "submitted";

    const initialHistoryTyped: {
      status: IssueStatus;
      note: string;
      updatedBy: string;
      timestamp: string;
    }[] = [
      {
        status: "submitted",
        note: "Issue reported by citizen",
        updatedBy: "System",
        timestamp: now,
      },
    ];

    if (assignedOfficerId) {
      initialHistoryTyped.push({
        status: "assigned",
        note: "Automatically routed to the responsible ward officer",
        updatedBy: "System",
        timestamp: now,
      });
    }

    const memoryIssue = {
      id: nextMemoryIssueId(),
      ticketId,
      citizenId: fallbackCitizenId,
      citizenName: fallbackCitizenName,
      category: normalizedCategory,
      title,
      description,
      address,
      ward: wardValue,
      latitude: coords?.lat,
      longitude: coords?.lng,
      status: routedStatus,
      department,
      assignedOfficerId,
      priority: "medium" as const,
      pointsAwarded,
      createdAt: now,
      updatedAt: now,
      statusHistory: initialHistoryTyped,
    };

    memoryIssues.push(memoryIssue);

    if (assignedOfficer) {
      createNotification({
        userType: "officer",
        userId: assignedOfficer.id,
        ticketId,
        title: "New Issue Assigned",
        message: `${title} has been assigned in ${wardValue || "your coverage area"}.`,
        type: "assignment",
      });

      if (assignedOfficer.email) {
        sendOfficerAssignmentEmail({
          toEmail: assignedOfficer.email,
          toName: assignedOfficer.name,
          ticketId,
          issueTitle: title,
          ward: wardValue,
          address: String(address),
        }).catch((err) => {
          console.error(
            `[email] Failed to send assignment email for ${ticketId}:`,
            err.message,
          );
        });
      }
    }

    if (memoryCitizen) {
      memoryCitizen.points += pointsAwarded;
      memoryCitizen.reportsCount += 1;
      if (memoryCitizen.reportsCount >= 5 && !memoryCitizen.badges.includes("Active Reporter")) {
        memoryCitizen.badges.push("Active Reporter");
      }
      if (memoryCitizen.reportsCount >= 10 && !memoryCitizen.badges.includes("Community Champion")) {
        memoryCitizen.badges.push("Community Champion");
      }
      if (memoryCitizen.points >= 100 && !memoryCitizen.badges.includes("Point Collector")) {
        memoryCitizen.badges.push("Point Collector");
      }
    }

    return res.status(201).json({ success: true, issue: memoryIssue });
  }
}
