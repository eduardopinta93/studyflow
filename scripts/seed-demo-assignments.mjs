import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'demo@studyflow.app' },
  });

  if (!user) {
    console.log('Demo user not found. Run seed-demo.mjs first.');
    return;
  }

  const courses = await prisma.course.findMany({ where: { userId: user.id } });
  const cs = courses.find((c) => c.code === 'CS101');
  const math = courses.find((c) => c.code === 'MATH201');

  if (!cs || !math) {
    console.log('Courses not found. Run seed-demo.mjs first.');
    return;
  }

  const wanted = [
    { title: 'Git & GitHub Tutorial', description: 'Complete the Git basics tutorial and submit your GitHub profile', dueDate: new Date('2026-09-25'), courseId: cs.id, type: 'assignment', priority: 'low' },
    { title: 'Data Structures Report', description: 'Write a 2-page report on arrays vs linked lists', dueDate: new Date('2026-10-08'), courseId: cs.id, type: 'assignment', priority: 'high' },
    { title: 'Group Project Proposal', description: 'Submit a 1-page proposal for your team project', dueDate: new Date('2026-10-20'), courseId: cs.id, type: 'project', priority: 'medium' },
    { title: 'Quiz 2 - Recursion', dueDate: new Date('2026-10-12'), courseId: cs.id, type: 'quiz', priority: 'medium' },
    { title: 'Final Project', description: 'Build a console-based application in Python', dueDate: new Date('2026-12-10'), courseId: cs.id, type: 'project', priority: 'high' },
    { title: 'Derivatives Problem Set', dueDate: new Date('2026-09-30'), courseId: math.id, type: 'assignment', priority: 'low' },
    { title: 'Integration Project', description: 'MATLAB integration simulation report', dueDate: new Date('2026-10-18'), courseId: math.id, type: 'project', priority: 'high' },
    { title: 'Midterm Exam', dueDate: new Date('2026-10-22'), courseId: math.id, type: 'exam', priority: 'high' },
    { title: 'Sequences & Series Quiz', dueDate: new Date('2026-11-01'), courseId: math.id, type: 'quiz', priority: 'medium' },
    { title: 'Taylor Series Homework', dueDate: new Date('2026-11-10'), courseId: math.id, type: 'assignment', priority: 'low' },
  ];

  const existing = await prisma.assignment.findMany({
    where: { userId: user.id },
    select: { title: true, courseId: true },
  });
  const existingKeys = new Set(existing.map((a) => `${a.courseId}:${a.title}`));

  const toCreate = wanted
    .filter((a) => !existingKeys.has(`${a.courseId}:${a.title}`))
    .map((a) => ({ ...a, userId: user.id }));

  if (toCreate.length > 0) {
    await prisma.assignment.createMany({ data: toCreate });
  }

  const count = await prisma.assignment.count({ where: { userId: user.id } });
  console.log(`Added ${toCreate.length} assignments. Total assignments now: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
