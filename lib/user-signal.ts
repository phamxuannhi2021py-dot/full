import type { UserGoal, UserInterest, UserSkill } from '@prisma/client';
import { defaultSignal, type UserSignal } from './recommendation-engine';
export { calculateReadiness } from './readiness';

export function toUserSignal(user: {
  interests: Pick<UserInterest, 'key'>[];
  skills: Pick<UserSkill, 'key' | 'level'>[];
  goals: Pick<UserGoal, 'key'>[];
} | null): UserSignal {
  if (!user) return defaultSignal();
  return {
    interests: user.interests.map((item) => item.key),
    skills: Object.fromEntries(user.skills.map((item) => [item.key, item.level])),
    goals: user.goals.map((item) => item.key),
  };
}
