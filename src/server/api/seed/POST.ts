import type { Request, Response } from "express";

export default async function handler(_req: Request, res: Response) {
  try {
    const [{ db }, { citizens, officers, issues }] = await Promise.all([
      import("../../db/client.js"),
      import("../../db/schema.js"),
    ]);

    // Check if already seeded
    const existingCitizens = await db.select().from(citizens).limit(1);
    if (existingCitizens.length > 0) {
      return res.json({ success: true, message: "Already seeded" });
    }

    // Seed citizens
    await db.insert(citizens).values([
      {
        uid: "UID-2024-001234",
        name: "Rahul Sharma",
        phone: "9876543210",
        email: "rahul.sharma@example.com",
        ward: "Ward 12",
        passwordHash: "citizen123",
        points: 340,
        reportsCount: 18,
        verifiedReports: 15,
        badges: ["Welcome Badge", "Active Reporter", "Community Champion"],
      },
      {
        uid: "UID-2024-005678",
        name: "Priya Patel",
        phone: "9123456789",
        email: "priya.patel@example.com",
        ward: "Ward 7",
        passwordHash: "citizen123",
        points: 120,
        reportsCount: 7,
        verifiedReports: 6,
        badges: ["Welcome Badge", "Active Reporter"],
      },
    ]);

    // Seed officers
    await db.insert(officers).values([
      {
        employeeId: "EMP-2023-0042",
        name: "Suresh Kumar",
        department: "Electricity",
        role: "officer",
        email: "suresh.kumar@nagarnigam.gov.in",
        passwordHash: "officer123",
      },
      {
        employeeId: "EMP-2023-0078",
        name: "Anita Singh",
        department: "Drainage",
        role: "supervisor",
        email: "anita.singh@nagarnigam.gov.in",
        passwordHash: "officer123",
      },
      {
        employeeId: "EMP-2022-0015",
        name: "Vikram Rao",
        department: "Civil Works",
        role: "officer",
        email: "vikram.rao@nagarnigam.gov.in",
        passwordHash: "officer123",
      },
    ]);

    // Seed sample issues (citizenId 1 = Rahul, 2 = Priya)
    await db.insert(issues).values([
      {
        ticketId: "FMC-2026-00142",
        citizenId: 1,
        category: "streetlight",
        title: "Broken streetlight near bus stop",
        description:
          "The streetlight near the main bus stop on MG Road has been non-functional for 3 days. It is causing safety issues at night.",
        address: "MG Road, near Bus Stop No. 14",
        ward: "Ward 12",
        status: "assigned",
        department: "Electricity",
        pointsAwarded: 20,
        photoCount: 0,
        statusHistory: [
          {
            status: "submitted",
            note: "Issue reported by citizen",
            updatedBy: "Rahul Sharma",
            timestamp: "2026-04-10T08:30:00Z",
          },
          {
            status: "under_review",
            note: "Verified by department",
            updatedBy: "Suresh Kumar",
            timestamp: "2026-04-10T11:00:00Z",
          },
          {
            status: "assigned",
            note: "Field crew dispatched",
            updatedBy: "Suresh Kumar",
            timestamp: "2026-04-11T14:00:00Z",
          },
        ],
      },
      {
        ticketId: "FMC-2026-00138",
        citizenId: 2,
        category: "drainage",
        title: "Blocked drain causing waterlogging",
        description:
          "The main drain on Nehru Street is completely blocked. Water is stagnating and causing a health hazard.",
        address: "Nehru Street, near Post Office",
        ward: "Ward 7",
        status: "fixed",
        department: "Drainage",
        pointsAwarded: 20,
        photoCount: 0,
        statusHistory: [
          {
            status: "submitted",
            note: "Issue reported by citizen",
            updatedBy: "Priya Patel",
            timestamp: "2026-04-05T09:00:00Z",
          },
          {
            status: "under_review",
            note: "Verified",
            updatedBy: "Anita Singh",
            timestamp: "2026-04-06T10:00:00Z",
          },
          {
            status: "assigned",
            note: "Crew assigned",
            updatedBy: "Anita Singh",
            timestamp: "2026-04-07T09:00:00Z",
          },
          {
            status: "fixed",
            note: "Drain cleared and sanitized",
            updatedBy: "Anita Singh",
            timestamp: "2026-04-09T16:00:00Z",
          },
        ],
      },
      {
        ticketId: "FMC-2026-00155",
        citizenId: 1,
        category: "road",
        title: "Large pothole on main road",
        description:
          "A very large pothole has developed on the main road near the school. Two vehicles have already been damaged.",
        address: "Station Road, near Govt. School",
        ward: "Ward 12",
        status: "under_review",
        department: "Civil Works",
        pointsAwarded: 10,
        photoCount: 0,
        statusHistory: [
          {
            status: "submitted",
            note: "Issue reported by citizen",
            updatedBy: "Rahul Sharma",
            timestamp: "2026-04-13T07:00:00Z",
          },
          {
            status: "under_review",
            note: "Under review by Civil Works",
            updatedBy: "Vikram Rao",
            timestamp: "2026-04-13T12:00:00Z",
          },
        ],
      },
    ]);

    res.json({ success: true, message: "Demo data seeded successfully" });
  } catch (error) {
    res.status(500).json({ error: "Seeding failed", message: String(error) });
  }
}
