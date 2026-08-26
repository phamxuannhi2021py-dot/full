import { NextResponse } from 'next/server';
import { ZodError, type ZodType } from 'zod';

export function errorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) throw new Error('UNSUPPORTED_MEDIA_TYPE');
  return schema.parse(await request.json());
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) return errorResponse('Dữ liệu không hợp lệ', 422, error.issues);
  if (error instanceof SyntaxError) return errorResponse('JSON không hợp lệ', 400);
  if (error instanceof Error && error.message === 'UNSUPPORTED_MEDIA_TYPE') return errorResponse('Content-Type phải là application/json', 415);
  console.error(error);
  return errorResponse('Có lỗi xảy ra. Vui lòng thử lại.', 500);
}
