import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import type { ApiErrorResponse, TaskDto } from '@/contracts';
import { handleApiError } from '@/server/api-response';
import { getContainer } from '@/server/container';

const idSchema = z.string().uuid('Invalid task id');

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  _request: NextRequest,
  context: RouteContext,
): Promise<NextResponse<{ item: TaskDto } | ApiErrorResponse>> {
  try {
    const { id } = await context.params;
    const taskId = idSchema.parse(id);
    const { taskService } = await getContainer();
    const item = await taskService.uncompleteTask(taskId);
    return NextResponse.json({ item }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
