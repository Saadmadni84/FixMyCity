import type { Request, Response } from "express";
import { verifyEmailTransport } from "../../../lib/email.js";

export default async function handler(_req: Request, res: Response) {
  try {
    await verifyEmailTransport();
    return res.json({ ok: true, message: "SMTP transport is configured and reachable." });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "SMTP verification failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
