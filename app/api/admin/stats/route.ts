import { NextResponse } from 'next/server';
import { attachOwners, requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const now = Date.now();
    const [
      users,
      admins,
      usersLast7Days,
      usersLast30Days,
      courses,
      assignments,
      completedAssignments,
      messages,
      unreadMessages,
      discussionTopics,
      discussionEntries,
      announcements,
      activeResetTokens,
      recentUsers,
      recentCoursesRaw,
      upcomingRaw,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: 'ADMIN' } }),
      db.user.count({ where: { createdAt: { gte: new Date(now - 7 * DAY_MS) } } }),
      db.user.count({ where: { createdAt: { gte: new Date(now - 30 * DAY_MS) } } }),
      db.course.count(),
      db.assignment.count(),
      db.assignment.count({ where: { completed: true } }),
      db.message.count(),
      db.message.count({ where: { read: false } }),
      db.discussionTopic.count(),
      db.discussionEntry.count(),
      db.announcement.count(),
      db.passwordResetToken.count({ where: { usedAt: null, expiresAt: { gt: new Date(now) } } }),
      db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          _count: { select: { courses: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      db.course.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          color: true,
          createdAt: true,
          userId: true,
          _count: { select: { assignments: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      db.assignment.findMany({
        where: { completed: false, dueDate: { gte: new Date(now) } },
        select: {
          id: true,
          title: true,
          dueDate: true,
          priority: true,
          courseId: true,
          userId: true,
        },
        orderBy: { dueDate: 'asc' },
        take: 6,
      }),
    ]);

    /*
     * Owners and courses are loaded separately: a stray orphaned row would make
     * Prisma throw on the required relation and blank out the whole console.
     */
    const recentCourses = await attachOwners(recentCoursesRaw);

    const assignmentCourseIds = [...new Set(upcomingRaw.map((a) => a.courseId))];
    const assignmentUserIds = [...new Set(upcomingRaw.map((a) => a.userId))];
    const [assignmentCourses, assignmentUsers] = await Promise.all([
      db.course.findMany({
        where: { id: { in: assignmentCourseIds } },
        select: { id: true, name: true, color: true },
      }),
      db.user.findMany({
        where: { id: { in: assignmentUserIds } },
        select: { id: true, name: true },
      }),
    ]);
    const courseById = new Map(assignmentCourses.map((c) => [c.id, c]));
    const userById = new Map(assignmentUsers.map((u) => [u.id, u]));

    const upcomingAssignments = upcomingRaw.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      dueDate: assignment.dueDate,
      priority: assignment.priority,
      course: courseById.get(assignment.courseId) ?? { name: 'Deleted course', color: '#94a3b8' },
      user: userById.get(assignment.userId) ?? { name: 'Deleted user' },
    }));

    return NextResponse.json({
      totals: {
        users,
        admins,
        students: Math.max(users - admins, 0),
        courses,
        assignments,
        completedAssignments,
        completionRate:
          assignments === 0 ? 0 : Math.round((completedAssignments / assignments) * 100),
        messages,
        unreadMessages,
        discussionTopics,
        discussionEntries,
        announcements,
        activeResetTokens,
      },
      growth: { last7Days: usersLast7Days, last30Days: usersLast30Days },
      recentUsers,
      recentCourses,
      upcomingAssignments,
    });
  } catch (error) {
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json({ error: 'Failed to load admin stats' }, { status: 500 });
  }
}
