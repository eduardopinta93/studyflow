import { NextRequest, NextResponse } from 'next/server';
import { deleteCourseCascade, requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';

type Params = { params: Promise<{ userId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { userId } = await params;
    const body = await request.json().catch(() => null);
    const role = body && typeof body.role === 'string' ? body.role : '';

    if (role !== 'ADMIN' && role !== 'USER') {
      return NextResponse.json({ error: 'Role must be ADMIN or USER' }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (role === 'USER' && target.role === 'ADMIN') {
      if (target.id === guard.adminId) {
        return NextResponse.json(
          { error: 'You cannot remove your own admin access' },
          { status: 400 }
        );
      }
      const otherAdmins = await db.user.count({ where: { role: 'ADMIN', id: { not: userId } } });
      if (otherAdmins === 0) {
        return NextResponse.json(
          { error: 'At least one admin must remain' },
          { status: 400 }
        );
      }
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/admin/users/[userId] error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { userId } = await params;

    if (userId === guard.adminId) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    const target = await db.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (target.role === 'ADMIN') {
      const otherAdmins = await db.user.count({ where: { role: 'ADMIN', id: { not: userId } } });
      if (otherAdmins === 0) {
        return NextResponse.json({ error: 'At least one admin must remain' }, { status: 400 });
      }
    }

    const courses = await db.course.findMany({
      where: { userId },
      select: { id: true },
    });
    const topicCount = await db.discussionTopic.count({
      where: { courseId: { in: courses.map((c) => c.id) } },
    });

    for (const course of courses) {
      await deleteCourseCascade(course.id);
    }

    const ownAssignments = await db.assignment.deleteMany({ where: { userId } });
    const messages = await db.message.deleteMany({
      where: { OR: [{ senderId: userId }, { recipientId: userId }] },
    });
    const tokens = await db.passwordResetToken.deleteMany({ where: { userId } });
    const user = await db.user.delete({ where: { id: userId } });

    return NextResponse.json({
      courses: courses.length,
      assignments: ownAssignments.count,
      topics: topicCount,
      messages: messages.count,
      resetTokens: tokens.count,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error('DELETE /api/admin/users/[userId] error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
