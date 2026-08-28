import { z } from 'zod';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/session';
import { buildSimulationScenario, scoreSimulation, simulationQuestionIds } from '@/lib/simulation-engine';
import { buildTemplateWorld, scoreWorldDecisions } from '@/lib/simulation-world';
import { errorResponse, handleApiError, parseBody } from '@/lib/api';

const schema = z.object({
  careerId: z.string().cuid(),
  minutes: z.coerce.number().int().min(1).max(240).default(45),
  answers: z.array(z.object({
    questionId: z.enum(simulationQuestionIds),
    value: z.coerce.number().int().min(0).max(100),
  })).length(simulationQuestionIds.length).optional(),
  decisions: z.array(z.string().min(1).max(80)).max(20).optional(),
}).refine((input) => Boolean(input.answers?.length || input.decisions?.length), 'Simulation cần answers hoặc decisions');

export async function GET(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return errorResponse('Unauthorized', 401);
    const url = new URL(request.url);
    const careerId = url.searchParams.get('careerId');
    const slug = url.searchParams.get('career');
    const [history, career] = await Promise.all([
      db.simulation.findMany({
        where: { userId },
        include: { career: { select: { id: true, slug: true, title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      careerId || slug
        ? db.career.findFirst({ where: careerId ? { id: careerId, active: true } : { slug: slug ?? '', active: true } })
        : Promise.resolve(null),
    ]);
    return Response.json({ ...buildSimulationScenario(career), world: career ? buildTemplateWorld(career) : null, career, history });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return errorResponse('Unauthorized', 401);
    const input = await parseBody(request, schema);
    const career = await db.career.findUnique({ where: { id: input.careerId } });
    if (!career) return errorResponse('Không tìm thấy nghề nghiệp', 404);
    const world = buildTemplateWorld(career);
    const worldResult = input.decisions?.length ? scoreWorldDecisions(world, input.decisions) : null;
    const result = worldResult
      ? {
          score: worldResult.score,
          feedback: worldResult.consequences.join(' ') || 'Bạn đã hoàn thành nhiệm vụ mô phỏng.',
          dimensionScores: worldResult.dimensionScores,
        }
      : scoreSimulation(input.answers ?? []);
    const simulation = await db.$transaction(async (tx) => {
      const created = await tx.simulation.create({
        data: {
          userId,
          careerId: career.id,
          score: result.score,
          minutes: input.minutes,
          answers: { answers: input.answers ?? [], decisions: input.decisions ?? [], dimensionScores: 'dimensionScores' in result ? result.dimensionScores : undefined },
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
