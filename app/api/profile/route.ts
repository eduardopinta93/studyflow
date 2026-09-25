import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const MAX_AVATAR_LENGTH = 2_800_000;
const AVATAR_DATA_URL = /^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/]+=*$/;

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        major: true,
        year: true,
        studyGoal: true,
        avatarUrl: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const fields: Record<string, string | null> = {};
    for (const key of ['major', 'year', 'studyGoal', 'avatarUrl', 'name'] as const) {
      const value = body[key];
      if (value === undefined) continue;
      if (value === null || typeof value === 'string') {
        const normalizedValue = value === null ? null : value.trim() || null;
        if (key === 'avatarUrl' && normalizedValue?.startsWith('data:')) {
          if (normalizedValue.length > MAX_AVATAR_LENGTH || !AVATAR_DATA_URL.test(normalizedValue)) {
            return NextResponse.json({ error: 'Profile photo must be a valid image smaller than 2 MB' }, { status: 400 });
          }
        }
        fields[key] = normalizedValue;
      } else {
        return NextResponse.json({ error: `Invalid value for ${key}` }, { status: 400 });
      }
    }

    if (Object.keys(fields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: fields,
      select: {
        id: true,
        name: true,
        email: true,
        major: true,
        year: true,
        studyGoal: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('PATCH /api/profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
