'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Password reset failed');
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/auth/login?reset=1'), 2500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Invalid link
        </h2>
        <p className="text-[var(--muted-foreground)] mb-6">
          This reset link is missing its token. Request a new one from the login page.
        </p>
        <Link
          href="/auth/forgot-password"
          className="glass-btn glass-btn-primary w-full py-3 rounded-2xl text-sm font-semibold inline-block text-center"
        >
          Request a new link
        </Link>
      </>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="glass-inset w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="text-[var(--accent)]" size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Password updated
        </h2>
        <p className="text-[var(--muted-foreground)] mb-6">
          You can now sign in with your new password. Redirecting you to login…
        </p>
        <Link
          href="/auth/login"
          className="glass-btn glass-btn-primary py-3 rounded-2xl text-sm font-semibold inline-block px-6"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="glass-inset w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <KeyRound className="text-[var(--accent)]" size={32} />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-center" style={{ fontFamily: 'var(--font-heading)' }}>
        Set a new password
      </h2>
      <p className="text-[var(--muted-foreground)] mb-6 text-center">
        Choose a new password for your StudyFlow account
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-field rounded-2xl px-4 py-3 pr-12 text-sm w-full"
            placeholder="New password"
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <input
          type={showPassword ? 'text' : 'password'}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="glass-field rounded-2xl px-4 py-3 text-sm w-full"
          placeholder="Confirm new password"
          minLength={8}
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
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
