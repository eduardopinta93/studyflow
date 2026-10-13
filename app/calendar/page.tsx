'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  type: string;
  courseId: string;
  course: { id: string; name: string; code: string | null; color: string };
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function CalendarPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [now] = useState(() => new Date().getTime());

  useEffect(() => {
    fetch('/api/assignments')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setAssignments(data);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Assignment[]>();
    for (const a of assignments) {
      const key = dayKey(new Date(a.dueDate));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return map;
  }, [assignments]);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const upcoming = useMemo(() => {
    return [...assignments]
      .filter((a) => new Date(a.dueDate).getTime() >= now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 6);
  }, [assignments, now]);

  const today = new Date();

  const shift = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  return (
    <div className="flex min-h-screen glass-backdrop">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pt-12 lg:pt-0">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Calendar
              </h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Every due date across your courses
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => shift(-1)}
                className="glass-btn p-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <span
                className="text-sm font-bold text-[var(--foreground)] min-w-[9rem] text-center"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => shift(1)}
                className="glass-btn p-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
              <ThemeToggle />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            <div className="lg:col-span-3 glass rounded-2xl overflow-hidden">
              <div className="grid grid-cols-7 border-b border-[var(--border)]">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="px-2 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-[var(--muted-foreground)]"
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day[0]}</span>
                  </div>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-24">
                  <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                <div className="grid grid-cols-7">
                  {cells.map((date) => {
                    const key = dayKey(date);
                    const events = eventsByDay.get(key) ?? [];
                    const isCurrentMonth = date.getMonth() === cursor.getMonth();
                    const isToday =
                      date.getFullYear() === today.getFullYear() &&
                      date.getMonth() === today.getMonth() &&
                      date.getDate() === today.getDate();

                    return (
                      <div
                        key={key}
                        className={`min-h-[92px] sm:min-h-[110px] border-r border-b border-[var(--border)] p-1.5 last:border-r-0 ${
                          isCurrentMonth ? '' : 'opacity-40'
                        }`}
                      >
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                            isToday
                              ? 'bg-[var(--accent)] text-white'
                              : 'text-[var(--muted-foreground)]'
                          }`}
                        >
                          {date.getDate()}
                        </span>
                        <div className="mt-1 space-y-1">
                          {events.slice(0, 3).map((a) => (
                            <Link
                              key={a.id}
                              href={`/courses/${a.courseId}/assignments`}
                              title={`${a.title} — ${a.course.name}`}
                              className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] font-semibold leading-tight truncate transition-opacity hover:opacity-75 ${
                                a.completed ? 'opacity-50 line-through' : ''
                              }`}
                              style={{
                                backgroundColor: `${a.course.color}22`,
                                borderLeft: `3px solid ${a.course.color}`,
                              }}
                            >
                              <span className="truncate">{a.title}</span>
                            </Link>
                          ))}
                          {events.length > 3 && (
                            <p className="text-[10px] text-[var(--muted-foreground)] font-semibold px-1">
                              +{events.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="glass rounded-2xl p-5 h-fit">
              <h2
                className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)] mb-4"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <CalendarDays size={15} style={{ color: 'var(--accent)' }} />
                Upcoming
              </h2>
              {upcoming.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Nothing due soon. Enjoy the break.
                </p>
              ) : (
                <ul className="space-y-3">
                  {upcoming.map((a) => {
                    const diff = Math.ceil(
                      (new Date(a.dueDate).getTime() - now) / 86_400_000
                    );
                    return (
                      <li key={a.id}>
                        <Link
                          href={`/courses/${a.courseId}/assignments`}
                          className="flex items-start gap-2.5 group"
                        >
                          <span
                            className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: a.course.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-[var(--foreground)] truncate group-hover:text-[var(--accent)] transition-colors">
                              {a.title}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {a.course.code || a.course.name} ·{' '}
                              <span className={diff <= 2 ? 'text-[var(--destructive-text)] font-semibold' : ''}>
                                {diff < 0
                                  ? 'overdue'
                                  : diff === 0
                                    ? 'today'
                                    : diff === 1
                                      ? 'tomorrow'
                                      : `in ${diff} days`}
                              </span>
                            </p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
