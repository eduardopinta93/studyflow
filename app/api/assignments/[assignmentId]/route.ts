import { NextRequest, NextResponse } from 'next/server';
import { auth, isAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { assignmentId } = await params;
    const body = await request.json();
    const { title, description, content, points, dueDate, completed, type, priority, courseId } = body;

    const existing = await db.assignment.findFirst({
      where: { id: assignmentId, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    if (title !== undefined) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json(
      { error: 'Title cannot be empty' },
      { status: 400 }
    );
  }
}

if (points !== undefined) {
  const numericPoints = Number(points);

  if (
    !Number.isFinite(numericPoints) ||
    numericPoints <= 0 ||
    numericPoints > 100
  ) {
    return NextResponse.json(
      { error: 'Points must be a number between 1 and 100' },
      { status: 400 }
    );
  }
}

let parsedDueDate: Date | undefined;

if (dueDate !== undefined) {
  if (typeof dueDate !== 'string') {
    return NextResponse.json(
      { error: 'Due date must be a valid date' },
      { status: 400 }
    );
  }

  parsedDueDate = new Date(dueDate);

  if (Number.isNaN(parsedDueDate.getTime())) {
    return NextResponse.json(
      { error: 'Due date must be a valid date' },
      { status: 400 }
    );
  }
}

if (completed !== undefined && typeof completed !== 'boolean') {
  return NextResponse.json(
    { error: 'Completed must be a boolean' },
    { status: 400 }
  );
}

if (courseId !== undefined) {
  if (typeof courseId !== 'string' || !courseId) {
    return NextResponse.json(
      { error: 'Course ID must be valid' },
      { status: 400 }
    );
  }

  const course = await db.course.findFirst({
    where: { id: courseId, userId },
  });

  if (!course) {
    return NextResponse.json(
      { error: 'Course not found' },
      { status: 404 }
    );
  }
}

    const assignment = await db.assignment.update({
      where: { id: assignmentId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(content !== undefined && { content: typeof content === 'string' && content.trim() ? content.trim() : null }),
        ...(points !== undefined && { points: Math.min(100, Math.round(Number(points))) }),
        ...(parsedDueDate !== undefined && { dueDate: parsedDueDate }),
        ...(completed !== undefined && { completed }),
        ...(type !== undefined && { type }),
        ...(priority !== undefined && { priority }),
        ...(courseId !== undefined && { courseId }),
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('PATCH /api/assignments/[assignmentId] error:', error);
    return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { assignmentId } = await params;

    const existing = await db.assignment.findFirst({
      where: { id: assignmentId, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    await db.assignment.delete({ where: { id: assignmentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/assignments/[assignmentId] error:', error);
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
  }
}
