import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { courseGrade } from '@/lib/grade';

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courses = await db.course.findMany({
      where: { userId },
      include: {
        _count: { select: { assignments: true } },
        assignments: { select: { completed: true, points: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      courses.map((course) => ({
        ...course,
        grade: courseGrade(course.assignments),
      }))
    );
  } catch (error) {
    console.error('GET /api/courses error:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

const MAX_CREDITS = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const unitId = body && typeof body.unitId === 'string' ? body.unitId : '';
    if (!unitId) {
      return NextResponse.json(
        { error: 'Select a course from the existing catalog' },
        { status: 400 }
      );
    }

    const unit = await db.courseUnit.findUnique({
      where: { id: unitId },
      include: { category: true },
    });
    if (!unit) {
      return NextResponse.json({ error: 'Course not found in the catalog' }, { status: 404 });
    }

    const owned = await db.course.findMany({
      where: { userId },
      select: { code: true, assignments: { select: { completed: true } } },
    });
    const ownedCodes = owned.map((c) => c.code).filter((c): c is string => !!c);
    if (ownedCodes.includes(unit.code)) {
      return NextResponse.json(
        { error: 'That course is already on your dashboard' },
        { status: 409 }
      );
    }

    const activeCodes = owned
      .filter(
        (c) =>
          c.code &&
          (c.assignments.length === 0 || c.assignments.some((a) => !a.completed))
      )
      .map((c) => c.code as string);
    const activeUnits = activeCodes.length
      ? await db.courseUnit.findMany({ where: { code: { in: activeCodes } } })
      : [];
    const activeCredits = activeUnits.reduce((sum, u) => sum + u.credits, 0);
    if (activeCredits + unit.credits > MAX_CREDITS) {
      return NextResponse.json(
        {
          error: `Adding this course would exceed the ${MAX_CREDITS}-credit limit — drop or finish a course first`,
        },
        { status: 400 }
      );
    }

    const templates = await db.assignmentTemplate.findMany({
      where: { courseUnitId: unit.id },
    });
    const now = Date.now();

    const course = await db.$transaction(
      async (tx) => {
        const created = await tx.course.create({
          data: {
            name: unit.name,
            code: unit.code,
            term: unit.category.name,
            notes: unit.description,
            color: unit.color ?? unit.category.color,
            userId,
          },
        });
        if (templates.length > 0) {
          await tx.assignment.createMany({
            data: templates.map((t) => ({
              title: t.title,
              description: t.description,
              content: t.content,
              points: t.points,
              dueDate: new Date(now + t.dueInDays * DAY_MS),
              type: t.type,
              priority: t.priority,
              courseId: created.id,
              userId,
            })),
          });
        }
        return created;
      },
      { timeout: 30_000 }
    );

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('POST /api/courses error:', error);
    return NextResponse.json({ error: 'Failed to add course' }, { status: 500 });
  }
}
