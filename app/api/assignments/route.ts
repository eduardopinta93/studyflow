import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const DEMO_USER_ID = 'demo-user';

export async function GET() {
  try {
    await db.user.upsert({
      where: { id: DEMO_USER_ID },
      update: {},
      create: {
        id: DEMO_USER_ID,
        name: 'Student',
        email: 'demo@studyflow.app',
        password: 'demo',
      },
    });

    const assignments = await db.assignment.findMany({
      where: { userId: DEMO_USER_ID },
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
    const body = await request.json();
    const { title, description, dueDate, courseId, type, priority } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!dueDate) {
      return NextResponse.json({ error: 'Due date is required' }, { status: 400 });
    }

    if (!courseId) {
      return NextResponse.json({ error: 'Course is required' }, { status: 400 });
    }

    await db.user.upsert({
      where: { id: DEMO_USER_ID },
      update: {},
      create: {
        id: DEMO_USER_ID,
        name: 'Student',
        email: 'demo@studyflow.app',
        password: 'demo',
      },
    });

    const course = await db.course.findFirst({
      where: { id: courseId, userId: DEMO_USER_ID },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const assignment = await db.assignment.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        dueDate: new Date(dueDate),
        courseId,
        userId: DEMO_USER_ID,
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
