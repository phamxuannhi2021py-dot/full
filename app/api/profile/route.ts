import { z } from 'zod';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/current-user';
import { getUserId } from '@/lib/session';
import { calculateReadiness } from '@/lib/user-signal';
import { errorResponse, handleApiError, parseBody } from '@/lib/api';

const schema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  birthDate: z.string().trim().max(20).nullable().optional(),
  gender: z.enum(['female','male','other']).nullable().optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  school: z.string().trim().max(160).nullable().optional(),
  education: z.string().trim().max(80).nullable().optional(),
  major: z.string().trim().max(120).nullable().optional(),
  grade: z.string().trim().max(30).nullable().optional(),
  bio: z.string().trim().max(500).nullable().optional(),
});

export async function GET() {
  const user = await currentUser();
  if (!user) return errorResponse('Unauthorized', 401);
  const activities = await db.activity.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 10 });
  return Response.json({
    id: user.id, name: user.name, email: user.email, role: user.role,
    profile: user.profile, interests: user.interests, skills: user.skills, goals: user.goals, activities,
  });
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return errorResponse('Unauthorized', 401);
    const input = await parseBody(request, schema);
    const { name, ...profileData } = input;
    await db.$transaction(async (tx) => {
      if (name) await tx.user.update({ where: { id: userId }, data: { name } });
      await tx.profile.upsert({ where: { userId }, update: profileData, create: { userId, ...profileData } });
      const state = await tx.user.findUniqueOrThrow({
        where: { id: userId }, include: { profile: true, interests: true, skills: true, goals: true, simulations: true },
      });
      await tx.profile.update({ where: { userId }, data: { readiness: calculateReadiness(state) } });
      await tx.activity.create({ data: { userId, type: 'profile', title: 'Cập nhật hồ sơ', detail: 'Thông tin cá nhân đã được cập nhật' } });
    });
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
