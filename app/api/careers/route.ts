import { z } from 'zod';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/current-user';
import { recommend } from '@/lib/recommendation-engine';
import { toUserSignal } from '@/lib/user-signal';

const querySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return Response.json({ error: 'Tham số tìm kiếm không hợp lệ' }, { status: 422 });
  const { q, category, limit } = parsed.data;
  const [user, careers] = await Promise.all([
    currentUser(),
    db.career.findMany({
      where: {
        active: true,
        ...(category && category !== 'all' ? { category: { contains: category, mode: 'insensitive' } } : {}),
        ...(q ? { OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { contains: q, mode: 'insensitive' } },
        ] } : {}),
      },
      take: limit,
      orderBy: [{ demand: 'desc' }, { title: 'asc' }],
    }),
  ]);
  const ranked = recommend(careers, toUserSignal(user));
  if (!user) return Response.json(ranked.map((career) => ({ ...career, saved: false })));
  const saved = await db.savedCareer.findMany({ where: { userId: user.id }, select: { careerId: true } });
  const savedIds = new Set(saved.map((item) => item.careerId));
  return Response.json(ranked.map((career) => ({ ...career, saved: savedIds.has(career.id) })));
}
