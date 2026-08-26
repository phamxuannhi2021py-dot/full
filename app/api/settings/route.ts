import { z } from 'zod';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/session';
import { errorResponse, handleApiError, parseBody } from '@/lib/api';

const schema = z.object({
  language: z.enum(['vi','en']).optional(),
  timezone: z.string().min(1).max(80).optional(),
  units: z.enum(['metric','imperial']).optional(),
  emailNotifications: z.boolean().optional(),
  appNotifications: z.boolean().optional(),
  learningReminders: z.boolean().optional(),
  newsletter: z.boolean().optional(),
  darkMode: z.boolean().optional(),
  accentColor: z.enum(['purple','blue','green','orange','pink']).optional(),
  profileVisibility: z.enum(['private','friends','public']).optional(),
  emailVisibility: z.enum(['private','friends','public']).optional(),
  phoneVisibility: z.enum(['private','friends','public']).optional(),
});

export async function GET() {
  const userId = await getUserId();
  if (!userId) return errorResponse('Unauthorized', 401);
  const settings = await db.userSetting.upsert({ where: { userId }, update: {}, create: { userId } });
  return Response.json(settings);
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return errorResponse('Unauthorized', 401);
    const input = await parseBody(request, schema);
    const settings = await db.userSetting.upsert({ where: { userId }, update: input, create: { userId, ...input } });
    return Response.json({ ok: true, settings });
  } catch (error) {
    return handleApiError(error);
  }
}
