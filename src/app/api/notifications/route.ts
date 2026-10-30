import { NextResponse } from 'next/server';
import type { ApiErrorResponse, NotificationListResponse } from '@/contracts';
import { handleApiError } from '@/server/api-response';
import { getContainer } from '@/server/container';

export async function GET(): Promise<NextResponse<NotificationListResponse | ApiErrorResponse>> {
  try {
    const { notificationService } = await getContainer();
    await notificationService.runReminderTickIfStale(15_000);
    const result = await notificationService.listNotifications();
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
