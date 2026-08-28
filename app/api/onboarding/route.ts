import { z } from 'zod';
import { db } from '@/lib/db';
import { createSession, getUserId } from '@/lib/session';
import { calculateReadiness } from '@/lib/user-signal';
import { errorResponse, handleApiError, parseBody } from '@/lib/api';

const allowedInterests = ['creative','technology','business','science','people','problem-solving','communication','engineering','social'] as const;
const allowedSkills = ['coding','design','writing','language','analysis','management','communication','marketing','office','content','soft'] as const;
const allowedGoals = ['university','good-job','career-growth','startup','achievement','abroad','balance','other'] as const;

const schema = z.object({
  basic: z.object({
    name: z.string().trim().min(2).max(80),
    role: z.enum(['student','university','worker']),
    birthDate: z.string().trim().max(20).optional(),
    gender: z.enum(['female','male','other']).optional(),
    phone: z.string().trim().max(30).optional(),
    grade: z.string().trim().max(30).optional(),
  }).optional(),
  interests: z.array(z.enum(allowedInterests)).min(1).max(9).optional(),
  skills: z.partialRecord(z.enum(allowedSkills), z.coerce.number().int().min(0).max(100)).optional(),
  goals: z.array(z.enum(allowedGoals)).min(1).max(8).optional(),
  horizon: z.enum(['under-1','1-3','3-5','over-5']).optional(),
  detail: z.string().trim().max(800).optional(),
}).refine((input) => input.basic || input.interests || input.skills || input.goals, 'Không có dữ liệu onboarding');

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return errorResponse('Unauthorized', 401);
    const input = await parseBody(request, schema);
    const sessionState = await db.$transaction(async (tx) => {
      if (input.basic) {
        await tx.user.update({ where: { id: userId }, data: { name: input.basic.name, role: input.basic.role } });
        await tx.profile.upsert({
          where: { userId },
          update: { birthDate: input.basic.birthDate || null, gender: input.basic.gender, phone: input.basic.phone || null, education: input.basic.role, grade: input.basic.grade },
          create: { userId, birthDate: input.basic.birthDate || null, gender: input.basic.gender, phone: input.basic.phone || null, education: input.basic.role, grade: input.basic.grade },
        });
      }
      if (input.interests) {
        await tx.userInterest.deleteMany({ where: { userId } });
        await tx.userInterest.createMany({ data: input.interests.map((key) => ({ userId, key, weight: 100 })) });
      }
      if (input.skills) {
        await tx.userSkill.deleteMany({ where: { userId } });
        await tx.userSkill.createMany({ data: Object.entries(input.skills).map(([key, level]) => ({ userId, key, level })) });
      }
      if (input.goals) {
        await tx.userGoal.deleteMany({ where: { userId } });
        await tx.userGoal.createMany({
          data: input.goals.map((key) => ({ userId, key, horizon: input.horizon ?? null, detail: input.detail || null })),
        });
        await tx.user.update({ where: { id: userId }, data: { onboardingCompletedAt: new Date() } });
      }
      const state = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        include: { profile: true, interests: true, skills: true, goals: true, simulations: true },
      });
      const readiness = calculateReadiness(state);
      await tx.profile.upsert({ where: { userId }, update: { readiness }, create: { userId, readiness } });
      await tx.activity.create({
        data: { userId, type: 'onboarding', title: 'Cập nhật hồ sơ định hướng', detail: 'CareerTwin đã lưu dữ liệu cá nhân hóa' },
      });
      return tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { id: true, onboardingCompletedAt: true, tokenVersion: true },
      });
    });
    await createSession({
      userId: sessionState.id,
      onboardingCompleted: Boolean(sessionState.onboardingCompletedAt),
      tokenVersion: sessionState.tokenVersion,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
