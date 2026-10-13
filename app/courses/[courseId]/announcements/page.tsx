'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Megaphone, Plus, X, Trash2 } from 'lucide-react';
import { useIsAdmin } from '@/lib/use-is-admin';

interface Announcement {
  id: string;
  title: string;
  message: string;
  authorName: string;
  createdAt: string;
}

export default function CourseAnnouncementsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const isAdmin = useIsAdmin();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchAnnouncements = useCallback(() => {
    fetch(`/api/courses/${courseId}/announcements`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setAnnouncements(data);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/courses/${courseId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to post announcement');
        return;
      }
      setTitle('');
      setMessage('');
      setShowForm(false);
      fetchAnnouncements();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    const res = await fetch(`/api/courses/${courseId}/announcements`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => null);
    if (res && res.ok) setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2
            className="text-lg font-bold text-[var(--foreground)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Announcements
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'Announcement'}
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <form onSubmit={submit} className="glass rounded-2xl p-5 mb-5 space-y-3 animate-slide-down">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Title <span className="text-[var(--destructive)]">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 glass-field rounded-xl text-sm"
              placeholder="Announcement title"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Message <span className="text-[var(--destructive)]">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2.5 glass-field rounded-xl text-sm resize-none"
              placeholder="Write your announcement..."
              rows={4}
              required
            />
          </div>
          {error && (
            <div className="px-3 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-[var(--destructive)] text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50"
          >
            {saving ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 glass rounded-3xl px-4">
          <Megaphone className="mx-auto text-[var(--muted-foreground)] mb-4" size={36} />
          <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            No announcements
          </h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Post the first announcement for this course.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <article key={a.id} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3
                    className="text-base font-bold text-[var(--foreground)]"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {a.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {a.authorName} ·{' '}
                    {new Date(a.createdAt).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => remove(a.id)}
                    title="Delete announcement"
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--destructive)] rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line mt-3">
                {a.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
