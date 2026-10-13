'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  GitBranch,
  Globe,
  GraduationCap,
  Layers,
  Loader2,
  MapPin,
  MessageCircle,
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
  headline: string | null;
  bio: string | null;
  skills: string | null;
  location: string | null;
  whatsappPhone: string | null;
  website: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
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
const HEADLINE_MAX = 120;
const BIO_MAX = 1000;
const SKILLS_MAX = 500;
const PROFILE_LOCATION_MAX = 100;

type FieldErrors = Partial<
  Record<
    | 'name'
    | 'major'
    | 'studyGoal'
    | 'headline'
    | 'bio'
    | 'skills'
    | 'location'
    | 'whatsappPhone'
    | 'website'
    | 'linkedinUrl'
    | 'githubUrl',
    string
  >
>;

function normalizeUrlValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

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
    if ((data.headline ?? '').length > HEADLINE_MAX) {
      errors.headline = `Headline must be ${HEADLINE_MAX} characters or fewer.`;
    }
    if ((data.bio ?? '').length > BIO_MAX) {
      errors.bio = `Bio must be ${BIO_MAX} characters or fewer.`;
    }
    if ((data.skills ?? '').length > SKILLS_MAX) {
      errors.skills = `Skills must be ${SKILLS_MAX} characters or fewer.`;
    }
    if ((data.location ?? '').length > PROFILE_LOCATION_MAX) {
      errors.location = `Location must be ${PROFILE_LOCATION_MAX} characters or fewer.`;
    }
    const phone = (data.whatsappPhone ?? '').trim();
    if (phone && !/^\+?[\d\s\-().]{7,20}$/.test(phone)) {
      errors.whatsappPhone = 'Enter a valid number with country code, e.g. +256700000000';
    }
    for (const key of ['website', 'linkedinUrl', 'githubUrl'] as const) {
      const raw = (data[key] ?? '').trim();
      if (!raw) continue;
      try {
        const url = new URL(normalizeUrlValue(raw));
        if (!url.hostname.includes('.')) errors[key] = 'Enter a valid URL.';
      } catch {
        errors[key] = 'Enter a valid URL.';
      }
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
          headline: profile.headline,
          bio: profile.bio,
          skills: profile.skills,
          location: profile.location,
          whatsappPhone: profile.whatsappPhone,
          website: normalizeUrlValue(profile.website ?? ''),
          linkedinUrl: normalizeUrlValue(profile.linkedinUrl ?? ''),
          githubUrl: normalizeUrlValue(profile.githubUrl ?? ''),
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

                    {profile.headline && (
                      <p className="text-sm font-medium text-[var(--foreground)] mt-1">
                        {profile.headline}
                      </p>
                    )}

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
                      {profile.location && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-pill text-xs font-medium text-[var(--muted-foreground)]">
                          <MapPin size={12} /> {profile.location}
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

                    {(profile.whatsappPhone ||
                      profile.website ||
                      profile.linkedinUrl ||
                      profile.githubUrl) && (
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
                        {profile.whatsappPhone && (
                          <a
                            href={`https://wa.me/${profile.whatsappPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-chip text-[11px] text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                            title={`Chat on WhatsApp: ${profile.whatsappPhone}`}
                          >
                            <MessageCircle size={12} className="text-[var(--success)]" /> WhatsApp
                          </a>
                        )}
                        {profile.website && (
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-chip text-[11px] text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                            title={profile.website}
                          >
                            <Globe size={12} className="text-[var(--accent)]" /> Website
                          </a>
                        )}
                        {profile.linkedinUrl && (
                          <a
                            href={profile.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-chip text-[11px] text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                            title={profile.linkedinUrl}
                          >
                            <Briefcase size={12} className="text-[#0A66C2]" /> LinkedIn
                          </a>
                        )}
                        {profile.githubUrl && (
                          <a
                            href={profile.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass-chip text-[11px] text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                            title={profile.githubUrl}
                          >
                            <GitBranch size={12} /> GitHub
                          </a>
                        )}
                      </div>
                    )}

                    {profile.skills && (
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-3">
                        {profile.skills
                          .split(',')
                          .map((skill) => skill.trim())
                          .filter(Boolean)
                          .map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[11px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                      </div>
                    )}

                    {profile.studyGoal && (
                      <p className="mt-3 text-sm text-[var(--muted-foreground)] flex items-start gap-2 justify-center sm:justify-start">
                        <Target size={14} className="text-[var(--accent)] mt-0.5 shrink-0" />
                        <span className="italic">{profile.studyGoal}</span>
                      </p>
                    )}

                    {profile.bio && (
                      <p className="mt-2 text-sm text-[var(--muted-foreground)] whitespace-pre-line text-center sm:text-left">
                        {profile.bio}
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

              <section className="glass rounded-[1.75rem] p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
                  Professional profile
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mb-4">
                  How you present yourself to classmates and instructors.
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="headline" className="block text-sm font-medium mb-2">
                      Headline
                    </label>
                    <input
                      id="headline"
                      type="text"
                      value={profile.headline ?? ''}
                      onChange={(e) => update({ headline: e.target.value || null })}
                      className={inputCls}
                      placeholder="e.g. Computer Science student · aspiring frontend developer"
                      aria-invalid={!!fieldErrors.headline}
                      aria-describedby={fieldErrors.headline ? 'headline-error' : undefined}
                    />
                    {fieldErrors.headline && (
                      <p id="headline-error" className={fieldErrorCls}>{fieldErrors.headline}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-2">Bio</label>
                    <textarea
                      id="bio"
                      value={profile.bio ?? ''}
                      onChange={(e) => update({ bio: e.target.value || null })}
                      className={`${inputCls} min-h-24 resize-y`}
                      placeholder="A short professional summary — what you study, what you build, what you're looking for."
                      aria-invalid={!!fieldErrors.bio}
                      aria-describedby={fieldErrors.bio ? 'bio-error' : undefined}
                    />
                    {fieldErrors.bio && (
                      <p id="bio-error" className={fieldErrorCls}>{fieldErrors.bio}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="skills" className="block text-sm font-medium mb-2">
                        Skills
                      </label>
                      <input
                        id="skills"
                        type="text"
                        value={profile.skills ?? ''}
                        onChange={(e) => update({ skills: e.target.value || null })}
                        className={inputCls}
                        placeholder="React, TypeScript, Public speaking"
                        aria-invalid={!!fieldErrors.skills}
                        aria-describedby={fieldErrors.skills ? 'skills-error' : undefined}
                      />
                      {fieldErrors.skills && (
                        <p id="skills-error" className={fieldErrorCls}>{fieldErrors.skills}</p>
                      )}
                      <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                        Separate with commas — shown as chips on your profile.
                      </p>
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium mb-2">
                        Location
                      </label>
                      <input
                        id="location"
                        type="text"
                        value={profile.location ?? ''}
                        onChange={(e) => update({ location: e.target.value || null })}
                        className={inputCls}
                        placeholder="e.g. Kampala, Uganda"
                        aria-invalid={!!fieldErrors.location}
                        aria-describedby={fieldErrors.location ? 'location-error' : undefined}
                      />
                      {fieldErrors.location && (
                        <p id="location-error" className={fieldErrorCls}>{fieldErrors.location}</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="glass rounded-[1.75rem] p-5 sm:p-6">
                <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
                  Contact &amp; links
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mb-4">
                  Your WhatsApp button and professional links appear in your profile header.
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="whatsappPhone" className="block text-sm font-medium mb-2">
                      WhatsApp number
                    </label>
                    <input
                      id="whatsappPhone"
                      type="tel"
                      value={profile.whatsappPhone ?? ''}
                      onChange={(e) => update({ whatsappPhone: e.target.value || null })}
                      className={inputCls}
                      placeholder="+256 700 000 000"
                      aria-invalid={!!fieldErrors.whatsappPhone}
                      aria-describedby={fieldErrors.whatsappPhone ? 'whatsappPhone-error' : undefined}
                    />
                    {fieldErrors.whatsappPhone && (
                      <p id="whatsappPhone-error" className={fieldErrorCls}>{fieldErrors.whatsappPhone}</p>
                    )}
                    <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                      Include your country code — a WhatsApp chat button will open your profile.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium mb-2">
                        Website
                      </label>
                      <input
                        id="website"
                        type="url"
                        value={profile.website ?? ''}
                        onChange={(e) => update({ website: e.target.value || null })}
                        className={inputCls}
                        placeholder="https://example.com"
                        aria-invalid={!!fieldErrors.website}
                        aria-describedby={fieldErrors.website ? 'website-error' : undefined}
                      />
                      {fieldErrors.website && (
                        <p id="website-error" className={fieldErrorCls}>{fieldErrors.website}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="linkedinUrl" className="block text-sm font-medium mb-2">
                        LinkedIn
                      </label>
                      <input
                        id="linkedinUrl"
                        type="url"
                        value={profile.linkedinUrl ?? ''}
                        onChange={(e) => update({ linkedinUrl: e.target.value || null })}
                        className={inputCls}
                        placeholder="linkedin.com/in/you"
                        aria-invalid={!!fieldErrors.linkedinUrl}
                        aria-describedby={fieldErrors.linkedinUrl ? 'linkedinUrl-error' : undefined}
                      />
                      {fieldErrors.linkedinUrl && (
                        <p id="linkedinUrl-error" className={fieldErrorCls}>{fieldErrors.linkedinUrl}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="githubUrl" className="block text-sm font-medium mb-2">
                        GitHub
                      </label>
                      <input
                        id="githubUrl"
                        type="url"
                        value={profile.githubUrl ?? ''}
                        onChange={(e) => update({ githubUrl: e.target.value || null })}
                        className={inputCls}
                        placeholder="github.com/you"
                        aria-invalid={!!fieldErrors.githubUrl}
                        aria-describedby={fieldErrors.githubUrl ? 'githubUrl-error' : undefined}
                      />
                      {fieldErrors.githubUrl && (
                        <p id="githubUrl-error" className={fieldErrorCls}>{fieldErrors.githubUrl}</p>
                      )}
                    </div>
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
