'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDevResetUrl(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setDevResetUrl(data.devResetUrl ?? null);
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center glass-backdrop p-8 overflow-hidden">
      <div className="w-full max-w-md relative">
        <Link
          href="/auth/login"
          className="glass-btn inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-8 px-4 py-2 rounded-full"
        >
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="glass-strong glass-in rounded-[2rem] p-8">
          {sent ? (
            <div className="text-center">
              <div className="glass-inset w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="text-[var(--accent)]" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Check your email</h2>
              <p className="text-[var(--muted-foreground)] mb-6">
                We sent a password reset link to <span className="font-medium text-[var(--foreground)]">{email}</span>
              </p>
              {devResetUrl && (
                <div className="glass-inset rounded-2xl px-4 py-3 mb-6 text-left">
                  <p className="text-xs text-[var(--muted-foreground)] mb-2">
                    Email is not configured locally — open this link directly:
                  </p>
                  <a
                    href={devResetUrl}
                    className="text-sm text-[var(--accent)] break-all hover:underline"
                  >
                    {devResetUrl}
                  </a>
                </div>
              )}
              <button
                onClick={() => setSent(false)}
                className="glass-btn text-[var(--accent)] font-medium text-sm px-4 py-2 rounded-full"
              >
                Didn&apos;t receive the email? Try again
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Forgot password?</h2>
              <p className="text-[var(--muted-foreground)] mb-6">Enter your email and we&apos;ll send you a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-field rounded-2xl px-4 py-3 text-sm"
                  placeholder="you@university.edu"
                  required
                />
                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="glass-btn glass-btn-primary w-full py-3 rounded-2xl text-sm font-semibold"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
