import { db } from '@/lib/db';
import { getUserId } from '@/lib/session';
import { errorResponse } from '@/lib/api';

export async function POST(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const userId = await getUserId();
  if (!userId) return errorResponse('Unauthorized', 401);
  const { slug } = await context.params;
  const career = await db.career.findUnique({ where: { slug } });
  if (!career) return errorResponse('Không tìm thấy nghề nghiệp', 404);
  await db.savedCareer.upsert({
    where: { userId_careerId: { userId, careerId: career.id } },
    update: {},
    create: { userId, careerId: career.id },
  });
  await db.activity.create({ data: { userId, type: 'career', title: 'Đã lưu nghề', detail: career.title } });
  return Response.json({ ok: true, saved: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const userId = await getUserId();
  if (!userId) return errorResponse('Unauthorized', 401);
  const { slug } = await context.params;
  const career = await db.career.findUnique({ where: { slug } });
  if (!career) return errorResponse('Không tìm thấy nghề nghiệp', 404);
  await db.savedCareer.deleteMany({ where: { userId, careerId: career.id } });
  return Response.json({ ok: true, saved: false });
}
