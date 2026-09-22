import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEMO_USER_ID = 'demo-user';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { assignmentId } = await params;
    const body = await request.json();
    const { title, description, dueDate, completed, type, priority, courseId } = body;

    const existing = await db.assignment.findFirst({
      where: { id: assignmentId, userId: DEMO_USER_ID },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const assignment = await db.assignment.update({
      where: { id: assignmentId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
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
    const { assignmentId } = await params;

    const existing = await db.assignment.findFirst({
      where: { id: assignmentId, userId: DEMO_USER_ID },
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
