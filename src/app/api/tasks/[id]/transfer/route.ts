import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { transferTaskInputSchema, type ApiErrorResponse, type TaskDto } from '@/contracts';
import { handleApiError } from '@/server/api-response';
import { getContainer } from '@/server/container';

const idSchema = z.string().uuid('Invalid task id');

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<{ item: TaskDto } | ApiErrorResponse>> {
  try {
    const { id } = await context.params;
    const taskId = idSchema.parse(id);
    const body: unknown = await request.json();
    const input = transferTaskInputSchema.parse(body);
    const { taskService } = await getContainer();
    const item = await taskService.transferTask(taskId, input);
    return NextResponse.json({ item }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
