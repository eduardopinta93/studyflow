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

    const topics = await db.discussionTopic.findMany({
      where: { courseId },
      include: {
        _count: { select: { entries: true } },
        entries: {
          select: { createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(
      topics.map(({ entries, ...topic }) => ({
        ...topic,
        lastReplyAt: entries[0]?.createdAt ?? null,
      }))
    );
  } catch (error) {
    console.error('GET /api/courses/[courseId]/discussions error:', error);
    return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 });
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
      return NextResponse.json({ error: 'Discussion message cannot be empty.' }, { status: 400 });
    }

    const topic = await db.discussionTopic.create({
      data: {
        title,
        message,
        authorName: session?.user?.name ?? session?.user?.email ?? 'Student',
        courseId,
        locked: body?.locked === true,
        pinned: body?.pinned === true,
      },
      include: { _count: { select: { entries: true } } },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error('POST /api/courses/[courseId]/discussions error:', error);
    return NextResponse.json({ error: 'Failed to create discussion' }, { status: 500 });
  }
}
