'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Save, User } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ProfilePhotoField from '../components/ProfilePhotoField';

interface Profile {
  id: string;
  name: string;
  email: string;
  major: string | null;
  year: string | null;
  studyGoal: string | null;
  avatarUrl: string | null;
}

const inputCls =
  'w-full py-2.5 px-3.5 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm transition-all placeholder:text-[var(--muted-foreground)]/70 focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10';

const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Other'];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setProfile(data.user))
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          major: profile.major,
          year: profile.year,
          studyGoal: profile.studyGoal,
          avatarUrl: profile.avatarUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update profile');
        return;
      }

      const data = await res.json();
      setProfile(data.user);
      setSaved(true);
    } catch {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const update = (patch: Partial<Profile>) => {
    if (!profile) return;
    setProfile({ ...profile, ...patch });
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 sm:mb-8 pt-12 lg:pt-0">
            <h1
              className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Profile
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              How you appear across StudyFlow
            </p>
          </div>

          {loading ? (
            <div className="py-16">
              <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : profile ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
                  Account
                </h2>

                <div className="mb-5">
                  <ProfilePhotoField
                    value={profile.avatarUrl ?? ''}
                    onChange={(value) => update({ avatarUrl: value || null })}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                    <input
                      id="name"
                      type="text"
                      value={profile.name}
                      onChange={(e) => update({ name: e.target.value })}
                      className={inputCls}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={profile.email}
                      readOnly
                      className={`${inputCls} opacity-60 cursor-not-allowed`}
                    />
                    <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                      Your sign-in email cannot be changed here.
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
                  Academic details
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="major" className="block text-sm font-medium mb-2">Major</label>
                      <input
                        id="major"
                        type="text"
                        value={profile.major ?? ''}
                        onChange={(e) => update({ major: e.target.value || null })}
                        className={inputCls}
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium mb-2">Year</label>
                      <select
                        id="year"
                        value={profile.year ?? ''}
                        onChange={(e) => update({ year: e.target.value || null })}
                        className={inputCls}
                      >
                        <option value="">Select year</option>
                        {YEARS.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="studyGoal" className="block text-sm font-medium mb-2">
                      Study goal
                    </label>
                    <textarea
                      id="studyGoal"
                      value={profile.studyGoal ?? ''}
                      onChange={(e) => update({ studyGoal: e.target.value || null })}
                      className={`${inputCls} min-h-24 resize-y`}
                      placeholder="What are you working towards this term?"
                    />
                  </div>
                </div>
              </section>

              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              {saved && (
                <p className="text-sm text-[var(--success)] text-center">Profile updated.</p>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center">
              <User size={40} className="mx-auto text-[var(--muted-foreground)] mb-4" />
              <p className="text-sm text-[var(--muted-foreground)]">Profile not found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
