import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

type CreateCourseRequest = {
  name?: unknown;
  code?: unknown;
  term?: unknown;
  notes?: unknown;
  userId?: unknown;
};

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Failed to retrieve courses:', error);

    return NextResponse.json(
      { error: 'Failed to retrieve courses.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateCourseRequest;

    if (
      typeof body.name !== 'string' ||
      body.name.trim().length === 0 ||
      typeof body.userId !== 'string' ||
      !/^[0-9a-fA-F]{24}$/.test(body.userId)
    ) {
      return NextResponse.json(
        { error: 'A course name and valid userId are required.' },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        name: body.name.trim(),
        code: typeof body.code === 'string' ? body.code.trim() || null : null,
        term: typeof body.term === 'string' ? body.term.trim() || null : null,
        notes:
          typeof body.notes === 'string' ? body.notes.trim() || null : null,
        userId: body.userId,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Failed to create course:', error);

    return NextResponse.json(
      { error: 'Failed to create course.' },
      { status: 500 }
    );
  }
}
