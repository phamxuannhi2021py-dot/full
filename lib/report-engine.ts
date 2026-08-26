import type { Career, Profile, Simulation, UserSkill } from '@prisma/client';
import { recommend, type UserSignal } from './recommendation-engine';
import { calculateReadiness } from './user-signal';

export function buildCareerReport(input: {
  profile: Profile | null;
  interests: unknown[];
  skills: UserSkill[];
  goals: unknown[];
  simulations: (Simulation & { career: Career })[];
  careers: Career[];
  signal: UserSignal;
}) {
  const ranked = recommend(input.careers, input.signal).slice(0, 5);
  const readiness = calculateReadiness(input);
  const skillValues = input.skills.map((item) => item.level);
  const averageSkill = skillValues.length
    ? Math.round(skillValues.reduce((sum, value) => sum + value, 0) / skillValues.length)
    : 0;
  const averageSimulation = input.simulations.length
    ? Math.round(input.simulations.reduce((sum, item) => sum + item.score, 0) / input.simulations.length)
    : 0;
  const strengths = input.skills
    .slice()
    .sort((left, right) => right.level - left.level)
    .slice(0, 4)
    .map((item) => ({ key: item.key, score: item.level }));
  const improvements = input.skills
    .slice()
    .sort((left, right) => left.level - right.level)
    .slice(0, 3)
    .map((item) => ({ key: item.key, score: item.level }));
  return {
    readiness,
    exploredCareers: input.careers.length,
    completedSimulations: input.simulations.length,
    evaluatedSkills: input.skills.length,
    averageSkill,
    averageSimulation,
    strengths,
    improvements,
    recommendations: ranked,
    recentSimulations: input.simulations.slice(0, 5).map((item) => ({
      id: item.id,
      career: item.career.title,
      score: item.score,
      createdAt: item.createdAt,
    })),
  };
}
