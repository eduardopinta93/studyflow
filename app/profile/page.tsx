'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Layers,
  Loader2,
  Save,
  Target,
  User,
  UserMinus,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import ProfilePhotoField from '../components/ProfilePhotoField';
import Avatar from '../components/Avatar';

interface ProfileCourse {
  id: string;
  name: string;
  code: string | null;
  term: string | null;
  color: string | null;
  _count?: { assignments: number };
}

interface Profile {
  id: string;
  name: string;
  email: string;
  major: string | null;
  year: string | null;
  studyGoal: string | null;
  avatarUrl: string | null;
  role?: string | null;
  createdAt?: string;
  category?: { name: string; color: string | null } | null;
  stats?: { courses: number; assignments: number; completed: number };
  courses?: ProfileCourse[];
}

const inputCls =
  'w-full py-2.5 px-3.5 glass-field rounded-xl text-sm placeholder:text-[var(--muted-foreground)]/70';

const fieldErrorCls = 'mt-1.5 text-xs text-[var(--destructive-text)]';

const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate', 'Other'];

const NAME_MAX = 100;
const MAJOR_MAX = 100;
const STUDY_GOAL_MAX = 1000;

type FieldErrors = Partial<Record<'name' | 'major' | 'studyGoal', string>>;

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [droppingId, setDroppingId] = useState<string | null>(null);
  const [dropping, setDropping] = useState(false);
  const [dropError, setDropError] = useState('');

  const loadProfile = useCallback(() => {
    fetch('/api/profile')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setProfile(data.user))
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const confirmDrop = async () => {
    if (!droppingId) return;
    setDropping(true);
    setDropError('');
    try {
      const res = await fetch(`/api/courses/${droppingId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error('Drop course failed:', res.status, data);
        setDropError(data?.error || `Failed to drop course (server responded ${res.status})`);
        return;
      }
      setDroppingId(null);
      loadProfile();
    } catch (err) {
      console.error('Drop course failed:', err);
      setDropError('Failed to drop course — check your connection and try again.');
    } finally {
      setDropping(false);
    }
  };

  const droppingCourse = profile?.courses?.find((course) => course.id === droppingId);

  const validate = (data: Profile): FieldErrors => {
    const errors: FieldErrors = {};
    const name = (data.name ?? '').trim();
    if (!name) {
      errors.name = 'Name is required.';
    } else if (name.length > NAME_MAX) {
      errors.name = `Name must be ${NAME_MAX} characters or fewer.`;
    }
    if ((data.major ?? '').length > MAJOR_MAX) {
      errors.major = `Major must be ${MAJOR_MAX} characters or fewer.`;
    }
    if ((data.studyGoal ?? '').length > STUDY_GOAL_MAX) {
      errors.studyGoal = `Study goal must be ${STUDY_GOAL_MAX} characters or fewer.`;
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const errors = validate(profile);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('');
      return;
    }

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
      setProfile((prev) => (prev ? { ...prev, ...data.user } : data.user));
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
    setSaved(false);
    setFieldErrors((prev) => {
      if (!Object.keys(prev).length) return prev;
      const next = { ...prev };
      for (const key of Object.keys(patch) as (keyof FieldErrors)[]) {
        delete next[key];
      }
      return next;
    });
  };

  return (
    <div className="flex min-h-screen glass-backdrop">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 sm:mb-8 pt-12 lg:pt-0 flex items-start justify-between gap-4">
            <div>
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
            <ThemeToggle />
          </div>

          {loading ? (
            <div className="py-16">
              <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Full student profile header */}
              <section className="glass rounded-[1.75rem] p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <Avatar
                    src={profile.avatarUrl}
                    name={profile.name}
                    size={96}
                    ring
                    className="shadow-xl"
                  />
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                      <h2
                        className="text-xl font-bold text-[var(--foreground)] truncate"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {profile.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent)]/12 text-[var(--accent)] text-[11px] font-bold uppercase tracking-wider">
                        {profile.role === 'ADMIN' ? 'Admin' : 'Student'}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] truncate mt-0.5">
                      {profile.email}
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                      {profile.major && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-pill text-xs font-medium text-[var(--foreground)]">
                          <BookOpen size={12} className="text-[var(--accent)]" /> {profile.major}
                        </span>
                      )}
                      {profile.year && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-pill text-xs font-medium text-[var(--foreground)]">
                          <GraduationCap size={12} className="text-[var(--accent)]" /> {profile.year}
                        </span>
                      )}
                      {profile.category && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-pill text-xs font-medium text-[var(--foreground)]">
                          <Layers size={12} style={{ color: profile.category.color ?? undefined }} />{' '}
                          {profile.category.name}
                        </span>
                      )}
                      {profile.createdAt && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-pill text-xs font-medium text-[var(--muted-foreground)]">
                          <CalendarDays size={12} /> Joined{' '}
                          {new Date(profile.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>

                    {profile.studyGoal && (
                      <p className="mt-3 text-sm text-[var(--muted-foreground)] flex items-start gap-2 justify-center sm:justify-start">
                        <Target size={14} className="text-[var(--accent)] mt-0.5 shrink-0" />
                        <span className="italic">{profile.studyGoal}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5 pt-5 glass-divider">
                  {[
                    { icon: BookOpen, label: 'Courses', value: profile.stats?.courses ?? 0 },
                    { icon: ClipboardList, label: 'Assignments', value: profile.stats?.assignments ?? 0 },
                    { icon: CheckCircle2, label: 'Completed', value: profile.stats?.completed ?? 0 },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="glass-inset rounded-xl px-3 py-3 text-center">
                      <Icon size={16} className="mx-auto text-[var(--accent)] mb-1.5" />
                      <p className="text-lg font-bold text-[var(--foreground)] leading-none">{value}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="glass rounded-[1.75rem] p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                    My courses
                  </h2>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {profile.courses?.length ?? 0} enrolled
                  </span>
                </div>

                {dropError && (
                  <div className="mb-3 flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-[var(--destructive-text)] text-xs">
                    <AlertCircle size={14} className="shrink-0" />
                    {dropError}
                  </div>
                )}

                {!profile.courses?.length ? (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    No courses yet. Add one from the Courses page.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {profile.courses.map((course) => (
                      <li
                        key={course.id}
                        className="flex items-center gap-3 px-3.5 py-3 glass-inset rounded-xl"
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: course.color ?? 'var(--accent)' }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[var(--foreground)] truncate">
                            {course.name}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)] truncate">
                            {[course.code, course.term].filter(Boolean).join(' · ')}
                            {course._count
                              ? ` · ${course._count.assignments} assignment${course._count.assignments === 1 ? '' : 's'}`
                              : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDropError('');
                            setDroppingId(course.id);
                          }}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--destructive-text)] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <UserMinus size={13} />
                          Drop course
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <form onSubmit={handleSubmit} className="space-y-6">
                <section className="glass rounded-[1.75rem] p-5 sm:p-6">
                  <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
                    Account
                  </h2>

                  <div className="mb-5">
                    <ProfilePhotoField
                      value={profile.avatarUrl ?? ''}
                      name={profile.name}
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
                      aria-invalid={!!fieldErrors.name}
                      aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                    />
                    {fieldErrors.name && (
                      <p id="name-error" className={fieldErrorCls}>{fieldErrors.name}</p>
                    )}
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

              <section className="glass rounded-[1.75rem] p-5 sm:p-6">
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
                        aria-invalid={!!fieldErrors.major}
                        aria-describedby={fieldErrors.major ? 'major-error' : undefined}
                      />
                      {fieldErrors.major && (
                        <p id="major-error" className={fieldErrorCls}>{fieldErrors.major}</p>
                      )}
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
                      aria-invalid={!!fieldErrors.studyGoal}
                      aria-describedby={fieldErrors.studyGoal ? 'studyGoal-error' : undefined}
                    />
                    {fieldErrors.studyGoal && (
                      <p id="studyGoal-error" className={fieldErrorCls}>{fieldErrors.studyGoal}</p>
                    )}
                  </div>
                </div>
              </section>

              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-[var(--destructive-text)] text-sm">
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

              {droppingId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
                  <div className="glass-popover rounded-t-[1.75rem] sm:rounded-[1.75rem] p-5 sm:p-6 w-full sm:max-w-sm">
                    <h3
                      className="text-lg font-bold text-[var(--foreground)] mb-2"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      Drop this course?
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] mb-5">
                      {droppingCourse?.name} and all of its assignments will be removed from your
                      plan. This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setDroppingId(null)}
                        className="flex-1 py-2.5 glass-btn rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmDrop}
                        disabled={dropping}
                        className="flex-1 py-2.5 bg-[var(--destructive)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
                      >
                        {dropping && <Loader2 size={14} className="animate-spin" />}
                        {dropping ? 'Dropping...' : 'Drop course'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-[1.75rem] p-12 text-center">
              <User size={40} className="mx-auto text-[var(--muted-foreground)] mb-4" />
              <p className="text-sm text-[var(--muted-foreground)]">Profile not found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
