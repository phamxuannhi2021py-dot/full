import { readFile, writeFile } from 'node:fs/promises';

const source = await readFile(new URL('../prisma/schema.prisma', import.meta.url), 'utf8');
const sqlite = source
  .replace('provider = "postgresql"', 'provider = "sqlite"')
  .replace(/\s+@db\.Text/g, '');
await writeFile(new URL('../prisma/schema.integration.prisma', import.meta.url), sqlite);
console.log('Prepared isolated SQLite schema for local integration testing.');
