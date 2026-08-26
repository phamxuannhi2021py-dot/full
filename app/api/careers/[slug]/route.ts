import { db } from '@/lib/db';
import { currentUser } from '@/lib/current-user';
import { scoreCareerDetailed } from '@/lib/recommendation-engine';
import { toUserSignal } from '@/lib/user-signal';
import { errorResponse } from '@/lib/api';

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const [career, user] = await Promise.all([
    db.career.findUnique({ where: { slug } }),
    currentUser(),
  ]);
  if (!career || !career.active) return errorResponse('Không tìm thấy nghề nghiệp', 404);
  const detail = scoreCareerDetailed(career, toUserSignal(user));
  const saved = user ? Boolean(await db.savedCareer.findUnique({ where: { userId_careerId: { userId: user.id, careerId: career.id } } })) : false;
  return Response.json({ ...career, match: detail.score, breakdown: detail.breakdown, saved });
}
