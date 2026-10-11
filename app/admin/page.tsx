'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  BookOpen,
  ClipboardList,
  GraduationCap,
  KeyRound,
  Mail,
  MessageSquare,
  ShieldCheck,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import Avatar from '../components/Avatar';

interface Stats {
  totals: {
    users: number;
    admins: number;
    students: number;
    courses: number;
    assignments: number;
    completedAssignments: number;
    completionRate: number;
    messages: number;
    unreadMessages: number;
    discussionTopics: number;
    discussionEntries: number;
    announcements: number;
    activeResetTokens: number;
  };
  growth: { last7Days: number; last30Days: number };
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
    createdAt: string;
    _count: { courses: number };
  }[];
  recentCourses: {
    id: string;
    name: string;
    code: string | null;
    color: string;
    createdAt: string;
    user: { name: string; email: string } | null;
    _count: { assignments: number };
  }[];
  upcomingAssignments: {
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    course: { name: string; color: string };
    user: { name: string };
  }[];
}

function formatAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Failed to load stats');
        return;
      }
      setStats(await res.json());
      setError('');
    } catch {
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[var(--muted-foreground)] mt-4 text-sm">Loading platform stats...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="glass rounded-[2rem] p-8 text-center">
        <p className="text-[var(--destructive-text)] mb-4">{error || 'No data available'}</p>
        <button onClick={load} className="glass-btn px-4 py-2 rounded-xl text-sm">
          Retry
        </button>
      </div>
    );
  }

  const { totals, growth } = stats;

  const cards = [
    { label: 'Students', value: totals.students, icon: Users, accent: 'var(--accent)' },
    { label: 'Admins', value: totals.admins, icon: ShieldCheck, accent: '#8b5cf6' },
    { label: 'Courses', value: totals.courses, icon: BookOpen, accent: '#154920' },
    { label: 'Assignments', value: totals.assignments, icon: ClipboardList, accent: '#d97706' },
    { label: 'Completion', value: `${totals.completionRate}%`, icon: Trophy, accent: '#059669' },
    { label: 'Messages', value: totals.messages, icon: Mail, accent: '#0369a1' },
    {
      label: 'Discussion posts',
      value: totals.discussionEntries,
      icon: MessageSquare,
      accent: '#7c3aed',
    },
    {
      label: 'Active reset links',
      value: totals.activeResetTokens,
      icon: KeyRound,
      accent: '#dc2626',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => (
          <div key={card.label} className="glass rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                {card.label}
              </span>
              <card.icon size={16} style={{ color: card.accent }} />
            </div>
            <p
              className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="glass rounded-[1.75rem] p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus size={16} className="text-[var(--accent)]" />
            <h2 className="text-base font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
              Recent signups
            </h2>
            <span className="ml-auto text-xs text-[var(--muted-foreground)]">
              +{growth.last7Days} this week · +{growth.last30Days} this month
            </span>
          </div>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar src={user.avatarUrl} name={user.name || user.email} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">{user.email}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-500/15 text-purple-400'
                      : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                  }`}
                >
                  {user.role === 'ADMIN' ? 'ADMIN' : `${user._count.courses} courses`}
                </span>
                <span className="text-[11px] text-[var(--muted-foreground)] whitespace-nowrap">
                  {formatAgo(user.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[1.75rem] p-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={16} className="text-[var(--accent)]" />
            <h2 className="text-base font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
              Newest courses
            </h2>
          </div>
          <div className="space-y-3">
            {stats.recentCourses.map((course) => (
              <div key={course.id} className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: course.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {course.name}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">
                    {course.user?.name ?? 'Deleted user'} · {course._count.assignments} assignments
                  </p>
                </div>
                <span className="text-[11px] text-[var(--muted-foreground)] whitespace-nowrap">
                  {formatAgo(course.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-[1.75rem] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-[var(--accent)]" />
            <h2 className="text-base font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
              Upcoming deadlines
            </h2>
          </div>
          <div className="space-y-3">
            {stats.upcomingAssignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {assignment.title}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">
                    {assignment.course.name} · {assignment.user.name}
                  </p>
                </div>
                <span className="text-[11px] text-[var(--muted-foreground)] whitespace-nowrap">
                  {new Date(assignment.dueDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/users" className="glass-btn px-4 py-2.5 rounded-xl text-sm font-medium">
          Manage users
        </Link>
        <Link href="/admin/courses" className="glass-btn px-4 py-2.5 rounded-xl text-sm font-medium">
          Manage courses
        </Link>
      </div>
    </div>
  );
}
