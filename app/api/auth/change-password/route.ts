import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/session';
import { errorResponse, handleApiError, parseBody } from '@/lib/api';

const schema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128).regex(/[A-Za-z]/).regex(/\d/),
});

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return errorResponse('Unauthorized', 401);
    const input = await parseBody(request, schema);
    const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
      return errorResponse('Mật khẩu hiện tại không đúng', 400);
    }
    await db.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(input.newPassword, 12) } });
    await db.activity.create({ data: { userId, type: 'security', title: 'Đổi mật khẩu' } });
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
