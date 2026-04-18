import type { Request, Response } from "express";
import { listNotifications } from "../../lib/notifications.js";

export default async function handler(req: Request, res: Response) {
  const userType = String(req.query.userType || "").trim();
  const userId = String(req.query.userId || "").trim();

  if (!userType || !userId) {
    return res.status(400).json({ error: "userType and userId are required" });
  }

  const items = listNotifications(userType, userId);
  const unread = items.filter((n) => !n.isRead).length;

  return res.json({ notifications: items, unread });
}
