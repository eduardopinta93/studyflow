import { createHash, randomBytes } from 'node:crypto';

export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

export function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateResetToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(32).toString('hex');
  return {
    token,
    tokenHash: hashResetToken(token),
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  };
}
