import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const MAX_AVATAR_LENGTH = 2_800_000;
const AVATAR_DATA_URL = /^data:image\/(?:png|jpe?g|webp|gif);base64,[A-Za-z0-9+/]+=*$/;

const NAME_MAX = 100;
const MAJOR_MAX = 100;
const YEAR_MAX = 50;
const STUDY_GOAL_MAX = 1000;
const AVATAR_URL_MAX = 500;
const HEADLINE_MAX = 120;
const BIO_MAX = 1000;
const SKILLS_MAX = 500;
const LOCATION_MAX = 100;
const PHONE_MAX = 20;
const URL_MAX = 300;

const URL_FIELDS = ['website', 'linkedinUrl', 'githubUrl'] as const;
const TEXT_LIMITS: Record<string, number> = {
  headline: HEADLINE_MAX,
  bio: BIO_MAX,
  skills: SKILLS_MAX,
  location: LOCATION_MAX,
  whatsappPhone: PHONE_MAX,
  website: URL_MAX,
  linkedinUrl: URL_MAX,
  githubUrl: URL_MAX,
};

function normalizeUrl(value: string): string | null {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    if (!url.hostname.includes('.')) return null;
    return withProtocol;
  } catch {
    return null;
  }
}

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
        headline: true,
        bio: true,
        skills: true,
        location: true,
        whatsappPhone: true,
        website: true,
        linkedinUrl: true,
        githubUrl: true,
        role: true,
        createdAt: true,
        category: { select: { name: true, color: true } },
        _count: { select: { courses: true, assignments: true } },
        courses: {
          select: {
            id: true,
            name: true,
            code: true,
            term: true,
            color: true,
            _count: { select: { assignments: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const completedAssignments = await db.assignment.count({
      where: { userId, completed: true },
    });

    const { _count, ...rest } = user;
    return NextResponse.json({
      user: {
        ...rest,
        stats: {
          courses: _count.courses,
          assignments: _count.assignments,
          completed: completedAssignments,
        },
      },
    });
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
    for (const key of [
      'major',
      'year',
      'studyGoal',
      'avatarUrl',
      'name',
      'headline',
      'bio',
      'skills',
      'location',
      'whatsappPhone',
      'website',
      'linkedinUrl',
      'githubUrl',
    ] as const) {
      const value = body[key];
      if (value === undefined) continue;
      if (value !== null && typeof value !== 'string') {
        return NextResponse.json({ error: `Invalid value for ${key}` }, { status: 400 });
      }
      let normalizedValue = value === null ? null : value.trim() || null;

      if (key === 'name') {
        if (normalizedValue === null) {
          return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
        }
        if (normalizedValue.length > NAME_MAX) {
          return NextResponse.json(
            { error: `Name must be ${NAME_MAX} characters or fewer.` },
            { status: 400 }
          );
        }
      }

      if (key === 'major' && normalizedValue && normalizedValue.length > MAJOR_MAX) {
        return NextResponse.json(
          { error: `Major must be ${MAJOR_MAX} characters or fewer.` },
          { status: 400 }
        );
      }

      if (key === 'year' && normalizedValue && normalizedValue.length > YEAR_MAX) {
        return NextResponse.json(
          { error: `Year must be ${YEAR_MAX} characters or fewer.` },
          { status: 400 }
        );
      }

      if (key === 'studyGoal' && normalizedValue && normalizedValue.length > STUDY_GOAL_MAX) {
        return NextResponse.json(
          { error: `Study goal must be ${STUDY_GOAL_MAX} characters or fewer.` },
          { status: 400 }
        );
      }

      if (key === 'avatarUrl') {
        if (normalizedValue?.startsWith('data:')) {
          if (normalizedValue.length > MAX_AVATAR_LENGTH || !AVATAR_DATA_URL.test(normalizedValue)) {
            return NextResponse.json({ error: 'Profile photo must be a valid image smaller than 2 MB' }, { status: 400 });
          }
        } else if (normalizedValue && normalizedValue.length > AVATAR_URL_MAX) {
          return NextResponse.json({ error: 'Profile photo URL is too long.' }, { status: 400 });
        }
      }

      const textLimit = TEXT_LIMITS[key];
      if (textLimit && normalizedValue && normalizedValue.length > textLimit) {
        return NextResponse.json(
          { error: `This field must be ${textLimit} characters or fewer.` },
          { status: 400 }
        );
      }

      if (key === 'whatsappPhone' && normalizedValue) {
        const compact = normalizedValue.replace(/[\s\-().]/g, '');
        if (!/^\+?\d{7,15}$/.test(compact)) {
          return NextResponse.json(
            { error: 'Enter a valid WhatsApp number with country code, e.g. +256700000000' },
            { status: 400 }
          );
        }
        normalizedValue = compact;
      }

      if ((URL_FIELDS as readonly string[]).includes(key) && normalizedValue) {
        const normalized = normalizeUrl(normalizedValue);
        if (!normalized) {
          return NextResponse.json({ error: 'Enter a valid URL, e.g. https://example.com' }, { status: 400 });
        }
        normalizedValue = normalized;
      }

      fields[key] = normalizedValue;
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
        headline: true,
        bio: true,
        skills: true,
        location: true,
        whatsappPhone: true,
        website: true,
        linkedinUrl: true,
        githubUrl: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('PATCH /api/profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
