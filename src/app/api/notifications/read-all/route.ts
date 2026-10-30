import { NextResponse } from 'next/server';
import type { ApiErrorResponse } from '@/contracts';
import { handleApiError } from '@/server/api-response';
import { getContainer } from '@/server/container';

export async function POST(): Promise<
  NextResponse<{ ok: true; updatedCount: number } | ApiErrorResponse>
> {
  try {
    const { notificationService } = await getContainer();
    const { updatedCount } = await notificationService.markAllRead();
    return NextResponse.json({ ok: true, updatedCount }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
