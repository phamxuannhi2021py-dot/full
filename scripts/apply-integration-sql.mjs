import { readFile, unlink } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';

const databaseUrl = new URL('../prisma/integration.db', import.meta.url);
await unlink(databaseUrl).catch(() => {});
const sql = await readFile(new URL('../prisma/integration.sql', import.meta.url), 'utf8');
const database = new DatabaseSync(databaseUrl);
database.exec(sql);
database.close();
console.log('Created isolated integration database.');
