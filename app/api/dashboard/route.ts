import { db } from '@/lib/db';
import { currentUser } from '@/lib/current-user';
import { recommendWithSimulation } from '@/lib/recommendation-engine';
import { toUserSignal } from '@/lib/user-signal';
import { errorResponse, handleApiError } from '@/lib/api';

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return errorResponse('Unauthorized', 401);
    const [careers, activities, savedCareers, simulations, roadmapProgress, latestReport] = await Promise.all([
      db.career.findMany({ where: { active: true }, include: { skills: { include: { skill: true } } } }),
      db.activity.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 8 }),
      db.savedCareer.findMany({
        where: { userId: user.id },
        include: { career: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      db.simulation.findMany({
        where: { userId: user.id },
        include: { career: { select: { id: true, slug: true, title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      db.roadmapProgress.findMany({
        where: { userId: user.id },
        include: { career: { select: { id: true, slug: true, title: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 6,
      }),
      db.reportSnapshot.findFirst({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } }),
    ]);
    const ranked = recommendWithSimulation(careers, toUserSignal(user), simulations.map((item) => ({ careerId: item.careerId, score: item.score, createdAt: item.createdAt })));
    const savedIds = new Set(savedCareers.map((item) => item.careerId));
    return Response.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        onboardingCompleted: Boolean(user.onboardingCompletedAt),
      },
      readiness: user.profile?.readiness ?? 0,
      recommendations: ranked.slice(0, 5).map((career) => ({ ...career, saved: savedIds.has(career.id) })),
      activities,
      savedCareers: savedCareers.map((item) => item.career),
      simulations,
      roadmapProgress,
      latestReport,
      stats: {
        simulations: simulations.length,
        savedCareers: savedCareers.length,
        roadmapStages: roadmapProgress.length,
        latestReportAt: latestReport?.createdAt ?? null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
