'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Hash,
  MessageSquare,
  Megaphone,
  Search,
  Trash2,
} from 'lucide-react';
import Avatar from '../../components/Avatar';

interface AdminCourse {
  id: string;
  name: string;
  code: string | null;
  term: string | null;
  color: string;
  createdAt: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null } | null;
  _count: { assignments: number; announcements: number; discussionTopics: number };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminCourse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (q.trim()) params.set('q', q.trim());
      const res = await fetch(`/api/admin/courses?${params}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Failed to load courses');
        return;
      }
      const data = await res.json();
      setCourses(data.courses);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError('');
    } catch {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const removeCourse = async (course: AdminCourse) => {
    setBusyId(course.id);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Failed to delete course');
        return;
      }
      setConfirmDelete(null);
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
        />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search by course, code or owner email..."
          className="glass-field rounded-xl pl-10 pr-3.5 py-2.5 text-sm w-full"
        />
      </div>

      {error && (
        <p className="text-sm text-[var(--destructive-text)] bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="glass rounded-[1.75rem] overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-7 h-7 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[var(--muted-foreground)] mt-3 text-sm">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto text-[var(--muted-foreground)] mb-3" size={28} />
            <p className="text-sm text-[var(--muted-foreground)]">No courses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="glass-divider text-left text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                  <th className="px-5 py-3 font-semibold">Course</th>
                  <th className="px-5 py-3 font-semibold">Owner</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Content</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Created</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="glass-divider">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: course.color }}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--foreground)] truncate">
                            {course.name}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)] truncate flex items-center gap-1">
                            {course.code ? (
                              <>
                                <Hash size={10} /> {course.code}
                              </>
                            ) : (
                              'No course code'
                            )}
                            {course.term ? ` · ${course.term}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {course.user ? (
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar src={course.user.avatarUrl} name={course.user.name} size={28} />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[var(--foreground)] truncate">
                              {course.user.name}
                            </p>
                            <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                              {course.user.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--muted-foreground)]">Deleted user</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--muted-foreground)] hidden md:table-cell">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <BookOpen size={11} /> {course._count.assignments}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Megaphone size={11} /> {course._count.announcements}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare size={11} /> {course._count.discussionTopics}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[var(--muted-foreground)] hidden md:table-cell whitespace-nowrap">
                      {new Date(course.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setConfirmDelete(course)}
                        disabled={busyId === course.id}
                        className="glass-btn px-2.5 py-1.5 rounded-lg text-xs text-[var(--destructive-text)] disabled:opacity-40"
                        title="Delete course"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-[var(--muted-foreground)] text-xs">
          {total} course{total !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="glass-btn px-3 py-1.5 rounded-lg text-xs disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-[var(--muted-foreground)]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="glass-btn px-3 py-1.5 rounded-lg text-xs disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-strong glass-in rounded-[1.75rem] p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Delete {confirmDelete.name}?
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              This removes the course owned by {confirmDelete.user?.email ?? 'a deleted user'}, plus its{' '}
              <strong>{confirmDelete._count.assignments}</strong> assignments,{' '}
              <strong>{confirmDelete._count.announcements}</strong> announcements and{' '}
              <strong>{confirmDelete._count.discussionTopics}</strong> discussion topics.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="glass-btn px-4 py-2 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => removeCourse(confirmDelete)}
                disabled={busyId === confirmDelete.id}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {busyId === confirmDelete.id ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
