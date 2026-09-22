'use client';

import { BookOpen, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface Stats {
  totalCourses: number;
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  overdueCount: number;
}

export default function StudyStats({ stats }: { stats: Stats }) {
  const done = stats.completedAssignments;
  const total = stats.totalAssignments;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center mb-3">
          <BookOpen className="text-blue-500" size={20} />
        </div>
        <p className="text-2xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
          {stats.totalCourses}
        </p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">Enrolled courses</p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/40 rounded-xl flex items-center justify-center mb-3">
          <AlertTriangle className="text-amber-500" size={20} />
        </div>
        <p className="text-2xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
          {stats.pendingAssignments}
        </p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">Still pending</p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center mb-3">
          <CheckCircle className="text-emerald-500" size={20} />
        </div>
        <p className="text-2xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
          {done}<span className="text-sm font-normal text-[var(--muted-foreground)]">/{total}</span>
        </p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">Completed</p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
        <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/40 rounded-xl flex items-center justify-center mb-3">
          <TrendingUp className="text-purple-500" size={20} />
        </div>
        <p className="text-2xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
          {pct}<span className="text-sm font-normal text-[var(--muted-foreground)]">%</span>
        </p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">Completion rate</p>
        <div className="mt-2 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
