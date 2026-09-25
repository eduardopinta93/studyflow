import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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

    const { assignmentId } = await params;
    const body = await request.json();
    const { title, description, content, points, dueDate, completed, type, priority, courseId } = body;

    const existing = await db.assignment.findFirst({
      where: { id: assignmentId, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    if (courseId !== undefined) {
      const course = await db.course.findFirst({
        where: { id: courseId, userId },
      });
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }
    }

    const assignment = await db.assignment.update({
      where: { id: assignmentId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(content !== undefined && { content: typeof content === 'string' && content.trim() ? content.trim() : null }),
        ...(points !== undefined && Number.isFinite(Number(points)) && Number(points) > 0 && { points: Math.min(100, Math.round(Number(points))) }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
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
