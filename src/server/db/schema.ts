import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  json,
  double,
} from "drizzle-orm/mysql-core";

// ── Citizens ─────────────────────────────────────────────────────────────────
export const citizens = mysqlTable("citizens", {
  id: int("id").primaryKey().autoincrement(),
  uid: varchar("uid", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().default(""),
  ward: varchar("ward", { length: 100 }).notNull().default(""),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  points: int("points").notNull().default(0),
  reportsCount: int("reports_count").notNull().default(0),
  verifiedReports: int("verified_reports").notNull().default(0),
  badges: json("badges").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Officers ──────────────────────────────────────────────────────────────────
export const officers = mysqlTable("officers", {
  id: int("id").primaryKey().autoincrement(),
  employeeId: varchar("employee_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("officer"),
  email: varchar("email", { length: 255 }).notNull().default(""),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Issues ────────────────────────────────────────────────────────────────────
export const issues = mysqlTable("issues", {
  id: int("id").primaryKey().autoincrement(),
  ticketId: varchar("ticket_id", { length: 30 }).notNull().unique(),
  citizenId: int("citizen_id").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  ward: varchar("ward", { length: 100 }).notNull().default(""),
  status: varchar("status", { length: 50 }).notNull().default("submitted"),
  department: varchar("department", { length: 100 })
    .notNull()
    .default("General"),
  pointsAwarded: int("points_awarded").notNull().default(10),
  photoCount: int("photo_count").notNull().default(0),
  latitude: double("latitude"),
  longitude: double("longitude"),
  statusHistory: json("status_history")
    .$type<
      Array<{
        status: string;
        note: string;
        updatedBy: string;
        timestamp: string;
      }>
    >()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
