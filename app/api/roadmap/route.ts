import { z } from 'zod';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/current-user';
import { getUserId } from '@/lib/session';
import { recommend } from '@/lib/recommendation-engine';
import { toUserSignal } from '@/lib/user-signal';
import { errorResponse, handleApiError, parseBody } from '@/lib/api';

const schema = z.object({
  careerId: z.string().cuid(),
  stage: z.number().int().min(1).max(6),
  progress: z.number().int().min(0).max(100),
});

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) return errorResponse('Unauthorized', 401);
  const careerId = new URL(request.url).searchParams.get('careerId');
  const careers = await db.career.findMany({ where: { active: true } });
  const selected = careerId
    ? careers.find((item) => item.id === careerId)
    : recommend(careers, toUserSignal(user))[0];
  if (!selected) return errorResponse('Không tìm thấy nghề nghiệp', 404);
  const progress = await db.roadmapProgress.findMany({ where: { userId: user.id, careerId: selected.id }, orderBy: { stage: 'asc' } });
  return Response.json({
    career: selected,
    stages: selected.roadmap.split('|').map((title, index) => {
      const saved = progress.find((item) => item.stage === index + 1);
      return { stage: index + 1, title, progress: saved?.progress ?? 0, completedAt: saved?.completedAt ?? null };
    }),
  });
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return errorResponse('Unauthorized', 401);
    const input = await parseBody(request, schema);
    const career = await db.career.findUnique({ where: { id: input.careerId } });
    if (!career) return errorResponse('Không tìm thấy nghề nghiệp', 404);
    const result = await db.roadmapProgress.upsert({
      where: { userId_careerId_stage: { userId, careerId: input.careerId, stage: input.stage } },
      update: { progress: input.progress, completedAt: input.progress === 100 ? new Date() : null },
      create: { userId, careerId: input.careerId, stage: input.stage, progress: input.progress, completedAt: input.progress === 100 ? new Date() : null },
    });
    await db.activity.create({ data: { userId, type: 'roadmap', title: 'Cập nhật lộ trình', detail: `${career.title} · Giai đoạn ${input.stage}` } });
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
