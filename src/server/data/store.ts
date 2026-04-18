// In-memory data store for FixMyCity platform
export type IssueStatus =
  | "reported"
  | "submitted"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "fixed"
  | "resolved"
  | "rejected";
export type IssueCategory =
  | "streetlight"
  | "damaged_wall"
  | "park"
  | "drainage"
  | "road"
  | "garbage"
  | "water_supply"
  | "other";
export type Department =
  | "electricity"
  | "civil_works"
  | "horticulture"
  | "drainage"
  | "sanitation"
  | "water";

export interface Issue {
  id: string;
  ticketId: string;
  citizenId: string;
  citizenName: string;
  category: IssueCategory;
  title: string;
  description: string;
  address: string;
  ward: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  status: IssueStatus;
  department: Department;
  assignedOfficerId?: string;
  priority: "low" | "medium" | "high";
  pointsAwarded: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  statusHistory: {
    status: IssueStatus;
    note: string;
    timestamp: string;
    updatedBy: string;
  }[];
}

export interface Citizen {
  id: string;
  uid: string; // Unique Citizen ID
  name: string;
  phone: string;
  email: string;
  ward: string;
  passwordHash: string;
  points: number;
  reportsCount: number;
  verifiedReports: number;
  badges: string[];
  createdAt: string;
}

export interface Officer {
  id: string;
  name: string;
  employeeId: string;
  department: Department;
  assignedWards: string[];
  role: "officer" | "supervisor" | "admin";
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userType: "citizen" | "officer";
  userId: string;
  ticketId: string;
  title: string;
  message: string;
  type: "assignment" | "status_update" | "resolved";
  isRead: boolean;
  createdAt: string;
}

// Seed data
export const citizens: Citizen[] = [
  {
    id: "c1",
    uid: "UID-2024-001234",
    name: "Rahul Sharma",
    phone: "9876543210",
    email: "rahul.sharma@example.com",
    ward: "Ward 12",
    passwordHash: "citizen123",
    points: 340,
    reportsCount: 18,
    verifiedReports: 15,
    badges: ["Welcome Badge", "Active Reporter"],
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "c2",
    uid: "UID-2024-005678",
    name: "Priya Patel",
    phone: "9123456789",
    email: "priya.patel@example.com",
    ward: "Ward 7",
    passwordHash: "citizen123",
    points: 120,
    reportsCount: 7,
    verifiedReports: 6,
    badges: ["Welcome Badge"],
    createdAt: "2024-03-20T10:00:00Z",
  },
];

export const officers: Officer[] = [
  {
    id: "o1",
    name: "Suresh Kumar",
    employeeId: "EMP-2023-0042",
    department: "electricity",
    assignedWards: ["Ward 12", "Ward 9"],
    role: "officer",
    email: "suresh.kumar@nagarnigam.gov.in",
    passwordHash: "officer123",
    createdAt: "2023-06-01T10:00:00Z",
  },
  {
    id: "o2",
    name: "Anita Singh",
    employeeId: "EMP-2023-0078",
    department: "drainage",
    assignedWards: ["Ward 7", "Ward 3"],
    role: "supervisor",
    email: "anita.singh@nagarnigam.gov.in",
    passwordHash: "officer123",
    createdAt: "2023-06-01T10:00:00Z",
  },
  {
    id: "o3",
    name: "Vikram Rao",
    employeeId: "EMP-2022-0015",
    department: "civil_works",
    assignedWards: ["Ward 12", "Ward 5"],
    role: "officer",
    email: "vikram.rao@nagarnigam.gov.in",
    passwordHash: "officer123",
    createdAt: "2022-04-01T10:00:00Z",
  },
  {
    id: "o4",
    name: "Neha Verma",
    employeeId: "EMP-2024-0104",
    department: "sanitation",
    assignedWards: ["Ward 3", "Ward 4", "Ward 8"],
    role: "officer",
    email: "neha.verma@nagarnigam.gov.in",
    passwordHash: "officer123",
    createdAt: "2024-02-15T10:00:00Z",
  },
  {
    id: "o5",
    name: "Rohit Malhotra",
    employeeId: "EMP-2024-0151",
    department: "water",
    assignedWards: ["Ward 9", "Ward 10", "Ward 19"],
    role: "officer",
    email: "rohit.malhotra@nagarnigam.gov.in",
    passwordHash: "officer123",
    createdAt: "2024-03-10T10:00:00Z",
  },
  {
    id: "o6",
    name: "Kavita Iyer",
    employeeId: "EMP-2024-0188",
    department: "horticulture",
    assignedWards: ["Ward 5", "Ward 6", "Ward 17"],
    role: "officer",
    email: "kavita.iyer@nagarnigam.gov.in",
    passwordHash: "officer123",
    createdAt: "2024-03-25T10:00:00Z",
  },
];

const categoryDeptMap: Record<IssueCategory, Department> = {
  streetlight: "electricity",
  damaged_wall: "civil_works",
  park: "horticulture",
  drainage: "drainage",
  road: "civil_works",
  garbage: "sanitation",
  water_supply: "water",
  other: "civil_works",
};

export const issues: Issue[] = [
  {
    id: "i1",
    ticketId: "FMC-2026-00142",
    citizenId: "c1",
    citizenName: "Rahul Sharma",
    category: "streetlight",
    title: "Broken streetlight near bus stop",
    description:
      "The streetlight near the main bus stop on MG Road has been non-functional for 3 days. It is causing safety issues at night.",
    address: "MG Road, near Bus Stop No. 14",
    ward: "Ward 12",
    latitude: 28.6139,
    longitude: 77.209,
    status: "assigned",
    department: "electricity",
    assignedOfficerId: "o1",
    priority: "high",
    pointsAwarded: 20,
    createdAt: "2026-04-10T08:30:00Z",
    updatedAt: "2026-04-11T14:00:00Z",
    statusHistory: [
      {
        status: "reported",
        note: "Issue reported by citizen",
        timestamp: "2026-04-10T08:30:00Z",
        updatedBy: "Rahul Sharma",
      },
      {
        status: "under_review",
        note: "Verified by department",
        timestamp: "2026-04-10T11:00:00Z",
        updatedBy: "Suresh Kumar",
      },
      {
        status: "assigned",
        note: "Field crew dispatched",
        timestamp: "2026-04-11T14:00:00Z",
        updatedBy: "Suresh Kumar",
      },
    ],
  },
  {
    id: "i2",
    ticketId: "FMC-2026-00138",
    citizenId: "c2",
    citizenName: "Priya Patel",
    category: "drainage",
    title: "Blocked drain causing waterlogging",
    description:
      "The main drain on Nehru Street is completely blocked. Water is stagnating and causing a health hazard.",
    address: "Nehru Street, near Post Office",
    ward: "Ward 7",
    status: "fixed",
    department: "drainage",
    assignedOfficerId: "o2",
    priority: "high",
    pointsAwarded: 20,
    createdAt: "2026-04-05T09:00:00Z",
    updatedAt: "2026-04-09T16:00:00Z",
    resolvedAt: "2026-04-09T16:00:00Z",
    statusHistory: [
      {
        status: "reported",
        note: "Issue reported by citizen",
        timestamp: "2026-04-05T09:00:00Z",
        updatedBy: "Priya Patel",
      },
      {
        status: "under_review",
        note: "Verified",
        timestamp: "2026-04-06T10:00:00Z",
        updatedBy: "Anita Singh",
      },
      {
        status: "assigned",
        note: "Crew assigned",
        timestamp: "2026-04-07T09:00:00Z",
        updatedBy: "Anita Singh",
      },
      {
        status: "fixed",
        note: "Drain cleared and sanitized",
        timestamp: "2026-04-09T16:00:00Z",
        updatedBy: "Anita Singh",
      },
    ],
  },
  {
    id: "i3",
    ticketId: "FMC-2026-00155",
    citizenId: "c1",
    citizenName: "Rahul Sharma",
    category: "road",
    title: "Large pothole on main road",
    description:
      "A very large pothole has developed on the main road near the school. Two vehicles have already been damaged.",
    address: "Station Road, near Govt. School",
    ward: "Ward 12",
    status: "under_review",
    department: "civil_works",
    priority: "medium",
    pointsAwarded: 10,
    createdAt: "2026-04-13T07:00:00Z",
    updatedAt: "2026-04-13T12:00:00Z",
    statusHistory: [
      {
        status: "reported",
        note: "Issue reported by citizen",
        timestamp: "2026-04-13T07:00:00Z",
        updatedBy: "Rahul Sharma",
      },
      {
        status: "under_review",
        note: "Under review by Civil Works",
        timestamp: "2026-04-13T12:00:00Z",
        updatedBy: "Vikram Rao",
      },
    ],
  },
  {
    id: "i4",
    ticketId: "FMC-2026-00129",
    citizenId: "c2",
    citizenName: "Priya Patel",
    category: "garbage",
    title: "Garbage overflow near market",
    description:
      "Garbage bins near the central market are overflowing and not being cleared regularly.",
    address: "Central Market Road, near Gate 2",
    ward: "Ward 3",
    status: "in_progress",
    department: "sanitation",
    assignedOfficerId: "o2",
    priority: "medium",
    pointsAwarded: 10,
    createdAt: "2026-04-12T08:15:00Z",
    updatedAt: "2026-04-13T10:30:00Z",
    statusHistory: [
      {
        status: "reported",
        note: "Issue reported by citizen",
        timestamp: "2026-04-12T08:15:00Z",
        updatedBy: "Priya Patel",
      },
      {
        status: "under_review",
        note: "Sanitation team notified",
        timestamp: "2026-04-12T11:40:00Z",
        updatedBy: "Anita Singh",
      },
      {
        status: "in_progress",
        note: "Cleanup crew started work",
        timestamp: "2026-04-13T10:30:00Z",
        updatedBy: "Anita Singh",
      },
    ],
  },
  {
    id: "i5",
    ticketId: "FMC-2026-00118",
    citizenId: "c1",
    citizenName: "Rahul Sharma",
    category: "water_supply",
    title: "Water pipe leaking on MG Road",
    description:
      "A municipal water pipeline has a visible leak and is wasting water continuously.",
    address: "MG Road, opposite Community Hall",
    ward: "Ward 9",
    status: "submitted",
    department: "water",
    priority: "medium",
    pointsAwarded: 10,
    createdAt: "2026-04-11T06:45:00Z",
    updatedAt: "2026-04-11T06:45:00Z",
    statusHistory: [
      {
        status: "submitted",
        note: "Issue reported by citizen",
        timestamp: "2026-04-11T06:45:00Z",
        updatedBy: "Rahul Sharma",
      },
    ],
  },
  {
    id: "i6",
    ticketId: "FMC-2026-00101",
    citizenId: "c1",
    citizenName: "Rahul Sharma",
    category: "park",
    title: "Park benches damaged in Sector 4",
    description:
      "Multiple benches in the local park are broken and unsafe for public use.",
    address: "Sector 4 Public Park",
    ward: "Ward 5",
    status: "fixed",
    department: "horticulture",
    assignedOfficerId: "o3",
    priority: "low",
    pointsAwarded: 10,
    createdAt: "2026-04-08T07:10:00Z",
    updatedAt: "2026-04-10T17:20:00Z",
    resolvedAt: "2026-04-10T17:20:00Z",
    statusHistory: [
      {
        status: "reported",
        note: "Issue reported by citizen",
        timestamp: "2026-04-08T07:10:00Z",
        updatedBy: "Rahul Sharma",
      },
      {
        status: "assigned",
        note: "Maintenance team assigned",
        timestamp: "2026-04-09T09:00:00Z",
        updatedBy: "Vikram Rao",
      },
      {
        status: "fixed",
        note: "Benches repaired and repainted",
        timestamp: "2026-04-10T17:20:00Z",
        updatedBy: "Vikram Rao",
      },
    ],
  },
];

let issueCounter = 156;
export function generateTicketId(): string {
  return `FMC-2026-${String(issueCounter++).padStart(5, "0")}`;
}

let notificationCounter = 1;
export const notifications: Notification[] = [];

export function nextNotificationId(): string {
  return `n${notificationCounter++}`;
}

export function getCategoryDept(category: IssueCategory): Department {
  return categoryDeptMap[category];
}
