import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{
    courseId: string;
  }>;
};

type UpdateCourseRequest = {
  name?: unknown;
  code?: unknown;
  term?: unknown;
  notes?: unknown;
};

function isValidObjectId(value: string) {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { courseId } = await context.params;

    if (!isValidObjectId(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID.' },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Failed to retrieve course:', error);

    return NextResponse.json(
      { error: 'Failed to retrieve course.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { courseId } = await context.params;

    if (!isValidObjectId(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID.' },
        { status: 400 }
      );
    }

    const existingCourse = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    const body = (await request.json()) as UpdateCourseRequest;

    if (
      body.name !== undefined &&
      (typeof body.name !== 'string' || body.name.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: 'Course name cannot be empty.' },
        { status: 400 }
      );
    }

    const course = await prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        ...(typeof body.name === 'string' && { name: body.name.trim() }),
        ...(typeof body.code === 'string' && {
          code: body.code.trim() || null,
        }),
        ...(typeof body.term === 'string' && {
          term: body.term.trim() || null,
        }),
        ...(typeof body.notes === 'string' && {
          notes: body.notes.trim() || null,
        }),
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Failed to update course:', error);

    return NextResponse.json(
      { error: 'Failed to update course.' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { courseId } = await context.params;

    if (!isValidObjectId(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID.' },
        { status: 400 }
      );
    }

    const existingCourse = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    await prisma.course.delete({
      where: {
        id: courseId,
      },
    });

    return NextResponse.json({
      message: 'Course deleted successfully.',
    });
  } catch (error) {
    console.error('Failed to delete course:', error);

    return NextResponse.json(
      { error: 'Failed to delete course.' },
      { status: 500 }
    );
  }
}
