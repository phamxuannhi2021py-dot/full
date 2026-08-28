import { db } from '@/lib/db';
import { currentUser } from '@/lib/current-user';
import { scoreCareerDetailed } from '@/lib/recommendation-engine';
import { toUserSignal } from '@/lib/user-signal';
import { calculateSkillGap, learningSequenceFromGap } from '@/lib/skill-gap';
import { errorResponse, handleApiError } from '@/lib/api';

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const [career, user] = await Promise.all([
      db.career.findUnique({
        where: { slug },
        include: {
          skills: { include: { skill: true }, orderBy: { importance: 'desc' } },
          tasks: { orderBy: { order: 'asc' } },
          knowledge: true,
          abilities: { orderBy: { importance: 'desc' } },
          workActivities: true,
          workContexts: true,
          tools: true,
          marketData: true,
          learningPaths: { orderBy: { order: 'asc' } },
          relatedFrom: { include: { relatedCareer: true }, orderBy: { strength: 'desc' }, take: 6 },
        },
      }),
      currentUser(),
    ]);
    if (!career || !career.active) return errorResponse('Không tìm thấy nghề nghiệp', 404);
    const detail = scoreCareerDetailed(career, toUserSignal(user));
    const saved = user ? Boolean(await db.savedCareer.findUnique({ where: { userId_careerId: { userId: user.id, careerId: career.id } } })) : false;
    const skillGap = user
      ? calculateSkillGap(
          career.skills.map((item) => ({ key: item.skill.key, name: item.skill.name, importance: item.importance })),
          user.skills.map((item) => ({ key: item.key, level: item.level })),
        )
      : [];
    return Response.json({
      ...career,
      match: detail.score,
      breakdown: detail.breakdown,
      saved,
      skillGap,
      learningSequence: learningSequenceFromGap(skillGap),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
