'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { GRADE_STYLES, type CourseGrade } from '@/lib/grade';

interface Course {
  id: string;
  name: string;
  code: string | null;
  term: string | null;
  color: string;
  grade: CourseGrade | null;
  _count?: { assignments: number };
}

export default function GradesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/courses')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setCourses(data);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const graded = courses.filter((c) => c.grade);
  const overall = graded.length
    ? Math.round(graded.reduce((sum, c) => sum + (c.grade!.percent || 0), 0) / graded.length)
    : null;
  const overallLetter =
    overall === null
      ? null
      : overall >= 90
        ? 'A'
        : overall >= 80
          ? 'B'
          : overall >= 70
            ? 'C'
            : overall >= 60
              ? 'D'
              : 'F';

  return (
    <div className="flex min-h-screen glass-backdrop">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 sm:mb-8 pt-12 lg:pt-0 flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Grades
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Your standing across all enrolled courses
            </p>
            </div>
            <ThemeToggle />
          </div>

          <div className="glass rounded-2xl p-5 sm:p-6 mb-6 flex items-center gap-5 flex-wrap">
            <div
              className={`text-4xl font-black px-4 py-2 rounded-2xl ${
                overallLetter
                  ? GRADE_STYLES[overallLetter]
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
              }`}
            >
              {overallLetter ?? '—'}
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {overall !== null ? `${overall}%` : 'No grades yet'}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Overall average across {graded.length} graded course{graded.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16 glass rounded-3xl px-4">
              <GraduationCap className="mx-auto text-[var(--muted-foreground)] mb-4" size={40} />
              <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                No courses yet
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-5">
                Add a course to start tracking grades.
              </p>
              <Link
                href="/courses"
                className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all inline-block"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course) => {
                const g = course.grade;
                const percent = g?.percent ?? 0;
                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}/grades`}
                    className="glass-flat glass-hover glass-sheen rounded-2xl p-5 block"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-mono font-semibold text-[var(--muted-foreground)]">
                          {course.code || 'COURSE'}
                        </p>
                        <h3
                          className="text-base font-bold text-[var(--foreground)] truncate"
                          style={{ fontFamily: 'var(--font-heading)' }}
                        >
                          {course.name}
                        </h3>
                        {course.term && (
                          <p className="text-xs text-[var(--muted-foreground)]">{course.term}</p>
                        )}
                      </div>
                      <span
                        className={`text-2xl font-black px-2.5 py-1 rounded-xl shrink-0 ${
                          g ? GRADE_STYLES[g.letter] : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                        }`}
                        title={g ? `${g.earned}/${g.possible} points` : 'No graded work yet'}
                      >
                        {g ? g.letter : '—'}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[var(--muted-foreground)]">
                          {g ? `${g.earned} / ${g.possible} pts` : 'No graded work'}
                        </span>
                        <span className="font-bold text-[var(--foreground)]">
                          {g ? `${percent}%` : ''}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: course.color,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]">
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {course._count?.assignments ?? 0} assignment
                        {(course._count?.assignments ?? 0) !== 1 ? 's' : ''}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                        Details <ArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
