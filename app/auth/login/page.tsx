'use client';

import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, LogIn, Mail } from 'lucide-react';
import AuthHero from '../AuthHero';

const inputCls =
  'w-full py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm transition-all placeholder:text-[var(--muted-foreground)]/70 focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10';

const ssoCls =
  'w-full flex items-center justify-center gap-3 px-4 py-3 border border-[var(--border)] bg-[var(--background)] rounded-xl text-sm font-medium hover:border-[var(--accent)]/40 hover:shadow-sm transition-all duration-200';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<Record<string, { id: string; name: string }>>({});

  useEffect(() => {
    fetch('/api/auth/providers')
      .then((res) => res.json())
      .then((data) => setProviders(data && typeof data === 'object' ? data : {}))
      .catch(() => setProviders({}));
  }, []);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError('Invalid email or password');
    } else {
      const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl');
      const safeUrl = callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
        ? callbackUrl
        : '/';
      window.location.href = safeUrl;
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Left panel - brand hero */}
      <AuthHero tagline="Organize your courses, track assignments, and stay on top of your academic life." />

      {/* Right panel - Login form */}
      <div className="flex w-full lg:w-1/2 justify-center p-8 sm:py-12">
        <div className="w-full max-w-md my-auto">
          <div
            className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm"
            style={{ animation: 'hero-rise .6s cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                SF
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>StudyFlow</span>
            </div>

            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)]/10">
                <LogIn size={22} className="text-[var(--accent)]" />
              </div>
              <h2 className="text-2xl font-bold mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>Welcome back</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Sign in to continue to StudyFlow</p>
            </div>

            {/* SSO Buttons */}
            {(providers.google || providers['azure-ad'] || providers.github) && (
              <div className="space-y-3 mb-6">
                {providers.google && (
                  <button onClick={() => signIn('google', { redirectTo: '/' })} className={ssoCls}>
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                )}

                {providers['azure-ad'] && (
                  <button onClick={() => signIn('azure-ad', { redirectTo: '/' })} className={ssoCls}>
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M1 1h10v10H1z"/>
                      <path fill="#81bc06" d="M12 1h10v10H12z"/>
                      <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                      <path fill="#ffba08" d="M12 12h10v10H12z"/>
                    </svg>
                    Continue with Microsoft
                  </button>
                )}

                {providers.github && (
                  <button onClick={() => signIn('github', { redirectTo: '/' })} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#24292f] text-white rounded-xl text-sm font-medium hover:bg-[#32383f] hover:shadow-sm transition-all duration-200">
                    <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Continue with GitHub
                  </button>
                )}
              </div>
            )}

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-[var(--card)] uppercase tracking-wider text-[var(--muted-foreground)]">or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleCredentialsLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email address</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputCls} pl-11`}
                    placeholder="you@university.edu"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Link href="/auth/forgot-password" className="text-sm text-[var(--accent)] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls} pl-11 pr-12`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

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
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-[var(--accent)] font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
