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
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must be 120 characters or fewer'),
  description: z.string().max(2000, 'Description must be 2000 characters or fewer'),
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

export const taskDtoSchema = taskRecordSchema.extend({
  isOverdue: z.boolean(),
  isDueSoon: z.boolean(),
  timeLeftMs: z.number(),
});

export type TaskDto = z.infer<typeof taskDtoSchema>;

export const createTaskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(120, 'Title must be 120 characters or fewer.'),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer.')
    .optional()
    .default(''),
  priority: prioritySchema.optional().default('normal'),
  pinned: z.boolean().optional().default(false),
  deadlineAt: isoInstantSchema,
  scheduledDate: scheduledDateSchema.nullable().optional().default(null),
});

export type CreateTaskInput = z.input<typeof createTaskInputSchema>;

export const updateTaskInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required.')
      .max(120, 'Title must be 120 characters or fewer.')
      .optional(),
    description: z.string().max(2000, 'Description must be 2000 characters or fewer.').optional(),
    priority: prioritySchema.optional(),
    pinned: z.boolean().optional(),
    deadlineAt: isoInstantSchema.optional(),
    scheduledDate: scheduledDateSchema.nullable().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'At least one field must be provided for update.',
  });

export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;

export const transferTaskInputSchema = z.object({
  scheduledDate: scheduledDateSchema,
  deadlineAt: isoInstantSchema,
});

export type TransferTaskInput = z.infer<typeof transferTaskInputSchema>;

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
