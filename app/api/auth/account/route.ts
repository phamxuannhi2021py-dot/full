import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { clearSession, getUserId } from '@/lib/session';
import { errorResponse, handleApiError, parseBody } from '@/lib/api';

const schema = z.object({ password: z.string().min(8).max(128), confirmation: z.literal('XOA TAI KHOAN') });

export async function DELETE(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return errorResponse('Unauthorized', 401);
    const input = await parseBody(request, schema);
    const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await bcrypt.compare(input.password, user.passwordHash))) return errorResponse('Mật khẩu không đúng', 400);
    await db.user.delete({ where: { id: userId } });
    await clearSession();
    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
