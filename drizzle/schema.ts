import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const resumes = mysqlTable("resumes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  candidateName: varchar("candidateName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  // Raw extracted data
  rawText: text("rawText"),
  // Normalized data before AI processing
  habilidadesBrutas: text("habilidadesBrutas"), // JSON array
  experienciasBrutas: text("experienciasBrutas"), // JSON array
  // AI processed data
  resumoHabilidades: text("resumoHabilidades"), // JSON array
  experienciasResumidas: text("experienciasResumidas"), // JSON array
  // Processing status
  status: mysqlEnum("status", ["pending", "extracting", "normalizing", "processing", "completed", "error"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  // Metadata
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = typeof resumes.$inferInsert;

export const processingLogs = mysqlTable("processingLogs", {
  id: int("id").autoincrement().primaryKey(),
  resumeId: int("resumeId").notNull().references(() => resumes.id),
  step: varchar("step", { length: 50 }).notNull(), // extraction, normalization, ai_processing, validation
  status: mysqlEnum("status", ["started", "completed", "failed"]).notNull(),
  details: text("details"), // JSON with step-specific data
  duration: int("duration"), // milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProcessingLog = typeof processingLogs.$inferSelect;
export type InsertProcessingLog = typeof processingLogs.$inferInsert;