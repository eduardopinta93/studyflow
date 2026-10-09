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

async function collectDescendants(entryId: string): Promise<string[]> {
  const children = await db.discussionEntry.findMany({
    where: { parentId: entryId },
    select: { id: true },
  });

  const ids: string[] = [];
  for (const child of children) {
    ids.push(child.id, ...(await collectDescendants(child.id)));
  }
  return ids;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ topicId: string; entryId: string }> }
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { topicId, entryId } = await params;

    if (!isValidObjectId(topicId) || !isValidObjectId(entryId)) {
      return NextResponse.json({ error: 'Invalid ID.' }, { status: 400 });
    }

    const entry = await db.discussionEntry.findFirst({
      where: { id: entryId, topicId, topic: { course: { userId } } },
      select: { id: true },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Reply not found.' }, { status: 404 });
    }

    const descendantIds = await collectDescendants(entryId);

    await db.discussionEntry.deleteMany({
      where: { id: { in: [entryId, ...descendantIds] } },
    });

    return NextResponse.json({ message: 'Reply deleted successfully.' });
  } catch (error) {
    console.error('DELETE /api/discussions/[topicId]/entries/[entryId] error:', error);
    return NextResponse.json({ error: 'Failed to delete reply' }, { status: 500 });
  }
}
