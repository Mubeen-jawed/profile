import { PrismaClient } from './src/generated/prisma/client.ts';
const p = new PrismaClient();
const anon = await p.anonCredit.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
console.log('AnonCredit rows:', anon.length);
for (const a of anon) console.log(JSON.stringify(a));
const logs = await p.searchLog.findMany({ where: { userId: null }, orderBy: { createdAt: 'desc' }, take: 10 });
console.log('Anon SearchLogs:', logs.length);
await p.$disconnect();
