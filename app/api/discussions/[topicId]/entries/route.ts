import { NextRequest, NextResponse } from 'next/server';
import { auth, isAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

function isValidObjectId(value: string) {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
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

    const { topicId } = await params;

    if (!isValidObjectId(topicId)) {
      return NextResponse.json({ error: 'Invalid discussion ID.' }, { status: 400 });
    }

    const topic = await db.discussionTopic.findFirst({
      where: { id: topicId, course: { userId } },
      select: { id: true, locked: true },
    });

    if (!topic) {
      return NextResponse.json({ error: 'Discussion not found.' }, { status: 404 });
    }

    if (topic.locked) {
      return NextResponse.json(
        { error: 'This discussion is closed for new replies.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    const message = body && typeof body.message === 'string' ? body.message.trim() : '';

    if (!message) {
      return NextResponse.json({ error: 'Reply cannot be empty.' }, { status: 400 });
    }

    const parentId =
      body && typeof body.parentId === 'string' && body.parentId.trim()
        ? body.parentId.trim()
        : null;

    if (parentId) {
      if (!isValidObjectId(parentId)) {
        return NextResponse.json({ error: 'Invalid parent reply.' }, { status: 400 });
      }

      const parent = await db.discussionEntry.findFirst({
        where: { id: parentId, topicId },
        select: { id: true },
      });

      if (!parent) {
        return NextResponse.json({ error: 'Parent reply not found.' }, { status: 404 });
      }
    }

    const entry = await db.discussionEntry.create({
      data: {
        message,
        topicId,
        parentId,
        authorName: session?.user?.name ?? session?.user?.email ?? 'Student',
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('POST /api/discussions/[topicId]/entries error:', error);
    return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 });
  }
}
