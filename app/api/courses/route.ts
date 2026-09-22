import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Temporary: hardcoded userId for MVP (no auth yet)
const DEMO_USER_ID = 'demo-user';

export async function GET() {
  try {
    // Ensure demo user exists
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

    const courses = await db.course.findMany({
      where: { userId: DEMO_USER_ID },
      include: { _count: { select: { assignments: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('GET /api/courses error:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, term, notes, color } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Course name is required' }, { status: 400 });
    }

    // Ensure demo user exists
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

    const course = await db.course.create({
      data: {
        name: name.trim(),
        code: code?.trim() || null,
        term: term?.trim() || null,
        notes: notes?.trim() || null,
        color: color || '#4F46E5',
        userId: DEMO_USER_ID,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('POST /api/courses error:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
