import { db } from '@/lib/db';
import { currentUser } from '@/lib/current-user';
import { buildCareerReport } from '@/lib/report-engine';
import { toUserSignal } from '@/lib/user-signal';
import { errorResponse } from '@/lib/api';

async function reportForCurrentUser() {
  const user = await currentUser();
  if (!user) return null;
  const [careers, simulations] = await Promise.all([
    db.career.findMany({ where: { active: true } }),
    db.simulation.findMany({ where: { userId: user.id }, include: { career: true }, orderBy: { createdAt: 'desc' } }),
  ]);
  return { user, report: buildCareerReport({
    profile: user.profile,
    interests: user.interests,
    skills: user.skills,
    goals: user.goals,
    simulations,
    careers,
    signal: toUserSignal(user),
  }) };
}

export async function GET() {
  const result = await reportForCurrentUser();
  if (!result) return errorResponse('Unauthorized', 401);
  return Response.json({ user: { name: result.user.name, email: result.user.email }, ...result.report });
}

export async function POST() {
  const result = await reportForCurrentUser();
  if (!result) return errorResponse('Unauthorized', 401);
  const snapshot = await db.reportSnapshot.create({
    data: { userId: result.user.id, readiness: result.report.readiness, summary: result.report },
  });
  await db.activity.create({ data: { userId: result.user.id, type: 'report', title: 'Tạo báo cáo nghề nghiệp' } });
  return Response.json({ id: snapshot.id, createdAt: snapshot.createdAt, ...result.report }, { status: 201 });
}
