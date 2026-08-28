import { Prisma } from '@prisma/client';
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
  if (error instanceof ZodError) return errorResponse('Dữ liệu không hợp lệ', 400, error.issues);
  if (error instanceof SyntaxError) return errorResponse('JSON không hợp lệ', 400);
  if (error instanceof Error && error.message === 'UNSUPPORTED_MEDIA_TYPE') return errorResponse('Content-Type phải là application/json', 415);
  
  if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('Database connection failed:', error.message);
      return errorResponse('Dịch vụ tạm thời không khả dụng', 503);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return errorResponse('Dữ liệu đã tồn tại', 409);
    if (error.code === 'P2025') return errorResponse('Không tìm thấy dữ liệu', 404);
    if (error.code === 'P2021' || error.code === 'P2022') {
      console.error('Database schema mismatch:', error.message);
      return errorResponse('Database schema chưa sẵn sàng. Vui lòng chạy migration.', 503);
    }
  }

  console.error(error);
  return errorResponse('Có lỗi xảy ra. Vui lòng thử lại.', 500);
}
