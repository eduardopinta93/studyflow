'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, Layers } from 'lucide-react';

interface CourseUnit {
  id: string;
  code: string;
  name: string;
  credits: number;
  description: string | null;
  color: string | null;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  courseUnits: CourseUnit[];
}

const MAX_CREDITS = 8;

export default function OnboardingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [enrolledCategoryId, setEnrolledCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'category' | 'units'>('category');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then(async (res) => {
        if (res.status === 401) {
          router.replace('/auth/login?callbackUrl=/onboarding');
          return null;
        }
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setCategories(data.categories);
        setEnrolledCategoryId(data.enrolledCategoryId);
        setLoading(false);
      })
      .catch(() => {
        setNotice('Could not load study categories. Please refresh and try again.');
        setLoading(false);
      });
  }, [router]);

  const selectedUnits = useMemo(() => {
    const allUnits = categories.flatMap((c) => c.courseUnits);
    return allUnits.filter((u) => selectedIds.includes(u.id));
  }, [categories, selectedIds]);
  const totalCredits = selectedUnits.reduce((sum, u) => sum + u.credits, 0);
  const ready = selectedIds.length >= 1 && totalCredits <= MAX_CREDITS;

  const unitCategories = useMemo(() => {
    if (!selectedCategory) return [];
    return [selectedCategory, ...categories.filter((c) => c.id !== selectedCategory.id)];
  }, [categories, selectedCategory]);

  const enrolledCategory = categories.find((c) => c.id === enrolledCategoryId);

  const toggleUnit = (unit: CourseUnit) => {
    setNotice('');
    if (selectedIds.includes(unit.id)) {
      setSelectedIds((ids) => ids.filter((id) => id !== unit.id));
      return;
    }
    if (totalCredits + unit.credits > MAX_CREDITS) {
      setNotice(
        `That would be ${totalCredits + unit.credits} credits — the limit is ${MAX_CREDITS}. Deselect another unit first.`
      );
      return;
    }
    setSelectedIds((ids) => [...ids, unit.id]);
  };

  const submit = async () => {
    if (!selectedCategory || !ready) return;
    setSubmitting(true);
    setNotice('');
    try {
      const res = await fetch('/api/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: selectedCategory.id, unitIds: selectedIds }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(data.error || 'Enrollment failed. Please try again.');
        setSubmitting(false);
        return;
      }
      router.push('/');
    } catch {
      setNotice('Enrollment failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Loading study categories…</p>
      </div>
    );
  }

  if (enrolledCategoryId) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-[var(--accent)]" size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            You&apos;re enrolled
          </h1>
          <p className="text-[var(--muted-foreground)] mb-6">
            {enrolledCategory
              ? `You're studying ${enrolledCategory.name}.`
              : 'Your studies are already set up.'}
          </p>
          <Link
            href="/"
            className="inline-block w-full py-3 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-all"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-3xl mx-auto p-6 sm:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center text-white text-sm font-bold">
            SF
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              {step === 'category' ? 'Choose your study category' : 'Pick your course units'}
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {step === 'category'
                ? 'Step 1 of 2 — this decides which courses you can take'
                : `Step 2 of 2 — mix units from any category, up to ${MAX_CREDITS} credits total`}
            </p>
          </div>
        </div>

        {notice && (
          <div className="mb-6 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-sm">
            {notice}
          </div>
        )}

        {step === 'category' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedIds([]);
                  setNotice('');
                  setStep('units');
                }}
                className="text-left bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl p-5 hover:border-[var(--accent)] transition-all duration-200"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <GraduationCap size={20} style={{ color: cat.color }} />
                </div>
                <h2 className="font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  {cat.name}
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">{cat.description}</p>
                <p className="text-xs font-medium text-[var(--accent)]">
                  {cat.courseUnits.length} course units available
                </p>
              </button>
            ))}
          </div>
        )}

        {step === 'units' && selectedCategory && (
          <div>
            <button
              onClick={() => {
                setStep('category');
                setSelectedIds([]);
                setNotice('');
              }}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-5 transition-colors"
            >
              <ArrowLeft size={16} /> Back to categories
            </button>

            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                  <Layers size={16} style={{ color: selectedCategory.color }} />
                  {selectedCategory.name}
                </div>
                <span className="text-sm font-medium text-[var(--muted-foreground)]">
                  <span className={totalCredits > MAX_CREDITS ? 'text-red-500' : 'text-[var(--accent)]'}>
                    {totalCredits}
                  </span>
                  {' / '}{MAX_CREDITS} credits · {selectedIds.length} units
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (totalCredits / MAX_CREDITS) * 100)}%`,
                    backgroundColor: selectedCategory.color,
                  }}
                />
              </div>
            </div>

            <div className="space-y-5 mb-6">
              {unitCategories.map((cat, index) => {
                const units = cat.courseUnits;
                if (units.length === 0) return null;
                return (
                  <div key={cat.id}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm font-semibold">{cat.name}</span>
                      {index === 0 && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] font-medium">
                          Your category
                        </span>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      {units.map((unit) => {
                        const selected = selectedIds.includes(unit.id);
                        return (
                          <button
                            key={unit.id}
                            onClick={() => toggleUnit(unit)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                              selected
                                ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                                : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]/50'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                                selected
                                  ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                  : 'border-[var(--border)]'
                              }`}
                            >
                              {selected && <CheckCircle2 size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-medium text-[var(--muted-foreground)]">
                                  {unit.code}
                                </span>
                                <span className="font-medium truncate">{unit.name}</span>
                              </div>
                              {unit.description && (
                                <p className="text-sm text-[var(--muted-foreground)] truncate">
                                  {unit.description}
                                </p>
                              )}
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] shrink-0">
                              {unit.credits} cr
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={submit}
              disabled={!ready || submitting}
              className="w-full py-3.5 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting
                ? 'Enrolling…'
                : `Enroll (${selectedIds.length} units · ${totalCredits} credits)`}
              {!submitting && <ArrowRight size={18} />}
            </button>
            {!ready && !notice && (
              <p className="text-center text-sm text-[var(--muted-foreground)] mt-3">
                Select at least one course unit without exceeding {MAX_CREDITS} credits.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
