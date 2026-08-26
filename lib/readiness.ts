export function calculateReadiness(input: {
  profile?: Record<string, unknown> | null;
  interests: unknown[];
  skills: unknown[];
  goals: unknown[];
  simulations?: unknown[];
}) {
  let score = 10;
  const profile = input.profile ?? {};
  const filled = ['birthDate', 'gender', 'phone', 'city', 'school', 'education', 'major', 'grade', 'bio']
    .filter((key) => Boolean(profile[key])).length;
  score += Math.min(20, filled * 3);
  score += Math.min(20, input.interests.length * 4);
  score += Math.min(25, input.skills.length * 3);
  score += Math.min(15, input.goals.length * 5);
  score += Math.min(10, (input.simulations?.length ?? 0) * 2);
  return Math.min(100, score);
}
