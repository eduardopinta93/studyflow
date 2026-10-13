import { NextRequest, NextResponse } from 'next/server';
import { auth, isAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

function isValidObjectId(value: string) {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;

    if (!isValidObjectId(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
    }

    const course = await db.course.findFirst({
      where: { id: courseId, userId },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    const announcements = await db.announcement.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('GET /api/courses/[courseId]/announcements error:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { courseId } = await params;

    if (!isValidObjectId(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
    }

    const course = await db.course.findFirst({
      where: { id: courseId, userId },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 });
    }

    const body = await request.json().catch(() => null);
    const title = body && typeof body.title === 'string' ? body.title.trim() : '';
    const message = body && typeof body.message === 'string' ? body.message.trim() : '';

    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ error: 'Announcement cannot be empty.' }, { status: 400 });
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        message,
        authorName: session?.user?.name ?? session?.user?.email ?? 'Instructor',
        courseId,
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('POST /api/courses/[courseId]/announcements error:', error);
    return NextResponse.json({ error: 'Failed to post announcement' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { courseId } = await params;

    if (!isValidObjectId(courseId)) {
      return NextResponse.json({ error: 'Invalid course ID.' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    const id = body && typeof body.id === 'string' ? body.id : '';

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid announcement ID.' }, { status: 400 });
    }

    const announcement = await db.announcement.findFirst({
      where: { id, courseId, course: { userId } },
      select: { id: true },
    });

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found.' }, { status: 404 });
    }

    await db.announcement.delete({ where: { id } });

    return NextResponse.json({ message: 'Announcement deleted successfully.' });
  } catch (error) {
    console.error('DELETE /api/courses/[courseId]/announcements error:', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
