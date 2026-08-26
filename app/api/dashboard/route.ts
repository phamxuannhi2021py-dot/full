import { db } from '@/lib/db';
import { currentUser } from '@/lib/current-user';
import { recommend } from '@/lib/recommendation-engine';
import { toUserSignal } from '@/lib/user-signal';
import { errorResponse } from '@/lib/api';

export async function GET() {
  const user = await currentUser();
  if (!user) return errorResponse('Unauthorized', 401);
  const [careers, activities, simulations, savedCareers] = await Promise.all([
    db.career.findMany({ where: { active: true } }),
    db.activity.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 8 }),
    db.simulation.count({ where: { userId: user.id } }),
    db.savedCareer.count({ where: { userId: user.id } }),
  ]);
  return Response.json({
    user: { name: user.name, email: user.email, role: user.role },
    readiness: user.profile?.readiness ?? 0,
    recommendations: recommend(careers, toUserSignal(user)).slice(0, 5),
    activities,
    stats: { simulations, savedCareers },
  });
}
