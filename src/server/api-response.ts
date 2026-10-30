import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ApiErrorResponse } from '@/contracts';
import { AppError } from '@/services/errors';
import { logger } from './logger';

function zodFieldsToMap(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : 'root';
    if (!fields[key]) {
      fields[key] = issue.message;
    }
  }
  return fields;
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.fields ? { fields: error.fields } : {}),
        },
      },
      { status: error.httpStatus },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request input',
          fields: zodFieldsToMap(error),
        },
      },
      { status: 400 },
    );
  }

  logger.error('Unhandled API error', {
    error: error instanceof Error ? error.message : String(error),
  });

  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 },
  );
}
