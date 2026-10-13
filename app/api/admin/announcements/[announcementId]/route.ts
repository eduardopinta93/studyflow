import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';

type Params = { params: Promise<{ announcementId: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { announcementId } = await params;

    const announcement = await db.announcement.findUnique({
      where: { id: announcementId },
      select: { id: true },
    });
    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    await db.announcement.delete({ where: { id: announcementId } });
    return NextResponse.json({ ok: true, id: announcementId });
  } catch (error) {
    console.error('DELETE /api/admin/announcements/[announcementId] error:', error);
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
  }
}
