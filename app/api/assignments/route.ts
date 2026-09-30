import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

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

    const assignments = await db.assignment.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('GET /api/assignments error:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, content, points, dueDate, courseId, type, priority } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!dueDate) {
      return NextResponse.json({ error: 'Due date is required' }, { status: 400 });
    }

    if (!courseId) {
      return NextResponse.json({ error: 'Course is required' }, { status: 400 });
    }

    const course = await db.course.findFirst({
      where: { id: courseId, userId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const assignment = await db.assignment.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        content: typeof content === 'string' && content.trim() ? content.trim() : null,
        points: Number.isFinite(Number(points)) && Number(points) > 0 ? Math.min(100, Math.round(Number(points))) : 10,
        dueDate: new Date(dueDate),
        courseId,
        userId,
        type: type || 'assignment',
        priority: priority || 'medium',
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('POST /api/assignments error:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
