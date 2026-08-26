import { z } from 'zod';
import { db } from '@/lib/db';

const querySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(80).optional(),
  slug: z.string().trim().max(120).optional(),
});

export async function GET(request: Request) {
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return Response.json({ error: 'Tham số không hợp lệ' }, { status: 422 });
  const { q, category, slug } = parsed.data;
  if (slug) {
    const article = await db.article.findFirst({ where: { slug, published: true } });
    return article ? Response.json(article) : Response.json({ error: 'Không tìm thấy bài viết' }, { status: 404 });
  }
  const articles = await db.article.findMany({
    where: {
      published: true,
      ...(category && category !== 'all' ? { category: { contains: category, mode: 'insensitive' } } : {}),
      ...(q ? { OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ] } : {}),
    },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  });
  return Response.json(articles);
}
