import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const params = request.nextUrl.searchParams;
    const q = params.get('q')?.trim() ?? '';
    const page = Math.max(1, Number(params.get('page') ?? 1) || 1);

    let courseFilter = {};
    if (q) {
      const matchingCourses = await db.course.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { code: { contains: q, mode: 'insensitive' as const } },
          ],
        },
        select: { id: true },
      });
      courseFilter = { courseId: { in: matchingCourses.map((course) => course.id) } };
    }

    const where = q
      ? {
          OR: [
            courseFilter,
            { title: { contains: q, mode: 'insensitive' as const } },
            { message: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, announcementsRaw] = await Promise.all([
      db.announcement.count({ where }),
      db.announcement.findMany({
        where,
        select: {
          id: true,
          title: true,
          message: true,
          authorName: true,
          createdAt: true,
          courseId: true,
          course: { select: { id: true, name: true, code: true, color: true, userId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    const ownerIds = [...new Set(announcementsRaw.map((a) => a.course.userId))];
    const owners =
      ownerIds.length > 0
        ? await db.user.findMany({
            where: { id: { in: ownerIds } },
            select: { id: true, name: true, email: true },
          })
        : [];
    const ownerById = new Map(owners.map((owner) => [owner.id, owner]));

    const announcements = announcementsRaw.map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      message: announcement.message,
      authorName: announcement.authorName,
      createdAt: announcement.createdAt,
      course: {
        id: announcement.course.id,
        name: announcement.course.name,
        code: announcement.course.code,
        color: announcement.course.color,
        owner: ownerById.get(announcement.course.userId) ?? null,
      },
    }));

    return NextResponse.json({
      announcements,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  } catch (error) {
    console.error('GET /api/admin/announcements error:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json().catch(() => null);
    const courseId = body && typeof body.courseId === 'string' ? body.courseId : '';
    const title = body && typeof body.title === 'string' ? body.title.trim() : '';
    const message = body && typeof body.message === 'string' ? body.message.trim() : '';

    if (!courseId) {
      return NextResponse.json({ error: 'A course is required' }, { status: 400 });
    }
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ error: 'Announcement cannot be empty' }, { status: 400 });
    }

    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true, name: true },
    });
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const session = await auth();
    const announcement = await db.announcement.create({
      data: {
        title,
        message,
        authorName: session?.user?.name ?? session?.user?.email ?? 'Admin',
        courseId,
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/announcements error:', error);
    return NextResponse.json({ error: 'Failed to post announcement' }, { status: 500 });
  }
}
