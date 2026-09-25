'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, UserPlus } from 'lucide-react';
import AuthHero from '../AuthHero';

const inputCls =
  'w-full py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm transition-all placeholder:text-[var(--muted-foreground)]/70 focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10';

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  show,
  onToggle,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete: string;
  show: boolean;
  onToggle: () => void;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} pl-11 pr-12`}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<Record<string, { id: string; name: string }>>({});

  useEffect(() => {
    fetch('/api/auth/providers')
      .then((res) => res.json())
      .then((data) => setProviders(data && typeof data === 'object' ? data : {}))
      .catch(() => setProviders({}));
  }, []);

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
      redirectTo: '/profile/complete',
    });
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <AuthHero tagline="Join thousands of students organizing their academic life." />

      <div className="flex w-full lg:w-1/2 justify-center p-8 sm:py-12">
        <div className="w-full max-w-md my-auto">
          <div
            className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm"
            style={{ animation: 'hero-rise .6s cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10">
                <UserPlus size={22} className="text-[var(--accent)]" />
              </div>
              <h2 className="text-2xl font-bold mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>Create your account</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Start organizing your studies today</p>
            </div>

            {providers.google && (
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => signIn('google', { redirectTo: '/profile/complete' })}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--border)] bg-[var(--background)] rounded-xl text-sm font-medium hover:border-[var(--accent)]/40 hover:shadow-sm transition-all duration-200"
                >
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Sign up with Google
                </button>
              </div>
            )}

            {providers.google && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]"></div></div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-[var(--card)] uppercase tracking-wider text-[var(--muted-foreground)]">or continue with email</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-2">First name</label>
                  <input id="firstName" type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className={`${inputCls} px-4`} autoComplete="given-name" required />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-2">Last name</label>
                  <input id="lastName" type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className={`${inputCls} px-4`} autoComplete="family-name" required />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email address</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
                  <input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`${inputCls} pl-11`} placeholder="you@university.edu" autoComplete="email" required />
                </div>
              </div>

              <PasswordField
                id="password"
                label="Password"
                value={formData.password}
                onChange={(v) => setFormData({ ...formData, password: v })}
                placeholder="Create a password"
                autoComplete="new-password"
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                hint="Must be at least 8 characters"
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm password"
                value={formData.confirmPassword}
                onChange={(v) => setFormData({ ...formData, confirmPassword: v })}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
              />

              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-b from-[var(--accent)] to-[var(--accent-hover)] text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
              Already have an account? <Link href="/auth/login" className="text-[var(--accent)] font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
