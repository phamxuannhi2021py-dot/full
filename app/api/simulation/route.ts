import { z } from 'zod';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/session';
import { scoreSimulation, simulationQuestions } from '@/lib/simulation-engine';
import { errorResponse, handleApiError, parseBody } from '@/lib/api';

const schema = z.object({
  careerId: z.string().cuid(),
  minutes: z.coerce.number().int().min(1).max(240).default(45),
  answers: z.array(z.object({
    questionId: z.enum(['planning','quality','feedback','learning']),
    value: z.coerce.number().int().min(0).max(100),
  })).length(simulationQuestions.length),
});

export async function GET() {
  const userId = await getUserId();
  if (!userId) return errorResponse('Unauthorized', 401);
  const history = await db.simulation.findMany({
    where: { userId },
    include: { career: { select: { id: true, slug: true, title: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return Response.json({ questions: simulationQuestions, history });
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return errorResponse('Unauthorized', 401);
    const input = await parseBody(request, schema);
    const career = await db.career.findUnique({ where: { id: input.careerId } });
    if (!career) return errorResponse('Không tìm thấy nghề nghiệp', 404);
    const result = scoreSimulation(input.answers);
    const simulation = await db.$transaction(async (tx) => {
      const created = await tx.simulation.create({
        data: {
          userId,
          careerId: career.id,
          score: result.score,
          minutes: input.minutes,
          answers: input.answers,
          feedback: result.feedback,
        },
        include: { career: { select: { id: true, slug: true, title: true } } },
      });
      await tx.activity.create({
        data: {
          userId,
          type: 'simulation',
          title: 'Hoàn thành mô phỏng nghề',
          detail: career.title,
          metadata: { score: result.score, simulationId: created.id },
        },
      });
      return created;
    });
    return Response.json(simulation, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
