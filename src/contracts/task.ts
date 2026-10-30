import { z } from 'zod';

export const prioritySchema = z.enum(['urgent', 'normal', 'optional']);
export type Priority = z.infer<typeof prioritySchema>;

export const taskStatusSchema = z.enum(['active', 'completed']);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const scheduledDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected date in YYYY-MM-DD format');

export const isoInstantSchema = z.string().datetime({ offset: true });

export const taskRecordSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  description: z.string().max(2000),
  priority: prioritySchema,
  pinned: z.boolean(),
  deadlineAt: isoInstantSchema,
  scheduledDate: scheduledDateSchema.nullable(),
  status: taskStatusSchema,
  completedAt: isoInstantSchema.nullable(),
  reminderAt: isoInstantSchema.nullable(),
  createdAt: isoInstantSchema,
  updatedAt: isoInstantSchema,
});

export type TaskRecord = z.infer<typeof taskRecordSchema>;

export const taskQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  priority: prioritySchema.optional(),
  scheduledDate: scheduledDateSchema.nullable().optional(),
  scheduledFrom: scheduledDateSchema.optional(),
  scheduledTo: scheduledDateSchema.optional(),
  deadlineFrom: isoInstantSchema.optional(),
  deadlineTo: isoInstantSchema.optional(),
  search: z.string().trim().max(200).optional(),
});

export type TaskQuery = z.infer<typeof taskQuerySchema>;
