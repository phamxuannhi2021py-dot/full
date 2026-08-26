import { z } from 'zod';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/current-user';
import { answerCareerQuestion } from '@/lib/ai';
import { toUserSignal } from '@/lib/user-signal';
import { errorResponse, handleApiError, parseBody } from '@/lib/api';
import { rateLimit } from '@/lib/rate-limit';

const schema = z.object({ question: z.string().trim().min(3).max(1_000) });

export async function GET() {
  const user = await currentUser();
  if (!user) return errorResponse('Unauthorized', 401);
  const messages = await db.aIMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return Response.json(messages.reverse());
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return errorResponse('Unauthorized', 401);
    if (!rateLimit(`ai:${user.id}`, 20, 60_000).allowed) {
      return errorResponse('Bạn đang gửi câu hỏi quá nhanh. Vui lòng chờ một chút.', 429);
    }
    const { question } = await parseBody(request, schema);
    const [careers, previous] = await Promise.all([
      db.career.findMany({ where: { active: true } }),
      db.aIMessage.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 8 }),
    ]);
    const reply = await answerCareerQuestion(
      question,
      careers,
      toUserSignal(user),
      previous.reverse().map((message) => ({ role: message.role, content: message.content })),
    );
    await db.$transaction([
      db.aIMessage.create({ data: { userId: user.id, role: 'user', content: question } }),
      db.aIMessage.create({ data: { userId: user.id, role: 'assistant', content: reply.answer, provider: reply.provider, model: reply.model } }),
      db.activity.create({ data: { userId: user.id, type: 'ai', title: 'Hỏi CareerTwin AI', detail: question.slice(0, 120) } }),
    ]);
    return Response.json(reply);
  } catch (error) {
    return handleApiError(error);
  }
}
