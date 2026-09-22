'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Registration failed');
      setLoading(false);
      return;
    }

    await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      callbackUrl: '/profile/complete',
    });
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--accent)] items-center justify-center p-12">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-6 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>StudyFlow</h1>
          <p className="text-xl opacity-90 max-w-md">Join thousands of students organizing their academic life.</p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Create your account</h2>
          <p className="text-[var(--muted-foreground)] mb-8">Start organizing your studies today</p>

          <div className="space-y-3 mb-6">
            <button onClick={() => signIn('google', { callbackUrl: '/profile/complete' })} className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-all duration-200 font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign up with Google
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]"></div></div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--background)] text-[var(--muted-foreground)]">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First name</label>
                <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-3 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] transition-colors" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last name</label>
                <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-3 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] transition-colors" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email address</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="you@university.edu" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="Min. 8 characters" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm password</label>
              <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full px-4 py-3 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="Re-enter password" required />
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
            Already have an account? <Link href="/auth/login" className="text-[var(--accent)] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
