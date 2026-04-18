import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import {
  citizens as memoryCitizens,
  issues as memoryIssues,
  officers as memoryOfficers,
} from "../../../../data/store.js";
import {
  sendOfficerAssignmentEmail,
  sendStatusUpdateEmail,
} from "../../../../lib/email.js";
import { createNotification } from "../../../../lib/notifications.js";

const DONE_STATUSES = new Set(["fixed", "resolved"]);

function nowIso(): string {
  return new Date().toISOString();
}

export default async function handler(req: Request, res: Response) {
  const ticketId = String(req.params.ticketId || "").trim();
  const { status, note, updatedBy } = req.body || {};

  const newStatus = String(status || "").trim();
  const updateNote = String(note || "").trim();
  const updater = String(updatedBy || "Officer").trim();

  if (!ticketId || !newStatus) {
    return res.status(400).json({ error: "ticketId and status are required" });
  }

  const timestamp = nowIso();

  try {
    const [{ db }, { issues, citizens, officers }] = await Promise.all([
      import("../../../../db/client.js"),
      import("../../../../db/schema.js"),
    ]);

    const rows = await db
      .select()
      .from(issues)
      .where(eq(issues.ticketId, ticketId))
      .limit(1);

    const issue = rows[0];
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    const history = Array.isArray(issue.statusHistory)
      ? [...issue.statusHistory]
      : [];

    history.push({
      status: newStatus,
      note: updateNote,
      updatedBy: updater,
      timestamp,
    });

    let assignedOfficerId: string | undefined;

    if (newStatus === "assigned" && issue.ward && issue.department) {
      const candidates = await db
        .select({ id: officers.id, employeeId: officers.employeeId, email: officers.email, name: officers.name })
        .from(officers)
        .where(eq(officers.department, issue.department));

      const target = candidates[0];
      if (target) {
        assignedOfficerId = `o${target.id}`;
        if (target.email) {
          sendOfficerAssignmentEmail({
            toEmail: target.email,
            toName: target.name,
            ticketId,
            issueTitle: issue.title,
            ward: issue.ward,
            address: issue.address,
          }).catch(() => undefined);
        }
      }
    }

    await db
      .update(issues)
      .set({
        status: newStatus,
        updatedAt: new Date(timestamp),
        statusHistory: history,
      })
      .where(eq(issues.ticketId, ticketId));

    const citizenRows = await db
      .select({ id: citizens.id, name: citizens.name, email: citizens.email })
      .from(citizens)
      .where(eq(citizens.id, issue.citizenId))
      .limit(1);

    const citizen = citizenRows[0];

    if (citizen) {
      createNotification({
        userType: "citizen",
        userId: `c${citizen.id}`,
        ticketId,
        title: "Issue Status Updated",
        message: `${issue.title} is now ${newStatus.replace(/_/g, " ")}.`,
        type: DONE_STATUSES.has(newStatus) ? "resolved" : "status_update",
      });

      if (DONE_STATUSES.has(newStatus) && citizen.email) {
        sendStatusUpdateEmail({
          toEmail: citizen.email,
          toName: citizen.name,
          ticketId,
          issueTitle: issue.title,
          newStatus,
          note: updateNote,
          updatedBy: updater,
          updatedAt: timestamp,
        }).catch(() => undefined);
      }
    }

    if (assignedOfficerId) {
      createNotification({
        userType: "officer",
        userId: assignedOfficerId,
        ticketId,
        title: "Issue Assigned",
        message: `${issue.title} has been assigned to you.`,
        type: "assignment",
      });
    }

    return res.json({ success: true });
  } catch {
    const issue = memoryIssues.find((i) => i.ticketId === ticketId);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    issue.status = newStatus as typeof issue.status;
    issue.updatedAt = timestamp;
    issue.statusHistory.push({
      status: newStatus as typeof issue.status,
      note: updateNote,
      updatedBy: updater,
      timestamp,
    });

    if (newStatus === "assigned") {
      const assignedOfficer = memoryOfficers.find(
        (o) => o.department === issue.department && o.assignedWards.includes(issue.ward),
      );

      if (assignedOfficer) {
        issue.assignedOfficerId = assignedOfficer.id;
        createNotification({
          userType: "officer",
          userId: assignedOfficer.id,
          ticketId,
          title: "New Issue Assigned",
          message: `${issue.title} has been assigned in ${issue.ward}.`,
          type: "assignment",
        });

        if (assignedOfficer.email) {
          sendOfficerAssignmentEmail({
            toEmail: assignedOfficer.email,
            toName: assignedOfficer.name,
            ticketId,
            issueTitle: issue.title,
            ward: issue.ward,
            address: issue.address,
          }).catch(() => undefined);
        }
      }
    }

    const citizen = memoryCitizens.find((c) => c.id === issue.citizenId);
    if (citizen) {
      createNotification({
        userType: "citizen",
        userId: citizen.id,
        ticketId,
        title: "Issue Status Updated",
        message: `${issue.title} is now ${newStatus.replace(/_/g, " ")}.`,
        type: DONE_STATUSES.has(newStatus) ? "resolved" : "status_update",
      });

      if (DONE_STATUSES.has(newStatus) && citizen.email) {
        sendStatusUpdateEmail({
          toEmail: citizen.email,
          toName: citizen.name,
          ticketId,
          issueTitle: issue.title,
          newStatus,
          note: updateNote,
          updatedBy: updater,
          updatedAt: timestamp,
        }).catch(() => undefined);
      }
    }

    return res.json({ success: true, issue });
  }
}
