import { describe, expect, it } from 'vitest';
import { ZodError, z } from 'zod';
import { NotFoundError, ValidationError } from '@/services/errors';
import { handleApiError } from '@/server/api-response';

describe('server/api-response', () => {
  it('translates AppError subclasses to structured JSON responses', async () => {
    const notFoundRes = handleApiError(new NotFoundError('Task not found'));
    expect(notFoundRes.status).toBe(404);
    expect(await notFoundRes.json()).toEqual({
      error: { code: 'NOT_FOUND', message: 'Task not found' },
    });

    const validationRes = handleApiError(
      new ValidationError('Deadline cannot be in the past', {
        deadlineAt: 'Must be in the future',
      }),
    );
    expect(validationRes.status).toBe(400);
    expect(await validationRes.json()).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Deadline cannot be in the past',
        fields: { deadlineAt: 'Must be in the future' },
      },
    });
  });

  it('translates ZodError to 400 VALIDATION_ERROR with field messages', async () => {
    const schema = z.object({ title: z.string().min(1, 'Title is required') });
    let caught: unknown;
    try {
      schema.parse({ title: '' });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(ZodError);

    const res = handleApiError(caught);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request input',
        fields: { title: 'Title is required' },
      },
    });
  });
});
