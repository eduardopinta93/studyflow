import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [categories, user] = await Promise.all([
      db.studyCategory.findMany({
        orderBy: { name: 'asc' },
        include: {
          courseUnits: {
            orderBy: { code: 'asc' },
            select: { id: true, code: true, name: true, credits: true, description: true, color: true },
          },
        },
      }),
      db.user.findUnique({ where: { id: userId }, select: { categoryId: true } }),
    ]);

    return NextResponse.json({
      enrolledCategoryId: user?.categoryId ?? null,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        color: c.color,
        courseUnits: c.courseUnits,
      })),
    });
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
