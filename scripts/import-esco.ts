import { readFile } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type EscoOccupation = {
  uri?: string;
  preferredLabel?: string;
  title?: string;
  description?: string;
  altLabels?: string;
  iscoGroup?: string;
  skills?: { uri?: string; preferredLabel?: string; description?: string }[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 90);
}

function asArray(payload: unknown): EscoOccupation[] {
  if (Array.isArray(payload)) return payload as EscoOccupation[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as { occupations?: unknown[] }).occupations)) {
    return (payload as { occupations: EscoOccupation[] }).occupations;
  }
  throw new Error('ESCO import expects a JSON array or an object with occupations[].');
}

export async function importEscoOccupations(path: string, limit = Number.POSITIVE_INFINITY) {
  const payload = JSON.parse(await readFile(path, 'utf8'));
  const occupations = asArray(payload).slice(0, limit);
  let imported = 0;

  for (const occupation of occupations) {
    const title = occupation.preferredLabel || occupation.title;
    if (!title) continue;
    const career = await prisma.career.upsert({
      where: { slug: slugify(`esco-${title}`) },
      update: {
        title,
        description: occupation.description || `ESCO occupation: ${title}`,
        category: occupation.iscoGroup || 'ESCO',
        tags: ['esco', occupation.iscoGroup, occupation.altLabels].filter(Boolean).join(','),
      },
      create: {
        slug: slugify(`esco-${title}`),
        title,
        category: occupation.iscoGroup || 'ESCO',
        description: occupation.description || `ESCO occupation: ${title}`,
        salaryMin: 0,
        salaryMax: 0,
        demand: 0,
        creativity: 50,
        logic: 50,
        communication: 50,
        competition: 0,
        tags: ['esco', occupation.iscoGroup, occupation.altLabels].filter(Boolean).join(','),
        requiredSkills: occupation.skills?.map((skill) => skill.preferredLabel).filter(Boolean).join(',') || '',
        workEnvironment: 'Unknown',
        roadmap: 'Explore occupation|Learn core skills|Practice realistic tasks|Build portfolio|Validate fit|Plan next step',
      },
    });

    for (const linkedSkill of occupation.skills ?? []) {
      if (!linkedSkill.preferredLabel) continue;
      const key = slugify(linkedSkill.preferredLabel);
      const skill = await prisma.skill.upsert({
        where: { key },
        update: { name: linkedSkill.preferredLabel, description: linkedSkill.description, escoUri: linkedSkill.uri },
        create: { key, name: linkedSkill.preferredLabel, description: linkedSkill.description, escoUri: linkedSkill.uri, source: 'esco' },
      });
      await prisma.careerSkill.upsert({
        where: { careerId_skillId: { careerId: career.id, skillId: skill.id } },
        update: { source: 'esco' },
        create: { careerId: career.id, skillId: skill.id, importance: 70, source: 'esco' },
      });
    }
    imported++;
  }

  return { imported };
}

if (process.argv[1]?.endsWith('import-esco.ts')) {
  const path = process.argv[2];
  if (!path) throw new Error('Usage: node scripts/import-esco.ts <esco-json-path> [limit]');
  importEscoOccupations(path, Number(process.argv[3] ?? Number.POSITIVE_INFINITY))
    .then((result) => console.log(JSON.stringify(result)))
    .finally(() => prisma.$disconnect());
}
