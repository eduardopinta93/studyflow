import nodemailer from 'nodemailer';

export function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function resetPasswordUrl(token: string): string {
  const base = (
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
    'http://localhost:3000'
  ).replace(/\/+$/, '');
  return `${base}/auth/reset-password?token=${encodeURIComponent(token)}`;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  if (!isSmtpConfigured()) {
    console.warn(
      `[mailer] SMTP is not configured — password reset link for ${to}: ${resetUrl}`
    );
    return;
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
    to,
    subject: 'Reset your StudyFlow password',
    text: [
      'We received a request to reset your StudyFlow password.',
      '',
      `Open this link to choose a new password: ${resetUrl}`,
      '',
      'The link expires in 30 minutes and can only be used once.',
      'If you did not request this, you can safely ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 12px">Reset your password</h2>
        <p style="color:#444">We received a request to reset your StudyFlow password.</p>
        <p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#154920;color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px">
            Choose a new password
          </a>
        </p>
        <p style="color:#666;font-size:13px">
          The link expires in 30 minutes and can only be used once.<br/>
          If you did not request this, you can safely ignore this email.
        </p>
      </div>`,
  });
}
