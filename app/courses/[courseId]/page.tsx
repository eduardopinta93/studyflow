'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Megaphone,
  ClipboardList,
  GraduationCap,
  MessageSquare,
  CheckCircle2,
  Circle,
  ArrowRight,
} from 'lucide-react';
import { GRADE_STYLES, courseGrade } from '@/lib/grade';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  points: number;
  completed: boolean;
  type: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  authorName: string;
  createdAt: string;
}

interface CourseDetail {
  id: string;
  name: string;
  code: string | null;
  term: string | null;
  notes: string | null;
  color: string;
  assignments: Assignment[];
}

const typeColors: Record<string, string> = {
  assignment: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  exam: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  project: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  quiz: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

function dueLabel(date: string) {
  const d = new Date(date);
  const diff = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  if (diff < 0) return { text: 'Overdue', urgent: true };
  if (diff === 0) return { text: 'Due today', urgent: true };
  if (diff === 1) return { text: 'Due tomorrow', urgent: true };
  return { text: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), urgent: false };
}

export default function CourseHomePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    Promise.all([
      fetch(`/api/courses/${courseId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/courses/${courseId}/announcements`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([courseData, annData]) => {
        if (courseData && !courseData.error) setCourse(courseData);
        if (Array.isArray(annData)) setAnnouncements(annData);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="w-8 h-8 border-2 border-white/60 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-[var(--muted-foreground)] mt-4">Loading course...</p>
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
  const upcoming = [...course.assignments]
    .filter((a) => !a.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);
  const summary = [...course.assignments]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 8);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <Megaphone size={16} style={{ color: course.color }} />
              Recent Announcements
            </h2>
            <Link
              href={`/courses/${course.id}/announcements`}
              className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              Show All <ArrowRight size={12} />
            </Link>
          </div>
          {announcements.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              No announcements yet. Your instructor has not posted anything.
            </p>
          ) : (
            <ul className="space-y-3">
              {announcements.slice(0, 3).map((a) => (
                <li key={a.id} className="pb-3 last:pb-0 last:border-0 border-b border-[var(--border)]">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{a.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">
                    {a.authorName} ·{' '}
                    {new Date(a.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">{a.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="flex items-center gap-2 text-base font-bold text-[var(--foreground)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <ClipboardList size={16} style={{ color: course.color }} />
              Course Summary
            </h2>
            <Link
              href={`/courses/${course.id}/assignments`}
              className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              View Assignments <ArrowRight size={12} />
            </Link>
          </div>
          {summary.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">No assignments in this course yet.</p>
          ) : (
            <ul className="space-y-1">
              {summary.map((a) => {
                const label = dueLabel(a.dueDate);
                return (
                  <li key={a.id}>
                    <Link
                      href={`/courses/${course.id}/assignments`}
                      className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[var(--muted)] transition-colors"
                    >
                      {a.completed ? (
                        <CheckCircle2 size={16} className="text-[var(--success)] shrink-0" />
                      ) : (
                        <Circle size={16} className="text-[var(--muted-foreground)] shrink-0" />
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 ${typeColors[a.type] || typeColors.assignment}`}
                      >
                        {a.type}
                      </span>
                      <span
                        className={`flex-1 min-w-0 text-sm truncate ${
                          a.completed
                            ? 'text-[var(--muted-foreground)] line-through'
                            : 'text-[var(--foreground)] font-medium'
                        }`}
                      >
                        {a.title}
                      </span>
                      <span
                        className={`text-xs font-medium shrink-0 ${label.urgent ? 'text-[var(--destructive)]' : 'text-[var(--muted-foreground)]'}`}
                      >
                        {label.text}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)] shrink-0 w-14 text-right">
                        {a.points} pts
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-5">
        <div className="glass rounded-2xl p-4 space-y-2">
          <Link
            href={`/courses/${course.id}/assignments`}
            className="flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-xl glass-btn text-sm font-semibold text-[var(--foreground)] transition-colors"
          >
            View Assignments <ClipboardList size={15} className="text-[var(--muted-foreground)]" />
          </Link>
          <Link
            href={`/courses/${course.id}/grades`}
            className="flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-xl glass-btn text-sm font-semibold text-[var(--foreground)] transition-colors"
          >
            View Grades <GraduationCap size={15} className="text-[var(--muted-foreground)]" />
          </Link>
          <Link
            href={`/courses/${course.id}/discussions`}
            className="flex items-center justify-between gap-2 w-full px-4 py-2.5 rounded-xl glass-btn text-sm font-semibold text-[var(--foreground)] transition-colors"
          >
            Discussions <MessageSquare size={15} className="text-[var(--muted-foreground)]" />
          </Link>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3
            className="text-sm font-bold text-[var(--foreground)] mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Coming Up
          </h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">Nothing due. Nice work.</p>
          ) : (
            <ul className="space-y-2.5">
              {upcoming.map((a) => {
                const label = dueLabel(a.dueDate);
                return (
                  <li key={a.id} className="flex items-start gap-2.5">
                    <span
                      className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: course.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{a.title}</p>
                      <p className={`text-xs ${label.urgent ? 'text-[var(--destructive)] font-semibold' : 'text-[var(--muted-foreground)]'}`}>
                        {label.text} · {a.points} pts
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h3
            className="text-sm font-bold text-[var(--foreground)] mb-3"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Current Grade
          </h3>
          {grade ? (
            <div className="flex items-center gap-4">
              <span
                className={`text-3xl font-black px-3 py-1 rounded-xl ${GRADE_STYLES[grade.letter]}`}
              >
                {grade.letter}
              </span>
              <div className="min-w-0">
                <p className="text-lg font-bold text-[var(--foreground)]">{grade.percent}%</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {grade.earned} / {grade.possible} points
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">No graded work yet.</p>
          )}
        </div>
      </aside>
    </div>
  );
}
