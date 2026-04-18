import type { Request, Response } from "express";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Rule-based responses for common civic queries — no API key needed
const FAQ: Array<{ patterns: RegExp[]; answer: string }> = [
  {
    patterns: [/report|submit|how.*issue|raise.*complaint/i],
    answer: `To report an issue:\n1. Click **"Report an Issue"** in the header or homepage\n2. Select the issue category (road, drainage, streetlight, etc.)\n3. Describe the problem and add your location\n4. Optionally attach photos for **2× reward points**\n5. Submit — you'll get a ticket ID instantly!\n\nYou earn **10–20 points** per report. 🏆`,
  },
  {
    patterns: [/track|status|ticket|where.*issue|check.*report/i],
    answer: `To track your issue:\n1. Go to the **Track Status** page (link in the header)\n2. Enter your **Ticket ID** (format: FMC-YYYY-XXXXX)\n3. See the full status timeline — Submitted → Under Review → Assigned → Fixed\n\nYou can also view all your reports in your **Citizen Dashboard**.`,
  },
  {
    patterns: [/reward|point|badge|earn|prize/i],
    answer: `FixMyCity has a **Rewards Program** to recognise active citizens:\n\n🏅 **Points earned:**\n- Report an issue: **10 points**\n- Report with photos: **20 points**\n- Issue verified & resolved: **bonus points**\n\n🎖️ **Badges:**\n- Welcome Badge (on signup)\n- Active Reporter (5+ reports)\n- Community Champion (10+ reports)\n- Point Collector (100+ points)\n\nRedeem points for city service vouchers and recognition certificates!`,
  },
  {
    patterns: [/login|sign.*in|register|account|citizen.*portal/i],
    answer: `There are two portals:\n\n👤 **Citizen Portal** — for residents to report issues and track progress\n- Login with your **UID** (e.g. UID-2024-001234) and password\n- New? Click **"Register"** to create an account in seconds\n\n🏛️ **Officer Portal** — for Nagar Nigam staff only\n- Login with your **Employee ID** and department credentials`,
  },
  {
    patterns: [/map|location|where.*reported|see.*issue/i],
    answer: `You can view all reported issues on the **Live Map** 🗺️\n\n- Click **"Live Map"** in the navigation bar\n- Issues are shown as colour-coded pins by status\n- Filter by category or status\n- Click any pin to see details and track the issue\n\nNew issues are automatically geocoded and appear on the map instantly!`,
  },
  {
    patterns: [
      /department|who.*handle|electricity|drainage|civil|sanitation|water/i,
    ],
    answer: `Issues are routed to the right department automatically:\n\n⚡ **Electricity Dept.** — Streetlights, power issues\n🏗️ **Civil Works** — Roads, potholes, damaged walls\n🌿 **Horticulture** — Parks, gardens, trees\n💧 **Drainage** — Blocked drains, waterlogging\n🗑️ **Sanitation** — Garbage, waste collection\n🚰 **Water Supply** — Leaks, supply disruptions\n\nJust select the right category when reporting and it reaches the correct team!`,
  },
  {
    patterns: [/how long|time|resolve|fix.*when|when.*fix/i],
    answer: `Resolution times vary by issue type:\n\n🟢 **Streetlights** — 1–3 days\n🟡 **Garbage / Sanitation** — 1–2 days\n🟠 **Drainage** — 2–5 days\n🔴 **Road / Pothole** — 3–7 days\n🔵 **Water Supply** — 1–3 days\n\nYou'll receive an **email notification** at every status change. The average resolution time on FixMyCity is **3 days**. ⚡`,
  },
  {
    patterns: [/notification|email|alert|update.*me/i],
    answer: `FixMyCity sends **automatic email notifications** when your issue status changes:\n\n📧 **You'll get emails for:**\n- Issue submission confirmation\n- Status changes (Under Review, Assigned, Fixed)\n- Officer notes and updates\n\nMake sure your email address is up to date in your profile when registering!`,
  },
  {
    patterns: [/hello|hi|namaste|hey|good morning|good evening/i],
    answer: `Namaste! 🙏 Welcome to **FixMyCity**.\n\nI'm the CivicEye Assistant — here to help you with:\n- 📋 Reporting civic issues\n- 🔍 Tracking your complaints\n- 🏆 Understanding the rewards program\n- 🗺️ Using the live issue map\n- 🔐 Login and account help\n\nWhat can I help you with today?`,
  },
  {
    patterns: [/thank|thanks|great|awesome|helpful/i],
    answer: `You're welcome! 😊 Happy to help.\n\nIf you have more questions or need to report an issue, I'm always here. Together, let's make our city better! 🏙️`,
  },
];

const FALLBACK = `I'm not sure about that specific query. Here are some things I can help with:\n\n- **How to report an issue**\n- **Tracking your complaint status**\n- **Reward points and badges**\n- **Login / registration help**\n- **Which department handles what**\n- **Email notifications**\n\nOr visit the [Track Status](/track) page or [Live Map](/map) directly. Is there anything else I can help with?`;

function getResponse(userMessage: string): string {
  for (const faq of FAQ) {
    if (faq.patterns.some((p) => p.test(userMessage))) {
      return faq.answer;
    }
  }
  return FALLBACK;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { message } = req.body as { message: string; history: Message[] };
    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const answer = getResponse(message.trim());
    res.json({ reply: answer });
  } catch (error) {
    res.status(500).json({ error: "Chat failed", message: String(error) });
  }
}
