import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEMO_USER_ID = 'demo-user';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const course = await db.course.findFirst({
      where: { id: courseId, userId: DEMO_USER_ID },
      include: { assignments: { orderBy: { dueDate: 'asc' } } },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('GET /api/courses/[courseId] error:', error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const body = await request.json();
    const { name, code, term, notes, color } = body;

    const existing = await db.course.findFirst({
      where: { id: courseId, userId: DEMO_USER_ID },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const course = await db.course.update({
      where: { id: courseId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(code !== undefined && { code: code?.trim() || null }),
        ...(term !== undefined && { term: term?.trim() || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(color !== undefined && { color }),
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('PATCH /api/courses/[courseId] error:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;

    const existing = await db.course.findFirst({
      where: { id: courseId, userId: DEMO_USER_ID },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    await db.course.delete({ where: { id: courseId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/courses/[courseId] error:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
