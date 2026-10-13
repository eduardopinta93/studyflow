'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  MessageSquare,
  Lock,
  Pin,
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  type: string;
  points: number;
}

interface Discussion {
  id: string;
  title: string;
  locked: boolean;
  pinned: boolean;
  createdAt: string;
  _count: { entries: number };
}

interface Course {
  id: string;
  name: string;
  color: string;
  assignments: Assignment[];
}

interface Module {
  key: string;
  title: string;
  range: string;
  items: {
    kind: 'assignment' | 'discussion';
    id: string;
    title: string;
    subtitle: string;
    done: boolean;
    locked: boolean;
    href: string;
    badge: string;
    sortAt: number;
  }[];
  done: number;
  total: number;
}

const typeIcons: Record<string, string> = {
  assignment: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  exam: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  project: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  quiz: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  discussion: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

function weekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function CourseModulesPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [course, setCourse] = useState<Course | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    Promise.all([
      fetch(`/api/courses/${courseId}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/courses/${courseId}/discussions`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([courseData, discussionData]) => {
        if (courseData && !courseData.error) setCourse(courseData);
        if (Array.isArray(discussionData)) setDiscussions(discussionData);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const modules = useMemo<Module[]>(() => {
    if (!course) return [];

    const buckets = new Map<number, Module>();

    const getBucket = (date: Date) => {
      const start = weekStart(date);
      const key = start.getTime();
      let bucket = buckets.get(key);
      if (!bucket) {
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        bucket = {
          key: String(key),
          title: '',
          range: `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
          items: [],
          done: 0,
          total: 0,
        };
        buckets.set(key, bucket);
      }
      return bucket;
    };

    for (const a of course.assignments) {
      const bucket = getBucket(new Date(a.dueDate));
      bucket.items.push({
        kind: 'assignment',
        id: a.id,
        title: a.title,
        subtitle: `Due ${new Date(a.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
        done: a.completed,
        locked: false,
        href: `/courses/${courseId}/assignments`,
        badge: a.type,
        sortAt: new Date(a.dueDate).getTime(),
      });
    }

    for (const d of discussions) {
      const bucket = getBucket(new Date(d.createdAt));
      bucket.items.push({
        kind: 'discussion',
        id: d.id,
        title: d.title,
        subtitle: `${d._count.entries} ${d._count.entries === 1 ? 'reply' : 'replies'}`,
        done: false,
        locked: d.locked,
        href: `/courses/${courseId}/discussions/${d.id}`,
        badge: d.pinned ? 'pinned' : 'discussion',
        sortAt: new Date(d.createdAt).getTime(),
      });
    }

    const sorted = [...buckets.values()].sort(
      (a, b) => Number(a.key) - Number(b.key)
    );

    return sorted.map((bucket, index) => {
      const items = bucket.items.sort((a, b) => a.sortAt - b.sortAt);
      const done = items.filter((i) => i.done).length;
      return {
        ...bucket,
        title: `Module ${index + 1}`,
        items,
        done,
        total: items.filter((i) => i.kind === 'assignment').length,
      };
    });
  }, [course, discussions, courseId]);

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2
          className="text-lg font-bold text-[var(--foreground)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Modules
        </h2>
        <p className="text-xs text-[var(--muted-foreground)]">
          {modules.length} module{modules.length !== 1 ? 's' : ''} · organized by week
        </p>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-16 glass rounded-3xl px-4">
          <BookOpen className="mx-auto text-[var(--muted-foreground)] mb-4" size={36} />
          <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            No modules yet
          </h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Modules appear automatically once this course has assignments.
          </p>
        </div>
      ) : (
        modules.map((mod) => {
          const percent = mod.total > 0 ? Math.round((mod.done / mod.total) * 100) : 0;
          return (
            <section key={mod.key} className="glass rounded-2xl overflow-hidden">
              <div className="px-4 sm:px-5 py-4 border-b border-[var(--border)]">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3
                      className="text-sm font-bold text-[var(--foreground)]"
                      style={{ fontFamily: 'var(--font-heading)' }}
                    >
                      {mod.title}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">{mod.range}</p>
                  </div>
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: percent === 100 ? 'var(--success)' : course?.color ?? 'var(--accent)',
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[var(--muted-foreground)] whitespace-nowrap">
                      {mod.total > 0 ? `${mod.done}/${mod.total}` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <ul className="divide-y divide-[var(--border)]">
                {mod.items.map((item) => (
                  <li key={`${item.kind}-${item.id}`}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-[var(--muted)]/60 transition-colors"
                    >
                      {item.kind === 'discussion' ? (
                        <MessageSquare size={16} className="shrink-0 text-[var(--muted-foreground)]" />
                      ) : item.done ? (
                        <CheckCircle2 size={16} className="shrink-0 text-[var(--success)]" />
                      ) : (
                        <Circle size={16} className="shrink-0 text-[var(--muted-foreground)]" />
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 ${
                          typeIcons[item.badge] ||
                          typeIcons[item.kind === 'discussion' ? 'discussion' : 'assignment']
                        }`}
                      >
                        {item.badge}
                      </span>
                      <span
                        className={`flex-1 min-w-0 text-sm truncate ${
                          item.done
                            ? 'text-[var(--muted-foreground)] line-through'
                            : 'text-[var(--foreground)] font-medium'
                        }`}
                      >
                        {item.title}
                      </span>
                      {item.locked && <Lock size={13} className="text-[var(--muted-foreground)] shrink-0" />}
                      {item.kind === 'discussion' && item.badge === 'pinned' && (
                        <Pin size={13} className="text-amber-500 shrink-0" />
                      )}
                      <span className="text-xs text-[var(--muted-foreground)] shrink-0 hidden sm:block">
                        {item.subtitle}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
