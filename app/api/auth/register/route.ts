import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { createSession } from '@/lib/session';
import { errorResponse, handleApiError, parseBody } from '@/lib/api';
import { rateLimit } from '@/lib/rate-limit';

const schema = z.object({
  name: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(80),
  email: z.string().trim().email('Email không hợp lệ').max(254),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự').max(128)
    .regex(/[A-Za-z]/, 'Mật khẩu cần có chữ cái')
    .regex(/\d/, 'Mật khẩu cần có chữ số'),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
    if (!rateLimit(`register:${ip}`, 5, 60 * 60_000).allowed) {
      return errorResponse('Quá nhiều yêu cầu tạo tài khoản. Vui lòng thử lại sau.', 429);
    }
    const input = await parseBody(request, schema);
    const email = input.email.toLowerCase();
    if (await db.user.findUnique({ where: { email }, select: { id: true } })) {
      return errorResponse('Email đã tồn tại', 409);
    }
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await db.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        profile: { create: { readiness: 10 } },
        settings: { create: {} },
        activities: { create: { type: 'auth', title: 'Tạo tài khoản', detail: 'Bắt đầu hành trình với CareerTwin' } },
      },
    });
    await createSession({
      userId: user.id,
      onboardingCompleted: false,
      tokenVersion: user.tokenVersion,
    });
    return Response.json({ ok: true, user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
