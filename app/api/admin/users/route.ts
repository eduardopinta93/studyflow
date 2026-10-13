import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';

const PAGE_SIZE = 12;
const ROLES = ['ADMIN', 'USER'] as const;

export async function GET(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const params = request.nextUrl.searchParams;
    const q = params.get('q')?.trim() ?? '';
    const roleParam = params.get('role') ?? '';
    const role = (ROLES as readonly string[]).includes(roleParam) ? roleParam : undefined;
    const page = Math.max(1, Number(params.get('page') ?? 1) || 1);

    const where = {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' as const } },
              { email: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(role ? { role } : {}),
    };

    const [total, users] = await Promise.all([
      db.user.count({ where }),
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          major: true,
          year: true,
          createdAt: true,
          _count: { select: { courses: true, assignments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
