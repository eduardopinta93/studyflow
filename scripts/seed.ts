import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { id: 'demo-user' },
    update: {},
    create: {
      id: 'demo-user',
      name: 'Student',
      email: 'demo@studyflow.app',
      password: 'demo',
    },
  });

  const course1 = await prisma.course.create({
    data: {
      name: 'Introduction to Computer Science',
      code: 'CS101',
      term: 'Fall 2026',
      notes: 'Mon/Wed 10:00-11:30, Room 204',
      color: '#4F46E5',
      userId: user.id,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      name: 'Calculus II',
      code: 'MATH201',
      term: 'Fall 2026',
      notes: 'Tue/Thu 14:00-15:30, Science Building',
      color: '#0EA5E9',
      userId: user.id,
    },
  });

  await prisma.assignment.createMany({
    data: [
      {
        title: 'Python Basics Homework',
        description: 'Complete exercises 1-5 on data types and control flow',
        dueDate: new Date('2026-10-01'),
        courseId: course1.id,
        userId: user.id,
        type: 'assignment',
        priority: 'medium',
      },
      {
        title: 'Midterm Exam',
        dueDate: new Date('2026-10-15'),
        courseId: course1.id,
        userId: user.id,
        type: 'exam',
        priority: 'high',
      },
      {
        title: 'Integration Techniques Worksheet',
        dueDate: new Date('2026-09-28'),
        courseId: course2.id,
        userId: user.id,
        type: 'assignment',
        priority: 'low',
      },
      {
        title: 'Series Convergence Quiz',
        dueDate: new Date('2026-10-05'),
        courseId: course2.id,
        userId: user.id,
        type: 'quiz',
        priority: 'medium',
      },
    ],
  });

  console.log('Seeded 2 courses and 4 assignments');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
