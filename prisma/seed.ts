import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Roles
  await prisma.role.createMany({
    data: [{ name: 'Student' }, { name: 'Teacher' }, { name: 'Admin' }],
    skipDuplicates: true,
  });

  // Seed Free Trial Plan
  // Optional: Seed a Free Trial Plan (for subscriptions, as per your auth.service.ts)
  await prisma.plan.createMany({
    data: [
      {
        name: 'Free Trial',
        price: 0,
        durationDays: 7,
        features: ['Basic access', 'Trial videos'],
      },
    ],
    skipDuplicates: true,
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
