import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const MAX_CREDITS = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const categoryId = body && typeof body.categoryId === 'string' ? body.categoryId : '';
    const unitIds =
      body && Array.isArray(body.unitIds) ? body.unitIds.filter((id: unknown) => typeof id === 'string') : [];

    if (!categoryId) {
      return NextResponse.json({ error: 'Study category is required' }, { status: 400 });
    }
    if (unitIds.length === 0) {
      return NextResponse.json({ error: 'Choose at least one course unit' }, { status: 400 });
    }
    if (new Set(unitIds).size !== unitIds.length) {
      return NextResponse.json({ error: 'Duplicate course units selected' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId }, select: { categoryId: true } });
    if (user?.categoryId) {
      return NextResponse.json({ error: 'You are already enrolled in a category' }, { status: 409 });
    }

    const category = await db.studyCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: 'Study category not found' }, { status: 404 });
    }

    const units = await db.courseUnit.findMany({
      where: { id: { in: unitIds } },
    });
    if (units.length !== new Set(unitIds).size) {
      return NextResponse.json({ error: 'One or more course units could not be found' }, { status: 400 });
    }

    const totalCredits = units.reduce((sum, u) => sum + u.credits, 0);
    if (totalCredits > MAX_CREDITS) {
      return NextResponse.json(
        { error: `Selection must not exceed ${MAX_CREDITS} credits` },
        { status: 400 }
      );
    }

    const templates = await db.assignmentTemplate.findMany({
      where: { courseUnitId: { in: units.map((u) => u.id) } },
    });

    const now = Date.now();
    const result = await db.$transaction(
      async (tx) => {
        const courses = await tx.course.createManyAndReturn({
          data: units.map((unit) => ({
            name: unit.name,
            code: unit.code,
            term: category.name,
            notes: unit.description,
            color: unit.color ?? category.color,
            userId,
          })),
        });

        const courseIdByUnit = new Map(units.map((unit, i) => [unit.id, courses[i].id]));
        const assignmentData = templates
          .filter((t) => courseIdByUnit.has(t.courseUnitId))
          .map((t) => ({
            title: t.title,
            description: t.description,
            content: t.content,
            points: t.points,
            dueDate: new Date(now + t.dueInDays * DAY_MS),
            type: t.type,
            priority: t.priority,
            courseId: courseIdByUnit.get(t.courseUnitId)!,
            userId,
          }));

        if (assignmentData.length > 0) {
          await tx.assignment.createMany({ data: assignmentData });
        }

        await tx.user.update({ where: { id: userId }, data: { categoryId } });

        return { courses, assignmentCount: assignmentData.length };
      },
      { timeout: 30_000 }
    );

    return NextResponse.json(
      {
        category: { id: category.id, name: category.name },
        credits: totalCredits,
        courses: result.courses.map((c) => ({ id: c.id, name: c.name, code: c.code })),
        assignmentCount: result.assignmentCount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/enrollment error:', error);
    return NextResponse.json({ error: 'Enrollment failed' }, { status: 500 });
  }
}
