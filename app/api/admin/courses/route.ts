import { NextRequest, NextResponse } from 'next/server';
import { attachOwners, requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const params = request.nextUrl.searchParams;
    const q = params.get('q')?.trim() ?? '';
    const page = Math.max(1, Number(params.get('page') ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(params.get('limit') ?? PAGE_SIZE) || PAGE_SIZE));

    let where = {};
    if (q) {
      const matchingOwners = await db.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
          ],
        },
        select: { id: true },
      });
      where = {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { code: { contains: q, mode: 'insensitive' as const } },
          { userId: { in: matchingOwners.map((owner) => owner.id) } },
        ],
      };
    }

    const [total, coursesRaw] = await Promise.all([
      db.course.count({ where }),
      db.course.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          term: true,
          color: true,
          createdAt: true,
          userId: true,
          _count: {
            select: { assignments: true, announcements: true, discussionTopics: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const courses = await attachOwners(coursesRaw);

    return NextResponse.json({
      courses,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    console.error('GET /api/admin/courses error:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
