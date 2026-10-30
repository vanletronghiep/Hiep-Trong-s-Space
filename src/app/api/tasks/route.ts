import { NextResponse, type NextRequest } from 'next/server';
import {
  createTaskInputSchema,
  taskQuerySchema,
  type ApiErrorResponse,
  type TaskDto,
} from '@/contracts';
import { handleApiError } from '@/server/api-response';
import { getContainer } from '@/server/container';

export async function GET(
  request: NextRequest,
): Promise<NextResponse<{ items: TaskDto[] } | ApiErrorResponse>> {
  try {
    const { searchParams } = request.nextUrl;
    const rawScheduledDate = searchParams.get('scheduledDate');

    const query = taskQuerySchema.parse({
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      scheduledDate:
        rawScheduledDate === null
          ? undefined
          : rawScheduledDate === 'null'
            ? null
            : rawScheduledDate || undefined,
      scheduledFrom: searchParams.get('scheduledFrom') || undefined,
      scheduledTo: searchParams.get('scheduledTo') || undefined,
      deadlineFrom: searchParams.get('deadlineFrom') || undefined,
      deadlineTo: searchParams.get('deadlineTo') || undefined,
      search: searchParams.get('search') || undefined,
    });

    const { taskService } = await getContainer();
    const items = await taskService.listTasks(query);
    return NextResponse.json({ items }, { status: 200 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<{ item: TaskDto } | ApiErrorResponse>> {
  try {
    const body: unknown = await request.json();
    const input = createTaskInputSchema.parse(body);
    const { taskService } = await getContainer();
    const item = await taskService.createTask(input);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
