import { z } from 'zod';

// ───────────────────────────────────────────
// Enums
// ───────────────────────────────────────────

export const TaskStatus = z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const Priority = z.enum(['low', 'medium', 'high', 'urgent']);
export type Priority = z.infer<typeof Priority>;

export const ViewMode = z.enum(['list', 'board', 'calendar', 'burst']);
export type ViewMode = z.infer<typeof ViewMode>;

export const ThemeMode = z.enum(['light', 'dark', 'system']);
export type ThemeMode = z.infer<typeof ThemeMode>;

// ───────────────────────────────────────────
// Task
// ───────────────────────────────────────────

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  projectId: z.string().uuid().nullable(),
  status: TaskStatus,
  priority: Priority,
  dueDate: z.string().datetime().nullable(), // ISO 8601
  estimatedMinutes: z.number().int().min(1).max(480).nullable(), // Burst Mode
  isMIT: z.boolean().default(false), // Most Important Task
  tags: z.array(z.string()).default([]),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Task = z.infer<typeof TaskSchema>;

// ───────────────────────────────────────────
// Project
// ───────────────────────────────────────────

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366F1'),
  archived: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Project = z.infer<typeof ProjectSchema>;

// ───────────────────────────────────────────
// JournalEntry
// ───────────────────────────────────────────

export const JournalEntrySchema = z.object({
  id: z.string().uuid(),
  date: z.string().date(), // YYYY-MM-DD
  mood: z.number().int().min(1).max(5).nullable(),
  energy: z.number().int().min(1).max(5).nullable(),
  wins: z.array(z.string()).default([]),
  blockers: z.array(z.string()).default([]),
  freeText: z.string().max(10000).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type JournalEntry = z.infer<typeof JournalEntrySchema>;

// ───────────────────────────────────────────
// UserPreferences
// ───────────────────────────────────────────

export const UserPreferencesSchema = z.object({
  id: z.string().default('user-preferences'), // singleton
  theme: ThemeMode.default('system'),
  defaultView: ViewMode.default('list'),
  burstTargetMinutes: z.number().int().min(15).max(240).default(90),
  soundEnabled: z.boolean().default(true),
  // Gamification
  totalTasksCompleted: z.number().int().default(0),
  totalFocusMinutes: z.number().int().default(0),
  currentStreakDays: z.number().int().default(0),
  longestStreakDays: z.number().int().default(0),
  lastActiveDate: z.string().date().nullable(),
  level: z.number().int().min(1).default(1),
  xp: z.number().int().min(0).default(0),
  updatedAt: z.string().datetime(),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
