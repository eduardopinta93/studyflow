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
        assignments: {
          select: {
            completed: true,
            points: true,
          },
        },
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

    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    /*
     * Main application flow:
     * create a course from an existing catalog course unit.
     */
    const unitId =
      body && typeof body.unitId === 'string' ? body.unitId : '';

    if (unitId) {
      const unit = await db.courseUnit.findUnique({
        where: { id: unitId },
        include: { category: true },
      });

      if (!unit) {
        return NextResponse.json(
          { error: 'Course not found in the catalog' },
          { status: 404 }
        );
      }

      const owned = await db.course.findMany({
        where: { userId },
        select: {
          code: true,
          assignments: {
            select: { completed: true },
          },
        },
      });

      const ownedCodes = owned
        .map((course) => course.code)
        .filter((code): code is string => !!code);

      if (ownedCodes.includes(unit.code)) {
        return NextResponse.json(
          { error: 'That course is already on your dashboard' },
          { status: 409 }
        );
      }

      const activeCodes = owned
        .filter(
          (course) =>
            course.code &&
            (course.assignments.length === 0 ||
              course.assignments.some((assignment) => !assignment.completed))
        )
        .map((course) => course.code as string);

      const activeUnits =
        activeCodes.length > 0
          ? await db.courseUnit.findMany({
              where: { code: { in: activeCodes } },
            })
          : [];

      const activeCredits = activeUnits.reduce(
        (sum, courseUnit) => sum + courseUnit.credits,
        0
      );

      const MAX_CREDITS = 8;

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
              data: templates.map((template) => ({
                title: template.title,
                description: template.description,
                content: template.content,
                points: template.points,
                dueDate: new Date(
                  now + template.dueInDays * 24 * 60 * 60 * 1000
                ),
                type: template.type,
                priority: template.priority,
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
    }

    /*
     * Direct CRUD flow:
     * allows creating a course directly, which preserves the
     * Course CRUD behavior implemented in this feature branch.
     */
    const name =
      body && typeof body.name === 'string' ? body.name.trim() : '';

    if (!name) {
      return NextResponse.json(
        { error: 'Course name is required.' },
        { status: 400 }
      );
    }

    const code =
      body && typeof body.code === 'string'
        ? body.code.trim() || null
        : null;

    const term =
      body && typeof body.term === 'string'
        ? body.term.trim() || null
        : null;

    const notes =
      body && typeof body.notes === 'string'
        ? body.notes.trim() || null
        : null;

    const color =
      body && typeof body.color === 'string'
        ? body.color
        : undefined;

    const course = await db.course.create({
      data: {
        name,
        code,
        term,
        notes,
        ...(color !== undefined && { color }),
        userId,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('POST /api/courses error:', error);

    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}