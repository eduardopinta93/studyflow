import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({ where: { userId: 'demo-user' } });
  const cs = courses.find(c => c.code === 'CS101');
  const math = courses.find(c => c.code === 'MATH201');

  if (!cs || !math) {
    console.log('Courses not found. Run seed.ts first.');
    return;
  }

  await prisma.assignment.createMany({
    data: [
      { title: 'Git & GitHub Tutorial', description: 'Complete the Git basics tutorial and submit your GitHub profile', dueDate: new Date('2026-09-25'), courseId: cs.id, userId: 'demo-user', type: 'assignment', priority: 'low' },
      { title: 'Data Structures Report', description: 'Write a 2-page report on arrays vs linked lists', dueDate: new Date('2026-10-08'), courseId: cs.id, userId: 'demo-user', type: 'assignment', priority: 'high' },
      { title: 'Group Project Proposal', description: 'Submit a 1-page proposal for your team project', dueDate: new Date('2026-10-20'), courseId: cs.id, userId: 'demo-user', type: 'project', priority: 'medium' },
      { title: 'Quiz 2 - Recursion', dueDate: new Date('2026-10-12'), courseId: cs.id, userId: 'demo-user', type: 'quiz', priority: 'medium' },
      { title: 'Final Project', description: 'Build a console-based application in Python', dueDate: new Date('2026-12-10'), courseId: cs.id, userId: 'demo-user', type: 'project', priority: 'high' },
      { title: 'Derivatives Problem Set', dueDate: new Date('2026-09-30'), courseId: math.id, userId: 'demo-user', type: 'assignment', priority: 'low' },
      { title: 'Integration Project', description: 'MATLAB integration simulation report', dueDate: new Date('2026-10-18'), courseId: math.id, userId: 'demo-user', type: 'project', priority: 'high' },
      { title: 'Midterm Exam', dueDate: new Date('2026-10-22'), courseId: math.id, userId: 'demo-user', type: 'exam', priority: 'high' },
      { title: 'Sequences & Series Quiz', dueDate: new Date('2026-11-01'), courseId: math.id, userId: 'demo-user', type: 'quiz', priority: 'medium' },
      { title: 'Taylor Series Homework', dueDate: new Date('2026-11-10'), courseId: math.id, userId: 'demo-user', type: 'assignment', priority: 'low' },
    ],
  });

  const count = await prisma.assignment.count({ where: { userId: 'demo-user' } });
  console.log(`Total assignments now: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
