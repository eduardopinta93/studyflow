'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-8">
      <div className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="text-[var(--accent)]" size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Check your email</h2>
              <p className="text-[var(--muted-foreground)] mb-6">
                We sent a password reset link to <span className="font-medium text-[var(--foreground)]">{email}</span>
              </p>
              <button onClick={() => setSent(false)} className="text-[var(--accent)] font-medium hover:underline text-sm">
                Didn&apos;t receive the email? Try again
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Forgot password?</h2>
              <p className="text-[var(--muted-foreground)] mb-6">Enter your email and we&apos;ll send you a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="you@university.edu" required />
                <button type="submit" disabled={loading} className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50">
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
