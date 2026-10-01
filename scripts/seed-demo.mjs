import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@studyflow.app' },
    update: {},
    create: {
      name: 'Student',
      email: 'demo@studyflow.app',
      password: 'demo',
    },
  });

  const existing = await prisma.course.findMany({
    where: { userId: user.id },
    select: { code: true },
  });
  const ownedCodes = existing.map((c) => c.code);

  const courseData = [
    {
      name: 'Introduction to Computer Science',
      code: 'CS101',
      term: 'Fall 2026',
      notes: 'Mon/Wed 10:00-11:30, Room 204',
      color: '#4F46E5',
    },
    {
      name: 'Calculus II',
      code: 'MATH201',
      term: 'Fall 2026',
      notes: 'Tue/Thu 14:00-15:30, Science Building',
      color: '#0EA5E9',
    },
  ];

  const courses = [];
  for (const data of courseData) {
    let course = await prisma.course.findFirst({
      where: { userId: user.id, code: data.code },
    });
    if (!course) {
      course = await prisma.course.create({ data: { ...data, userId: user.id } });
    }
    courses.push(course);
  }

  if (ownedCodes.length === 0) {
    const [course1, course2] = courses;
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
  }

  console.log(`Seeded demo user ${user.email} with ${courses.length} courses`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
