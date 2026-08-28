export type RequiredSkill = {
  key: string;
  name: string;
  importance: number;
};

export type UserSkillLevel = {
  key: string;
  level: number;
};

export function normalizeSkillKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function calculateSkillGap(required: RequiredSkill[], userSkills: UserSkillLevel[]) {
  const userMap = new Map(userSkills.map((skill) => [normalizeSkillKey(skill.key), skill.level]));
  return required
    .map((skill) => {
      const key = normalizeSkillKey(skill.key || skill.name);
      const current = userMap.get(key) ?? 0;
      const gap = Math.max(0, 75 - current);
      const status = current >= 75 ? 'strong' : current > 0 ? 'needs-improvement' : 'missing';
      return {
        key,
        name: skill.name,
        current,
        target: 75,
        gap,
        importance: skill.importance,
        priority: Math.round(gap * (skill.importance / 100)),
        status,
      };
    })
    .sort((left, right) => right.priority - left.priority || right.importance - left.importance);
}

export function learningSequenceFromGap(gaps: ReturnType<typeof calculateSkillGap>) {
  return gaps
    .filter((gap) => gap.status !== 'strong')
    .slice(0, 6)
    .map((gap, index) => ({
      order: index + 1,
      skill: gap.name,
      reason: gap.status === 'missing' ? 'Bạn chưa có tín hiệu kỹ năng này trong hồ sơ.' : `Bạn đang ở ${gap.current}/100, nên cần nâng lên khoảng ${gap.target}/100.`,
      project: `Tạo một mini project chứng minh kỹ năng ${gap.name}.`,
    }));
}
