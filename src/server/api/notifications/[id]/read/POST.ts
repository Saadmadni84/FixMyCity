import type { Request, Response } from "express";
import { markNotificationRead } from "../../../../lib/notifications.js";

export default async function handler(req: Request, res: Response) {
  const id = String(req.params.id || "").trim();
  if (!id) return res.status(400).json({ error: "Notification id is required" });

  const updated = markNotificationRead(id);
  if (!updated) return res.status(404).json({ error: "Notification not found" });

  return res.json({ success: true, notification: updated });
}
