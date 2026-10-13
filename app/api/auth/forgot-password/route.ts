import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isSmtpConfigured, resetPasswordUrl, sendPasswordResetEmail } from '@/lib/mailer';
import { generateResetToken } from '@/lib/reset-token';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = body && typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    // Always respond with success so the endpoint never reveals which accounts exist.
    const success = NextResponse.json({ ok: true });

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return success;

    const { token, tokenHash, expiresAt } = generateResetToken();

    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await db.passwordResetToken.create({
      data: { tokenHash, userId: user.id, expiresAt },
    });

    try {
      await sendPasswordResetEmail(user.email, resetPasswordUrl(token));
    } catch (error) {
      console.error('Password reset email failed:', error);
      return NextResponse.json({ error: 'Could not send the reset email' }, { status: 502 });
    }

    // Local development convenience: with no SMTP configured the link is only
    // printed in the server log, so surface it in the response too.
    if (!isSmtpConfigured() && process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ ok: true, devResetUrl: resetPasswordUrl(token) });
    }

    return success;
  } catch (error) {
    console.error('POST /api/auth/forgot-password error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
