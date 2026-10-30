import { NextResponse } from 'next/server';
import { healthResponseSchema, type ApiErrorResponse, type HealthResponse } from '@/contracts';
import { handleApiError } from '@/server/api-response';
import { getContainer } from '@/server/container';

export async function GET(): Promise<NextResponse<HealthResponse | ApiErrorResponse>> {
  try {
    const container = await getContainer();
    const health = healthResponseSchema.parse(await container.getHealth());
    return NextResponse.json(health, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
