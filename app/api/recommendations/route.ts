import { db } from '@/lib/db';
import { currentUser } from '@/lib/current-user';
import { recommend } from '@/lib/recommendation-engine';
import { toUserSignal } from '@/lib/user-signal';
import { errorResponse } from '@/lib/api';

export async function GET() {
  const user = await currentUser();
  if (!user) return errorResponse('Unauthorized', 401);
  const careers = await db.career.findMany({ where: { active: true } });
  return Response.json(recommend(careers, toUserSignal(user)));
}

export async function POST() {
  const user = await currentUser();
  if (!user) return errorResponse('Unauthorized', 401);
  const careers = await db.career.findMany({ where: { active: true } });
  const ranked = recommend(careers, toUserSignal(user));
  await db.$transaction([
    db.recommendationSnapshot.createMany({
      data: ranked.slice(0, 10).map((item) => ({
        userId: user.id,
        careerId: item.id,
        score: item.match,
        reasons: item.breakdown,
      })),
    }),
    db.activity.create({ data: { userId: user.id, type: 'recommendation', title: 'Cập nhật gợi ý nghề nghiệp' } }),
  ]);
  return Response.json(ranked);
}
