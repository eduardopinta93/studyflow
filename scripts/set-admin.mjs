import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: node scripts/set-admin.mjs <email>');
  process.exit(1);
}

const user = await db.user.findUnique({ where: { email } });

if (!user) {
  console.error(`No user found with email "${email}".`);
  await db.$disconnect();
  process.exit(1);
}

await db.user.update({ where: { email }, data: { role: 'ADMIN' } });
console.log(`"${email}" is now an admin.`);
await db.$disconnect();
