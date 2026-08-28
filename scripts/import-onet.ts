import { readFile } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type OnetOccupation = {
  code?: string;
  title: string;
  description?: string;
  tasks?: string[];
  knowledge?: string[];
  abilities?: string[];
  workActivities?: string[];
  workContext?: string[];
  tools?: string[];
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);
}

export async function importOnetOccupations(path: string, limit = Number.POSITIVE_INFINITY) {
  const occupations = JSON.parse(await readFile(path, 'utf8')) as OnetOccupation[];
  let imported = 0;

  for (const occupation of occupations.slice(0, limit)) {
    const career = await prisma.career.upsert({
      where: { slug: slugify(`onet-${occupation.title}`) },
      update: {
        title: occupation.title,
        description: occupation.description || `O*NET occupation: ${occupation.title}`,
        tags: ['onet', occupation.code].filter(Boolean).join(','),
      },
      create: {
        slug: slugify(`onet-${occupation.title}`),
        title: occupation.title,
        category: 'O*NET',
        description: occupation.description || `O*NET occupation: ${occupation.title}`,
        salaryMin: 0,
        salaryMax: 0,
        demand: 0,
        creativity: 50,
        logic: 50,
        communication: 50,
        competition: 0,
        tags: ['onet', occupation.code].filter(Boolean).join(','),
        requiredSkills: [...(occupation.knowledge ?? []), ...(occupation.abilities ?? [])].slice(0, 8).join(','),
        workEnvironment: 'Unknown',
        roadmap: 'Understand work tasks|Learn required knowledge|Practice core activities|Build evidence|Compare alternatives|Plan next step',
      },
    });

    for (const [index, task] of (occupation.tasks ?? []).entries()) {
      await prisma.careerTask.upsert({
        where: { id: `${career.id}-onet-task-${index + 1}` },
        update: { title: task, source: 'onet', order: index + 1 },
        create: { id: `${career.id}-onet-task-${index + 1}`, careerId: career.id, title: task, source: 'onet', order: index + 1 },
      });
    }
    for (const name of occupation.knowledge ?? []) {
      await prisma.careerKnowledge.upsert({
        where: { careerId_name: { careerId: career.id, name } },
        update: { source: 'onet' },
        create: { careerId: career.id, name, source: 'onet' },
      });
    }
    for (const name of occupation.abilities ?? []) {
      await prisma.careerAbility.upsert({
        where: { careerId_name: { careerId: career.id, name } },
        update: { source: 'onet' },
        create: { careerId: career.id, name, importance: 70, source: 'onet' },
      });
    }
    for (const name of occupation.workActivities ?? []) {
      await prisma.careerWorkActivity.upsert({
        where: { careerId_name: { careerId: career.id, name } },
        update: { source: 'onet' },
        create: { careerId: career.id, name, source: 'onet' },
      });
    }
    for (const name of occupation.workContext ?? []) {
      await prisma.careerWorkContext.upsert({
        where: { careerId_name: { careerId: career.id, name } },
        update: { source: 'onet' },
        create: { careerId: career.id, name, source: 'onet' },
      });
    }
    for (const name of occupation.tools ?? []) {
      await prisma.careerTool.upsert({
        where: { careerId_name: { careerId: career.id, name } },
        update: { source: 'onet' },
        create: { careerId: career.id, name, source: 'onet' },
      });
    }
    imported++;
  }

  return { imported };
}

if (process.argv[1]?.endsWith('import-onet.ts')) {
  const path = process.argv[2];
  if (!path) throw new Error('Usage: node scripts/import-onet.ts <onet-json-path> [limit]');
  importOnetOccupations(path, Number(process.argv[3] ?? Number.POSITIVE_INFINITY))
    .then((result) => console.log(JSON.stringify(result)))
    .finally(() => prisma.$disconnect());
}
