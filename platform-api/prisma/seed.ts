import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({ data: [{ name: 'Student' }, { name: 'Teacher' }, { name: 'Admin' }], skipDuplicates: true });

  const adminRole = await prisma.role.findFirstOrThrow({ where: { name: 'Admin' } });
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin',
        passwordHash: await bcrypt.hash('AdminPass123!', 10),
        isEmailVerified: true,
        roleId: adminRole.id,
      },
    });
  }

  // Sample course
  const teacherRole = await prisma.role.findFirstOrThrow({ where: { name: 'Teacher' } });
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: { email: 'teacher@example.com', name: 'Teacher One', isEmailVerified: true, roleId: teacherRole.id },
  });

  const course = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: { title: 'Intro to Programming', description: 'Learn basics', category: 'Programming', createdById: teacher.id, isPublished: true },
  });

  const mod = await prisma.module.upsert({
    where: { id: 1 },
    update: {},
    create: { courseId: course.id, title: 'Module 1', order: 1 },
  });

  await prisma.video.upsert({ where: { id: 1 }, update: {}, create: { moduleId: mod.id, title: 'Welcome', url: 'https://example.com/video.mp4', durationSec: 300 } });
  await prisma.note.upsert({ where: { id: 1 }, update: {}, create: { moduleId: mod.id, title: 'Syllabus', url: 'https://example.com/syllabus.pdf', mimeType: 'application/pdf' } });

  // Sample job
  await prisma.job.createMany({
    data: [
      { title: 'Junior Developer', description: 'Great opportunity', location: 'Remote', type: 'full-time', category: 'Engineering' },
    ],
    skipDuplicates: true,
  });

  console.log('Seed completed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
