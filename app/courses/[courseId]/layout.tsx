import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import CourseShell from '@/app/components/course/CourseShell';

function isValidObjectId(value: string) {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  if (!isValidObjectId(courseId)) notFound();

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect('/auth/login');

  const course = await db.course.findFirst({
    where: { id: courseId, userId },
    select: { id: true, name: true, code: true, term: true, color: true },
  });

  if (!course) notFound();

  return (
    <CourseShell
      course={{
        id: course.id,
        name: course.name,
        code: course.code,
        term: course.term,
        color: course.color ?? '#0078D4',
      }}
    >
      {children}
    </CourseShell>
  );
}
