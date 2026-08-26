import { z } from 'zod';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/session';
import { errorResponse } from '@/lib/api';

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) return errorResponse('Unauthorized', 401);
  const parsed = z.coerce.number().int().min(1).max(100).safeParse(new URL(request.url).searchParams.get('limit') ?? 20);
  const limit = parsed.success ? parsed.data : 20;
  return Response.json(await db.activity.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: limit }));
}
