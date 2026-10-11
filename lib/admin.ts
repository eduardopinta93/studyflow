import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

type AdminGuard = { ok: true; adminId: string } | { ok: false; response: NextResponse };

export async function requireAdmin(): Promise<AdminGuard> {
  const session = await auth();
  const id = session?.user?.id;

  if (!id) {
    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (session?.user?.role !== 'ADMIN') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    };
  }
  return { ok: true, adminId: id };
}

/*
 * DiscussionEntry replies form a self-relation with onDelete: NoAction, so
 * Prisma refuses a bulk delete while children still point at their parents.
 * Delete leaf entries first and repeat until the topic has none left.
 */
export async function deleteTopicEntries(topicIds: string[]): Promise<number> {
  if (topicIds.length === 0) return 0;

  let removed = 0;
  for (;;) {
    const entries = await db.discussionEntry.findMany({
      where: { topicId: { in: topicIds } },
      select: { id: true, parentId: true },
    });
    if (entries.length === 0) return removed;

    const parentIds = new Set(entries.map((entry) => entry.parentId).filter(Boolean));
    const leafIds = entries.filter((entry) => !parentIds.has(entry.id)).map((entry) => entry.id);
    if (leafIds.length === 0) return removed;

    removed += (
      await db.discussionEntry.deleteMany({ where: { id: { in: leafIds } } })
    ).count;
  }
}

export async function deleteCourseCascade(courseId: string) {
  const topics = await db.discussionTopic.findMany({
    where: { courseId },
    select: { id: true },
  });
  const topicIds = topics.map((topic) => topic.id);

  await deleteTopicEntries(topicIds);
  await db.discussionTopic.deleteMany({ where: { courseId } });
  await db.announcement.deleteMany({ where: { courseId } });
  await db.assignment.deleteMany({ where: { courseId } });
  await db.course.delete({ where: { id: courseId } });
}

export async function attachOwners<T extends { userId: string }>(
  rows: T[]
): Promise<(T & { user: { id: string; name: string; email: string; avatarUrl: string | null } | null })[]> {
  const ids = [...new Set(rows.map((row) => row.userId))];
  const owners =
    ids.length > 0
      ? await db.user.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true, email: true, avatarUrl: true },
        })
      : [];
  const byId = new Map(owners.map((owner) => [owner.id, owner]));

  return rows.map((row) => ({ ...row, user: byId.get(row.userId) ?? null }));
}
