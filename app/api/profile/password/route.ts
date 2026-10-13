import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
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

    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Enter your current password and a new password' },
        { status: 400 }
      );
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (newPassword === currentPassword) {
      return NextResponse.json(
        { error: 'New password must be different from your current password' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });
    if (!user?.password) {
      return NextResponse.json(
        { error: 'This account uses an external sign-in provider and has no password' },
        { status: 400 }
      );
    }

    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const hashed = await hashPassword(newPassword);
    await db.$transaction([
      db.user.update({ where: { id: user.id }, data: { password: hashed } }),
      db.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/profile/password error:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
