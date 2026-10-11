import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { hashResetToken } from '@/lib/reset-token';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const token = typeof body.token === 'string' ? body.token.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const record = await db.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired. Request a new one.' },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);
    const [updated] = await db.$transaction([
      db.user.update({ where: { id: record.userId }, data: { password: hashed } }),
      db.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    return NextResponse.json({ ok: true, user: { id: updated.id, email: updated.email } });
  } catch (error) {
    console.error('POST /api/auth/reset-password error:', error);
    return NextResponse.json({ error: 'Password reset failed' }, { status: 500 });
  }
}
