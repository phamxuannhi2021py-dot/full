export type UserSignal = {
  interests: string[];
  skills: Record<string, number>;
  goals: string[];
};

export type CareerLike = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  demand: number;
  creativity: number;
  logic: number;
  communication: number;
  tags: string;
  requiredSkills?: string;
  roadmap: string;
  skills?: { importance: number; skill: { key: string; name: string } }[];
};

export type ScoreBreakdown = {
  interest: number;
  skill: number;
  goal: number;
  aptitude: number;
};

const aliases: Record<string, string[]> = {
  technology: ['technology', 'coding', 'ai', 'data', 'engineering', 'security'],
  creative: ['creative', 'design', 'content'],
  business: ['business', 'marketing', 'product'],
  science: ['science', 'data', 'math', 'analysis'],
  people: ['communication', 'people', 'product'],
  social: ['environment', 'people', 'communication'],
  engineering: ['engineering', 'technology', 'logic'],
  'problem-solving': ['logic', 'analysis', 'problem-solving'],
  communication: ['communication', 'people', 'content'],
  design: ['design', 'creative'],
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

function overlapScore(tags: string[], interests: string[]) {
  if (!interests.length) return 50;
  const hits = interests.filter((interest) =>
    (aliases[interest] ?? [interest]).some((word) => tags.includes(word)),
  ).length;
  return clamp((hits / interests.length) * 100);
}

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function skillScore(career: CareerLike, skills: Record<string, number>) {
  const values: number[] = [];
  const tags = career.tags.split(',').map((item) => item.trim());
  const normalizedUserSkills = new Map(Object.entries(skills).map(([key, value]) => [normalize(key), value]));
  for (const careerSkill of career.skills ?? []) {
    const direct = normalizedUserSkills.get(normalize(careerSkill.skill.key)) ?? normalizedUserSkills.get(normalize(careerSkill.skill.name));
    if (direct != null) values.push(direct * (careerSkill.importance / 100));
  }
  for (const required of (career.requiredSkills ?? '').split(',').map((item) => item.trim()).filter(Boolean)) {
    const found = [...normalizedUserSkills.entries()].find(([key]) => normalize(required).includes(key) || key.includes(normalize(required)));
    if (found) values.push(found[1]);
  }
  if (tags.some((tag) => ['coding', 'technology', 'ai', 'security'].includes(tag)) && skills.coding != null) values.push(skills.coding);
  if (tags.includes('design') && skills.design != null) values.push(skills.design);
  if (tags.some((tag) => ['analysis', 'data', 'logic', 'math'].includes(tag)) && skills.analysis != null) values.push(skills.analysis);
  if (tags.some((tag) => ['communication', 'people', 'content'].includes(tag)) && skills.communication != null) values.push(skills.communication);
  if (tags.includes('marketing') && skills.marketing != null) values.push(skills.marketing);
  if (tags.includes('content') && skills.writing != null) values.push(skills.writing);
  return values.length ? clamp(values.reduce((sum, value) => sum + value, 0) / values.length) : 60;
}

export function scoreCareerDetailed(career: CareerLike, user: UserSignal) {
  const tags = career.tags.split(',').map((item) => item.trim());
  const breakdown: ScoreBreakdown = {
    interest: overlapScore(tags, user.interests),
    skill: skillScore(career, user.skills),
    goal: user.goals.includes('career-growth')
      ? career.demand
      : user.goals.includes('good-job')
        ? clamp((career.demand + Math.min(100, career.salaryMax * 2)) / 2)
        : user.goals.includes('balance')
          ? 75
          : 70,
    aptitude: clamp((career.logic + career.creativity + career.communication) / 3),
  };
  const score = clamp(
    breakdown.interest * 0.35 +
    breakdown.skill * 0.30 +
    breakdown.goal * 0.20 +
    breakdown.aptitude * 0.15,
  );
  return { score, breakdown };
}

export function scoreCareer(career: CareerLike, user: UserSignal) {
  return scoreCareerDetailed(career, user).score;
}

export function recommend(careers: CareerLike[], user: UserSignal) {
  return careers
    .map((career) => {
      const { score, breakdown } = scoreCareerDetailed(career, user);
      return { ...career, match: score, breakdown };
    })
    .sort((left, right) => right.match - left.match || right.demand - left.demand);
}

export function recommendWithSimulation(
  careers: CareerLike[],
  user: UserSignal,
  simulations: { careerId: string; score: number; createdAt?: Date | string }[] = [],
) {
  const latestByCareer = new Map<string, number>();
  for (const simulation of simulations) {
    if (!latestByCareer.has(simulation.careerId)) latestByCareer.set(simulation.careerId, simulation.score);
  }
  return recommend(careers, user)
    .map((career) => {
      const simulationScore = latestByCareer.get(career.id);
      if (simulationScore == null) return career;
      const boost = Math.round((simulationScore - 70) * 0.25);
      return { ...career, match: clamp(career.match + boost), simulationScore };
    })
    .sort((left, right) => right.match - left.match || right.demand - left.demand);
}

export function defaultSignal(): UserSignal {
  return {
    interests: ['technology', 'creative', 'problem-solving'],
    skills: { coding: 65, design: 70, communication: 65, analysis: 65 },
    goals: ['career-growth'],
  };
}
