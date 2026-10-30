import { z } from 'zod';
import { isoInstantSchema } from './task';

export const notificationKindSchema = z.enum([
  'due_soon',
  'overdue',
  'completed',
  'general',
  'system',
]);
export type NotificationKind = z.infer<typeof notificationKindSchema>;

export const notificationPayloadSchema = z.object({
  title: z.string().optional(),
  message: z.string().optional(),
});
export type NotificationPayload = z.infer<typeof notificationPayloadSchema>;

export const notificationRecordSchema = z.object({
  id: z.string().uuid(),
  kind: notificationKindSchema,
  taskId: z.string().uuid().nullable(),
  dedupeKey: z.string().min(1),
  payload: notificationPayloadSchema.nullable(),
  createdAt: isoInstantSchema,
  readAt: isoInstantSchema.nullable(),
});
export type NotificationRecord = z.infer<typeof notificationRecordSchema>;

export const notificationDtoSchema = z.object({
  id: z.string().uuid(),
  kind: notificationKindSchema,
  tagLabel: z.string(),
  title: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: isoInstantSchema,
  timeLeftMs: z.number().nullable(),
  taskId: z.string().uuid().nullable(),
  targetUrl: z.string().nullable(),
});
export type NotificationDto = z.infer<typeof notificationDtoSchema>;

export const notificationListResponseSchema = z.object({
  items: z.array(notificationDtoSchema),
  unreadCount: z.number().int().nonnegative(),
});
export type NotificationListResponse = z.infer<typeof notificationListResponseSchema>;

export const notificationQuerySchema = z.object({
  taskId: z.string().uuid().optional(),
  kinds: z.array(notificationKindSchema).optional(),
  unreadOnly: z.boolean().optional(),
});
export type NotificationQuery = z.infer<typeof notificationQuerySchema>;

export const notificationDeleteFilterSchema = z.object({
  taskId: z.string().uuid().optional(),
  kinds: z.array(notificationKindSchema).optional(),
  createdAtOnOrBefore: isoInstantSchema.optional(),
});
export type NotificationDeleteFilter = z.infer<typeof notificationDeleteFilterSchema>;
