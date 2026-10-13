'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MessageSquare,
  Plus,
  X,
  Pin,
  Lock,
  MessagesSquare,
} from 'lucide-react';
import { useIsAdmin } from '@/lib/use-is-admin';

interface DiscussionTopic {
  id: string;
  title: string;
  message: string;
  authorName: string;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
  lastReplyAt: string | null;
  _count: { entries: number };
}

export default function CourseDiscussionsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const isAdmin = useIsAdmin();

  const [topics, setTopics] = useState<DiscussionTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [pinned, setPinned] = useState(false);
  const [locked, setLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchTopics = useCallback(() => {
    fetch(`/api/courses/${courseId}/discussions`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setTopics(data);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/courses/${courseId}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, pinned, locked }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create discussion');
        return;
      }
      setTitle('');
      setMessage('');
      setPinned(false);
      setLocked(false);
      setShowForm(false);
      fetchTopics();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h2
            className="text-lg font-bold text-[var(--foreground)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Discussions
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            {topics.length} topic{topics.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'Discussion'}
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
              placeholder="Topic title"
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
              placeholder="Describe the topic and what students should discuss..."
              rows={4}
              required
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] cursor-pointer">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="rounded accent-[var(--accent)]"
              />
              Pin to top
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] cursor-pointer">
              <input
                type="checkbox"
                checked={locked}
                onChange={(e) => setLocked(e.target.checked)}
                className="rounded accent-[var(--accent)]"
              />
              Closed for replies
            </label>
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
            {saving ? 'Creating...' : 'Create Discussion'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-16 glass rounded-3xl px-4">
          <MessagesSquare className="mx-auto text-[var(--muted-foreground)] mb-4" size={36} />
          <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            No discussions yet
          </h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Start the first conversation for this course.
          </p>
        </div>
      ) : (
        <div className="glass rounded-2xl divide-y divide-[var(--border)] overflow-hidden">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/courses/${courseId}/discussions/${topic.id}`}
              className="flex items-start gap-3 px-4 sm:px-5 py-4 hover:bg-[var(--muted)]/60 transition-colors"
            >
              <span className="mt-0.5 shrink-0 w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center">
                <MessageSquare size={15} className="text-[var(--muted-foreground)]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {topic.pinned && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase">
                      <Pin size={9} /> Pinned
                    </span>
                  )}
                  {topic.locked && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] text-[10px] font-bold uppercase">
                      <Lock size={9} /> Closed
                    </span>
                  )}
                  <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                    {topic.title}
                  </p>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-1">
                  {topic.message}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1.5">
                  Started by <span className="font-medium">{topic.authorName}</span> ·{' '}
                  {new Date(topic.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right shrink-0 hidden sm:block">
                <p className="text-xs font-semibold text-[var(--foreground)]">
                  {topic._count.entries} {topic._count.entries === 1 ? 'reply' : 'replies'}
                </p>
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  {topic.lastReplyAt
                    ? `last ${new Date(topic.lastReplyAt).toLocaleDateString()}`
                    : 'no replies'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
