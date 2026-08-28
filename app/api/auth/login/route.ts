import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { createSession } from '@/lib/session';
import { errorResponse, handleApiError, parseBody } from '@/lib/api';
import { rateLimit } from '@/lib/rate-limit';

const schema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  try {
    const ip = 
      request.headers.get('x-real-ip') || 
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
      '127.0.0.1';

    if (!rateLimit(`login:${ip}`, 10, 10 * 60_000).allowed) {
      return errorResponse('Quá nhiều lần đăng nhập. Vui lòng thử lại sau.', 429);
    }

    const input = await parseBody(request, schema);
    const user = await db.user.findUnique({ where: { email: input.email.toLowerCase() } });

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      return errorResponse('Email hoặc mật khẩu không đúng', 401);
    }

    await createSession({
      userId: user.id,
      onboardingCompleted: Boolean(user.onboardingCompletedAt),
      tokenVersion: user.tokenVersion,
    });

    try {
      await db.activity.create({
        data: { 
          userId: user.id, 
          type: 'auth', 
          title: 'Đăng nhập', 
          detail: 'Đăng nhập vào CareerTwin' 
        },
      });
    } catch (activityError) {
      console.error('Failed to log login activity:', activityError);
    }

    return Response.json({
      ok: true,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        onboardingCompleted: Boolean(user.onboardingCompletedAt) 
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
