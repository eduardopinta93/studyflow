'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Hash,
  Megaphone,
  Plus,
  Search,
  Send,
  Trash2,
} from 'lucide-react';

interface AnnouncementRow {
  id: string;
  title: string;
  message: string;
  authorName: string;
  createdAt: string;
  course: {
    id: string;
    name: string;
    code: string | null;
    color: string;
    owner: { name: string; email: string } | null;
  };
}

interface CourseOption {
  id: string;
  name: string;
  code: string | null;
  color: string;
  user: { name: string; email: string } | null;
}

export default function AdminAnnouncementsPage() {
  const [rows, setRows] = useState<AnnouncementRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ courseId: '', title: '', message: '' });
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AnnouncementRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (q.trim()) params.set('q', q.trim());
      const res = await fetch(`/api/admin/announcements?${params}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Failed to load announcements');
        return;
      }
      const data = await res.json();
      setRows(data.announcements);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError('');
    } catch {
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    fetch('/api/admin/courses?limit=100')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.courses)) setCourses(data.courses);
      })
      .catch(() => undefined);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Failed to post announcement');
        return;
      }
      setForm({ courseId: '', title: '', message: '' });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: AnnouncementRow) => {
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/admin/announcements/${row.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Failed to delete announcement');
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
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
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
            placeholder="Search announcements or courses..."
            className="glass-field rounded-xl pl-10 pr-3.5 py-2.5 text-sm w-full"
          />
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="glass-btn glass-btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 justify-center"
        >
          <Plus size={15} /> New announcement
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="glass rounded-[1.5rem] p-5 space-y-3">
          <select
            value={form.courseId}
            onChange={(e) => setForm((f) => ({ ...f, courseId: e.target.value }))}
            className="glass-field rounded-xl px-3.5 py-2.5 text-sm w-full"
            required
          >
            <option value="">Choose a course...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
                {course.code ? ` (${course.code})` : ''} — {course.user?.name ?? 'No owner'}
              </option>
            ))}
          </select>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Announcement title"
            className="glass-field rounded-xl px-3.5 py-2.5 text-sm w-full"
            required
          />
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="What should students know?"
            rows={4}
            className="glass-field rounded-xl px-3.5 py-2.5 text-sm w-full resize-y"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="glass-btn px-4 py-2 rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="glass-btn glass-btn-primary px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={14} /> {saving ? 'Posting...' : 'Post to course'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="text-sm text-[var(--destructive-text)] bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {loading ? (
        <div className="text-center py-16">
          <div className="w-7 h-7 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[var(--muted-foreground)] mt-3 text-sm">Loading announcements...</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 glass rounded-[1.75rem]">
          <Megaphone className="mx-auto text-[var(--muted-foreground)] mb-3" size={28} />
          <p className="text-sm text-[var(--muted-foreground)]">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="glass rounded-[1.5rem] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
                      {row.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)]">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.course.color }} />
                      {row.course.name}
                      {row.course.code && (
                        <span className="inline-flex items-center gap-0.5 font-mono">
                          <Hash size={9} />
                          {row.course.code}
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2 whitespace-pre-wrap">
                    {row.message}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-3">
                    {row.authorName} ·{' '}
                    {row.course.owner ? `course owned by ${row.course.owner.name}` : 'orphaned course'} ·{' '}
                    {new Date(row.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete(row)}
                  disabled={busyId === row.id}
                  className="glass-btn px-2.5 py-1.5 rounded-lg text-xs text-[var(--destructive-text)] shrink-0 disabled:opacity-40"
                  title="Delete announcement"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <p className="text-[var(--muted-foreground)] text-xs">
          {total} announcement{total !== 1 ? 's' : ''}
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
              Delete “{confirmDelete.title}”?
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              This removes the announcement from {confirmDelete.course.name} for everyone.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setConfirmDelete(null)} className="glass-btn px-4 py-2 rounded-xl text-sm">
                Cancel
              </button>
              <button
                onClick={() => remove(confirmDelete)}
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
