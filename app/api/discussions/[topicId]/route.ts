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

async function findOwnedTopic(userId: string, topicId: string) {
  return db.discussionTopic.findFirst({
    where: { id: topicId, course: { userId } },
    include: {
      course: { select: { id: true, name: true, code: true, color: true } },
    },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topicId } = await params;

    if (!isValidObjectId(topicId)) {
      return NextResponse.json({ error: 'Invalid discussion ID.' }, { status: 400 });
    }

    const topic = await findOwnedTopic(userId, topicId);

    if (!topic) {
      return NextResponse.json({ error: 'Discussion not found.' }, { status: 404 });
    }

    const entries = await db.discussionEntry.findMany({
      where: { topicId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ ...topic, entries });
  } catch (error) {
    console.error('GET /api/discussions/[topicId] error:', error);
    return NextResponse.json({ error: 'Failed to fetch discussion' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { topicId } = await params;

    if (!isValidObjectId(topicId)) {
      return NextResponse.json({ error: 'Invalid discussion ID.' }, { status: 400 });
    }

    const existing = await findOwnedTopic(userId, topicId);

    if (!existing) {
      return NextResponse.json({ error: 'Discussion not found.' }, { status: 404 });
    }

    const body = await request.json().catch(() => null);

    const topic = await db.discussionTopic.update({
      where: { id: topicId },
      data: {
        ...(typeof body?.title === 'string' && body.title.trim() && {
          title: body.title.trim(),
        }),
        ...(typeof body?.message === 'string' && body.message.trim() && {
          message: body.message.trim(),
        }),
        ...(typeof body?.locked === 'boolean' && { locked: body.locked }),
        ...(typeof body?.pinned === 'boolean' && { pinned: body.pinned }),
      },
    });

    return NextResponse.json(topic);
  } catch (error) {
    console.error('PATCH /api/discussions/[topicId] error:', error);
    return NextResponse.json({ error: 'Failed to update discussion' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { topicId } = await params;

    if (!isValidObjectId(topicId)) {
      return NextResponse.json({ error: 'Invalid discussion ID.' }, { status: 400 });
    }

    const existing = await findOwnedTopic(userId, topicId);

    if (!existing) {
      return NextResponse.json({ error: 'Discussion not found.' }, { status: 404 });
    }

    await db.discussionEntry.deleteMany({ where: { topicId } });
    await db.discussionTopic.delete({ where: { id: topicId } });

    return NextResponse.json({ message: 'Discussion deleted successfully.' });
  } catch (error) {
    console.error('DELETE /api/discussions/[topicId] error:', error);
    return NextResponse.json({ error: 'Failed to delete discussion' }, { status: 500 });
  }
}
