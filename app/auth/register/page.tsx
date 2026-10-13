'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, UserPlus, Shield, Zap, Sparkles } from 'lucide-react';
import AuthHero from '../AuthHero';

const inputCls = 'glass-field rounded-2xl py-3 px-4 text-sm';

const UNIVERSITY_DOMAINS = [
  'university.edu', 'college.edu', 'edu', 'student.university.edu',
  'gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com',
];

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
  error,
  strength,
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
  error?: string;
  strength?: number;
}) {
  const strengthColors = ['#DC2626', '#F59E0B', '#F59E0B', '#16A34A', '#16A34A'];
  const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  
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
          className={`${inputCls} pl-11 pr-12 ${error ? 'glass-field-error' : ''}`}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
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
      {strength !== undefined && value.length > 0 && (
        <div className="mt-2" role="progressbar" aria-valuenow={strength} aria-valuemin={0} aria-valuemax={4} aria-label="Password strength">
          <div className="flex gap-1.5 mb-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="h-1.5 flex-1 rounded transition-colors duration-300"
                style={{
                  backgroundColor: level <= strength ? strengthColors[level] : 'rgba(148,163,184,0.25)',
                }}
              />
            ))}
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Password strength: <span className="font-medium" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
          </p>
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-[var(--destructive-text)] flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-[var(--muted-foreground)]">{hint}</p>
      )}
    </div>
  );
}

function EmailField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const atIndex = value.lastIndexOf('@');
    if (atIndex === -1) return [];
    if (atIndex === value.length - 1) return UNIVERSITY_DOMAINS;
    const domain = value.slice(atIndex + 1);
    return UNIVERSITY_DOMAINS.filter((d) => d.startsWith(domain));
  }, [value]);

  const showSuggestions = focused && suggestions.length > 0;

  const handleSelectDomain = (domain: string) => {
    const atIndex = value.lastIndexOf('@');
    onChange(value.slice(0, atIndex + 1) + domain);
    setFocused(false);
  };

  return (
    <div className="relative">
      <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
      <input
        id="email"
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        className={`${inputCls} pl-11 ${error ? 'glass-field-error' : ''}`}
        placeholder="you@university.edu"
        autoComplete="email"
        required
        aria-invalid={!!error}
        aria-describedby={error ? 'email-error' : 'email-hint'}
        aria-autocomplete="list"
        aria-controls="email-suggestions"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="email-suggestions"
          role="listbox"
          className="glass-popover absolute z-20 left-0 right-0 top-full mt-2 rounded-2xl overflow-hidden py-1"
        >
          {suggestions.map((domain) => (
            <li
              key={domain}
              role="option"
              aria-selected={false}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectDomain(domain)}
              className="px-4 py-2 text-sm hover:bg-[var(--accent)]/15 cursor-pointer flex items-center gap-2"
            >
              <Mail size={14} className="text-[var(--muted-foreground)]" />
              @{domain}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p id="email-error" className="mt-1.5 text-xs text-[var(--destructive-text)] flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
      <p id="email-hint" className="mt-1.5 text-xs text-[var(--muted-foreground)]">We&apos;ll never share your email</p>
    </div>
  );
}

function calculatePasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return Math.min(strength, 4);
}

function validateField(name: string, value: string, formData: typeof initialFormData): string | undefined {
  switch (name) {
    case 'firstName':
      if (!value.trim()) return 'First name is required';
      if (value.trim().length < 2) return 'First name must be at least 2 characters';
      break;
    case 'lastName':
      if (!value.trim()) return 'Last name is required';
      if (value.trim().length < 2) return 'Last name must be at least 2 characters';
      break;
    case 'email':
      if (!value.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
      break;
    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      break;
    case 'confirmPassword':
      if (!value) return 'Please confirm your password';
      if (value !== formData.password) return 'Passwords do not match';
      break;
  }
  return undefined;
}

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [providers, setProviders] = useState<Record<string, { id: string; name: string }>>({});
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  const [ssoError, setSsoError] = useState('');

  useEffect(() => {
    fetch('/api/auth/providers')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setProviders(data && typeof data === 'object' ? data : {}))
      .catch(() => setProviders({}));
  }, []);

  const passwordStrength = useMemo(() => calculatePasswordStrength(formData.password), [formData.password]);

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    (Object.keys(formData) as Array<keyof typeof initialFormData>).forEach((key) => {
      if (touched[key]) {
        const err = validateField(key, formData[key], formData);
        if (err) errors[key] = err;
      }
    });
    return errors;
  }, [formData, touched]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const err = validateField(field, value, formData);
      if (!err) {
        setError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, password: true, confirmPassword: true });
    setError('');

    const validationErrors = (Object.keys(formData) as Array<keyof typeof initialFormData>).map(
      (key) => validateField(key, formData[key], formData)
    ).filter(Boolean);

    if (validationErrors.length > 0) {
      setError(validationErrors[0]!);
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);

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

  const handleSsoSignUp = async (provider: string) => {
    if (ssoLoading) return;
    setSsoLoading(provider);
    setSsoError('');
    try {
      const result = await signIn(provider, { redirectTo: '/profile/complete', redirect: false });
      const url = result?.url ?? '';
      const urlError = url ? new URL(url, window.location.origin).searchParams.get('error') : null;
      if (result?.error || urlError) {
        console.error('SSO sign-up failed:', { provider, result });
        setSsoError(`Could not sign up with ${provider === 'github' ? 'GitHub' : provider}. Please try again.`);
        setSsoLoading(null);
        return;
      }
      window.location.href = url || '/profile/complete';
    } catch (err) {
      console.error('SSO sign-up failed:', err);
      setSsoError('Could not start sign-up. Check your connection and try again.');
      setSsoLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen glass-backdrop">
      <AuthHero tagline="Join thousands of students organizing their academic life." />

      <div className="relative w-full lg:w-1/2 flex justify-center p-8 sm:py-12 overflow-hidden">
        <div className="w-full max-w-md my-auto relative">
          <div
            className="glass-strong glass-in rounded-[2rem] p-6 sm:p-8"
            style={{ animation: 'hero-rise .6s cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >            <div className="mb-7 text-center" style={{ animation: 'fade-in .5s ease-out .1s both' }}>
              <div className="glass-inset mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ animation: 'pulse-soft 2s ease-in-out infinite' }}>
                <UserPlus size={22} className="text-[var(--accent)]" />
              </div>
              <h2 className="text-2xl font-bold mb-1.5" style={{ fontFamily: 'var(--font-heading)', animation: 'fade-in .5s ease-out .2s both' }}>Create your account</h2>
              <p className="text-sm text-[var(--muted-foreground)]" style={{ animation: 'fade-in .5s ease-out .3s both' }}>Start organizing your studies today</p>
            </div>            <div className="space-y-3 mb-6" style={{ animation: 'fade-in .5s ease-out .4s both' }}>
              {providers['google'] && (
                <button
                  type="button"
                  onClick={() => handleSsoSignUp('google')}
                  disabled={ssoLoading !== null}
                  className="glass-btn w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium"
                >
                  {ssoLoading === 'google' ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  )}
                  Sign up with Google
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSsoSignUp('github')}
                disabled={ssoLoading !== null}
                className="glass-btn w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium"
                style={{
                  background: 'linear-gradient(140deg, #3a4149, #20252b)',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.18)',
                  opacity: ssoLoading && ssoLoading !== 'github' ? 0.6 : 1,
                }}
              >
                {ssoLoading === 'github' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                )}
                Sign up with GitHub
              </button>

              {ssoError && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm border border-red-200 dark:border-red-400/40 bg-red-50 dark:bg-red-950/30 text-[var(--destructive-text)] backdrop-blur-md animate-slide-down">
                  <AlertCircle size={16} className="shrink-0" />
                  {ssoError}
                </div>
              )}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full glass-divider"></div></div>
              <div className="relative flex justify-center text-xs">
                <span className="glass-pill px-4 py-1.5 uppercase tracking-wider text-[var(--muted-foreground)]">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" style={{ animation: 'fade-in .5s ease-out .5s both' }}>
              <div className="grid grid-cols-2 gap-4">
                <div style={{ animation: 'fade-in-up .5s ease-out .1s both' }}>
                  <label htmlFor="firstName" className="block text-sm font-medium mb-2">First name</label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    onBlur={() => handleBlur('firstName')}
                    className={`${inputCls} px-4 transition-all duration-200 ${fieldErrors.firstName ? 'glass-field-error animate-shake' : ''}`}
                    autoComplete="given-name"
                    required
                    aria-invalid={!!fieldErrors.firstName}
                    aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
                  />
                  {fieldErrors.firstName && (
                    <p id="firstName-error" className="mt-1.5 text-xs text-[var(--destructive-text)] flex items-center gap-1 animate-slide-down">
                      <AlertCircle size={12} /> {fieldErrors.firstName}
                    </p>
                  )}
                </div>
                <div style={{ animation: 'fade-in-up .5s ease-out .2s both' }}>
                  <label htmlFor="lastName" className="block text-sm font-medium mb-2">Last name</label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    onBlur={() => handleBlur('lastName')}
                    className={`${inputCls} px-4 transition-all duration-200 ${fieldErrors.lastName ? 'glass-field-error animate-shake' : ''}`}
                    autoComplete="family-name"
                    required
                    aria-invalid={!!fieldErrors.lastName}
                    aria-describedby={fieldErrors.lastName ? 'lastName-error' : undefined}
                  />
                  {fieldErrors.lastName && (
                    <p id="lastName-error" className="mt-1.5 text-xs text-[var(--destructive-text)] flex items-center gap-1 animate-slide-down">
                      <AlertCircle size={12} /> {fieldErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ animation: 'fade-in-up .5s ease-out .3s both' }}>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email address</label>
                <EmailField
                  value={formData.email}
                  onChange={(v) => handleChange('email', v)}
                  error={fieldErrors.email}
                />
              </div>

              <div style={{ animation: 'fade-in-up .5s ease-out .4s both' }}>
                <PasswordField
                  id="password"
                  label="Password"
                  value={formData.password}
                  onChange={(v) => handleChange('password', v)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  show={showPassword}
                  onToggle={() => setShowPassword(!showPassword)}
                  hint="Must be at least 8 characters"
                  strength={passwordStrength}
                />
              </div>

              <div style={{ animation: 'fade-in-up .5s ease-out .5s both' }}>
                <PasswordField
                  id="confirmPassword"
                  label="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(v) => handleChange('confirmPassword', v)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  show={showConfirm}
                  onToggle={() => setShowConfirm(!showConfirm)}
                  error={fieldErrors.confirmPassword}
                />
              </div>

              <div className="flex items-start gap-3 pt-1" style={{ animation: 'fade-in-up .5s ease-out .6s both' }}>
                <div className="flex items-center mt-1">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--border)] bg-[var(--background)] accent-[var(--accent)] transition-all duration-200"
                    required
                  />
                </div>
                <label htmlFor="acceptTerms" className="text-sm text-[var(--muted-foreground)]">
                  I agree to the <Link href="/terms" className="text-[var(--accent)] hover:underline transition-colors">Terms of Service</Link> and <Link href="/privacy" className="text-[var(--accent)] hover:underline transition-colors">Privacy Policy</Link>
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm border border-red-200 dark:border-red-400/40 bg-red-50 dark:bg-red-950/30 text-[var(--destructive-text)] backdrop-blur-md animate-slide-down">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="glass-btn glass-btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold"
                style={{ animation: 'fade-in-up .5s ease-out .7s both' }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center" style={{ animation: 'fade-in .5s ease-out .8s both' }}>
              <div className="flex flex-col items-center gap-1.5 group">
                <div className="glass-inset w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <Shield size={18} className="text-[var(--accent)] transition-transform duration-300" />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">Secure</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 group">
                <div className="glass-inset w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <Zap size={18} className="text-[var(--accent)] transition-transform duration-300" />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">Fast</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 group">
                <div className="glass-inset w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                  <Sparkles size={18} className="text-[var(--accent)] transition-transform duration-300" />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">Free</p>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]" style={{ animation: 'fade-in .5s ease-out .9s both' }}>
              Already have an account? <Link href="/auth/login" className="text-[var(--accent)] font-medium hover:underline transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
