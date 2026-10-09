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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { messageId } = await params;

    if (!isValidObjectId(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID.' }, { status: 400 });
    }

    const message = await db.message.findFirst({
      where: { id: messageId, recipientId: userId },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body.read !== 'boolean') {
      return NextResponse.json({ error: 'Expected a boolean `read` value.' }, { status: 400 });
    }

    const updated = await db.message.update({
      where: { id: messageId },
      data: { read: body.read },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/messages/[messageId] error:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { messageId } = await params;

    if (!isValidObjectId(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID.' }, { status: 400 });
    }

    const message = await db.message.findFirst({
      where: {
        id: messageId,
        OR: [{ recipientId: userId }, { senderId: userId }],
      },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found.' }, { status: 404 });
    }

    await db.message.delete({ where: { id: messageId } });

    return NextResponse.json({ message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('DELETE /api/messages/[messageId] error:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
