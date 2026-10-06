import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

function isValidObjectId(value: string) {
  return /^[0-9a-fA-F]{24}$/.test(value);
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const box = request.nextUrl.searchParams.get('box');
    const sent = box === 'sent';

    const messages = await db.message.findMany({
      where: sent ? { senderId: userId } : { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
        recipient: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('GET /api/messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    const recipientId = body && typeof body.recipientId === 'string' ? body.recipientId : '';
    const subject = body && typeof body.subject === 'string' ? body.subject.trim() : '';
    const text = body && typeof body.body === 'string' ? body.body.trim() : '';

    if (!isValidObjectId(recipientId)) {
      return NextResponse.json({ error: 'Invalid recipient.' }, { status: 400 });
    }

    if (!subject) {
      return NextResponse.json({ error: 'Subject is required.' }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    if (recipientId === userId) {
      return NextResponse.json({ error: 'You cannot message yourself.' }, { status: 400 });
    }

    const recipient = await db.user.findUnique({ where: { id: recipientId } });
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found.' }, { status: 404 });
    }

    const message = await db.message.create({
      data: {
        subject,
        body: text,
        senderId: userId,
        senderName: session?.user?.name ?? session?.user?.email ?? 'Student',
        recipientId,
      },
      include: {
        sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
        recipient: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('POST /api/messages error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
