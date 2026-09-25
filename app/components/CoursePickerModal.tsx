'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, GraduationCap, Search, X } from 'lucide-react';

interface CatalogUnit {
  id: string;
  code: string;
  name: string;
  credits: number;
  description: string | null;
  color: string | null;
}

interface CatalogCategory {
  id: string;
  name: string;
  color: string;
  courseUnits: CatalogUnit[];
}

interface OwnedCourse {
  code: string | null;
  assignments: { completed: boolean }[];
}

interface CoursePickerModalProps {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
}

const MAX_CREDITS = 8;

export default function CoursePickerModal({ open, onClose, onAdded }: CoursePickerModalProps) {
  if (!open) return null;
  return <PickerBody onClose={onClose} onAdded={onAdded} />;
}

function PickerBody({ onClose, onAdded }: Omit<CoursePickerModalProps, 'open'>) {
  const router = useRouter();
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [ownedCourses, setOwnedCourses] = useState<OwnedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/categories').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/courses').then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([catData, courseData]) => {
        if (cancelled) return;
        if (!catData || !courseData) {
          setError('Could not load the course catalog.');
          return;
        }
        setCategories(catData.categories);
        setOwnedCourses(
          courseData.map((c: OwnedCourse & { code: string | null }) => ({
            code: c.code,
            assignments: c.assignments ?? [],
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the course catalog.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ownedCodes = useMemo(
    () => ownedCourses.map((c) => c.code).filter((c): c is string => !!c),
    [ownedCourses]
  );

  const finishedByCode = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const c of ownedCourses) {
      if (!c.code) continue;
      map.set(c.code, c.assignments.length > 0 && c.assignments.every((a) => a.completed));
    }
    return map;
  }, [ownedCourses]);

  const anyFinished = useMemo(() => [...finishedByCode.values()].some(Boolean), [finishedByCode]);

  const usedCredits = useMemo(() => {
    let total = 0;
    for (const cat of categories) {
      for (const unit of cat.courseUnits) {
        if (ownedCodes.includes(unit.code) && !finishedByCode.get(unit.code)) {
          total += unit.credits;
        }
      }
    }
    return total;
  }, [categories, ownedCodes, finishedByCode]);

  const remaining = MAX_CREDITS - usedCredits;

  const addCourse = async (unit: CatalogUnit) => {
    setAddingId(unit.id);
    setError('');
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId: unit.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Failed to add course.');
        setAddingId(null);
        return;
      }
      onAdded?.();
      onClose();
    } catch {
      setError('Failed to add course. Please try again.');
      setAddingId(null);
    }
  };

  const matchesSearch = (unit: CatalogUnit) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      unit.name.toLowerCase().includes(q) ||
      unit.code.toLowerCase().includes(q) ||
      unit.description?.toLowerCase().includes(q)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              Add a course
            </h2>
            {!loading && ownedCourses.length > 0 && (
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {usedCredits} / {MAX_CREDITS} credits in progress · {remaining} remaining
                {anyFinished && ' · finished courses don’t count'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--muted)] rounded-xl text-[var(--muted-foreground)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-[var(--destructive)] text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <div className="w-7 h-7 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[var(--muted-foreground)] mt-3">Loading catalog…</p>
          </div>
        ) : ownedCourses.length === 0 ? (
          <div className="text-center py-8 px-4">
            <div className="w-14 h-14 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={26} className="text-[var(--accent)]" />
            </div>
            <h3 className="font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Set up your studies first
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] max-w-sm mx-auto mb-5">
              Pick your study category and course units in onboarding, then you can add more
              courses here.
            </p>
            <button
              onClick={() => {
                onClose();
                router.push('/onboarding');
              }}
              className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all"
            >
              Go to onboarding
            </button>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search existing courses..."
                className="w-full pl-9 pr-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto -mx-1 px-1">
              {categories.map((cat) => {
                const units = cat.courseUnits.filter(matchesSearch);
                if (units.length === 0) return null;
                return (
                  <div key={cat.id} className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm font-semibold">{cat.name}</span>
                    </div>
                    <div className="space-y-2">
                      {units.map((unit) => {
                        const added = ownedCodes.includes(unit.code);
                        const finished = added && finishedByCode.get(unit.code) === true;
                        const exceeds = !added && unit.credits > remaining;
                        const disabled = added || exceeds;
                        return (
                          <button
                            key={unit.id}
                            onClick={() => !disabled && addCourse(unit)}
                            disabled={disabled || addingId === unit.id}
                            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition-all duration-200 ${
                              added
                                ? 'border-[var(--border)] bg-[var(--muted)] opacity-70'
                                : exceeds
                                  ? 'border-[var(--border)] bg-[var(--card)] opacity-50 cursor-not-allowed'
                                  : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-medium text-[var(--muted-foreground)]">
                                  {unit.code}
                                </span>
                                <span className="font-medium text-sm truncate">{unit.name}</span>
                              </div>
                              {unit.description && (
                                <p className="text-xs text-[var(--muted-foreground)] truncate">
                                  {unit.description}
                                </p>
                              )}
                            </div>
                            {added ? (
                              finished ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 shrink-0">
                                  <CheckCircle2 size={13} /> Finished
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] shrink-0">
                                  <CheckCircle2 size={13} /> Added
                                </span>
                              )
                            ) : exceeds ? (
                              <span className="text-xs font-medium text-[var(--muted-foreground)] shrink-0">
                                Over {MAX_CREDITS} cr
                              </span>
                            ) : (
                              <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] shrink-0">
                                {addingId === unit.id ? 'Adding…' : `${unit.credits} cr`}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {categories.every(
                (cat) => cat.courseUnits.filter(matchesSearch).length === 0
              ) && (
                <p className="text-center text-sm text-[var(--muted-foreground)] py-6">
                  No courses match your search.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
