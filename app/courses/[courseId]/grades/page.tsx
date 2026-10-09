'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GraduationCap, CheckCircle2, Circle } from 'lucide-react';
import { GRADE_STYLES, courseGrade } from '@/lib/grade';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  points: number;
  completed: boolean;
  type: string;
}

interface CourseDetail {
  id: string;
  name: string;
  code: string | null;
  color: string;
  assignments: Assignment[];
}

export default function CourseGradesPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCourse = useCallback(() => {
    fetch(`/api/courses/${courseId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) setCourse(data);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-24 glass rounded-3xl">
        <p className="text-sm text-[var(--muted-foreground)]">Course not found.</p>
      </div>
    );
  }

  const grade = courseGrade(course.assignments);
  const earned = course.assignments
    .filter((a) => a.completed)
    .reduce((sum, a) => sum + a.points, 0);
  const possible = course.assignments.reduce((sum, a) => sum + a.points, 0);
  const rows = [...course.assignments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="max-w-3xl space-y-5">
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-5 flex-wrap">
          <div
            className={`text-4xl font-black px-4 py-2 rounded-2xl ${
              grade ? GRADE_STYLES[grade.letter] : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
            }`}
          >
            {grade ? grade.letter : '—'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--foreground)]">
                {grade ? `${grade.percent}%` : 'No grade'}
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">
                {earned} / {possible} pts
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden mt-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${grade ? grade.percent : 0}%`,
                  backgroundColor: course.color,
                }}
              />
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-1.5">
              {course.code ? `${course.code} · ` : ''}
              {course.name} · grading based on completed work
            </p>
          </div>
        </div>
      </div>

      <section className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center gap-2">
          <GraduationCap size={16} style={{ color: course.color }} />
          <h2 className="text-sm font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
            Grade Detail
          </h2>
        </div>

        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[var(--muted-foreground)]">
            No graded work in this course yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)] border-b border-[var(--border)]">
                  <th className="px-5 py-2.5 font-semibold">Assignment</th>
                  <th className="px-3 py-2.5 font-semibold hidden sm:table-cell">Type</th>
                  <th className="px-3 py-2.5 font-semibold hidden sm:table-cell">Due</th>
                  <th className="px-3 py-2.5 font-semibold text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {rows.map((a) => (
                  <tr key={a.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {a.completed ? (
                          <CheckCircle2 size={15} className="text-[var(--success)] shrink-0" />
                        ) : (
                          <Circle size={15} className="text-[var(--muted-foreground)] shrink-0" />
                        )}
                        <span
                          className={`truncate ${
                            a.completed
                              ? 'text-[var(--foreground)] font-medium'
                              : 'text-[var(--muted-foreground)]'
                          }`}
                        >
                          {a.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-[var(--muted-foreground)] hidden sm:table-cell">
                      {a.type}
                    </td>
                    <td className="px-3 py-3 text-xs text-[var(--muted-foreground)] hidden sm:table-cell">
                      {new Date(a.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold whitespace-nowrap">
                      <span className={a.completed ? 'text-[var(--success)]' : 'text-[var(--muted-foreground)]'}>
                        {a.completed ? a.points : '—'} / {a.points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--border)] font-bold text-[var(--foreground)]">
                  <td className="px-5 py-3" colSpan={3}>
                    Total
                  </td>
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    {earned} / {possible}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      <Link
        href={`/courses/${course.id}/assignments`}
        className="inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
      >
        → Manage assignments
      </Link>
    </div>
  );
}
