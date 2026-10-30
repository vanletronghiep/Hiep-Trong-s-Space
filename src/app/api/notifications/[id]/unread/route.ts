import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import type { ApiErrorResponse, NotificationDto } from '@/contracts';
import { handleApiError } from '@/server/api-response';
import { getContainer } from '@/server/container';

const idSchema = z.string().uuid('Invalid notification id');

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<{ item: NotificationDto } | ApiErrorResponse>> {
  try {
    const { id } = await context.params;
    const notificationId = idSchema.parse(id);
    const { notificationService } = await getContainer();
    const item = await notificationService.markUnread(notificationId);
    return NextResponse.json({ item }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
