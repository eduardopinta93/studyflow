'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Lock,
  Pin,
  CornerDownRight,
  Trash2,
  Send,
} from 'lucide-react';
import { useIsAdmin } from '@/lib/use-is-admin';

interface DiscussionEntry {
  id: string;
  message: string;
  authorName: string;
  parentId: string | null;
  createdAt: string;
}

interface TopicWithEntries {
  id: string;
  title: string;
  message: string;
  authorName: string;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
  course: { id: string; name: string; code: string | null; color: string };
  entries: DiscussionEntry[];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function DiscussionTopicPage() {
  const params = useParams<{ courseId: string; topicId: string }>();
  const { courseId, topicId } = params;
  const isAdmin = useIsAdmin();

  const [topic, setTopic] = useState<TopicWithEntries | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [topReply, setTopReply] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const fetchTopic = useCallback(() => {
    fetch(`/api/discussions/${topicId}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (data && !data.error) setTopic(data);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [topicId]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  const childrenByParent = useMemo(() => {
    const map = new Map<string | null, DiscussionEntry[]>();
    for (const entry of topic?.entries ?? []) {
      const key = entry.parentId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    return map;
  }, [topic]);

  const postReply = async (parentId: string | null) => {
    const text = (parentId ? replyText : topReply).trim();
    if (!text || posting) return;

    setPosting(true);
    setError('');
    try {
      const res = await fetch(`/api/discussions/${topicId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, parentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to post reply');
        return;
      }
      if (parentId) {
        setReplyText('');
        setReplyingTo(null);
      } else {
        setTopReply('');
      }
      fetchTopic();
    } catch {
      setError('Network error');
    } finally {
      setPosting(false);
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!confirm('Delete this reply and any nested replies?')) return;
    const res = await fetch(`/api/discussions/${topicId}/entries/${entryId}`, {
      method: 'DELETE',
    }).catch(() => null);
    if (res && res.ok) fetchTopic();
  };

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (notFound || !topic) {
    return (
      <div className="text-center py-24 glass rounded-3xl">
        <p className="text-sm text-[var(--muted-foreground)] mb-4">This discussion was not found.</p>
        <Link
          href={`/courses/${courseId}/discussions`}
          className="text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          Back to Discussions
        </Link>
      </div>
    );
  }

  const renderEntry = (entry: DiscussionEntry, depth: number): React.ReactNode => {
    const replies = childrenByParent.get(entry.id) ?? [];
    const isReplyOpen = replyingTo === entry.id;

    return (
      <li key={entry.id}>
        <div
          className={`flex gap-3 px-3 sm:px-4 py-3.5 ${depth > 0 ? 'bg-[var(--muted)]/40' : ''}`}
        >
          <div
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
            style={{ backgroundColor: topic.course.color }}
          >
            {initials(entry.authorName) || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {entry.authorName}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]" title={formatDateTime(entry.createdAt)}>
                {formatDate(entry.createdAt)}
              </span>
            </div>
            <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line mt-1">
              {entry.message}
            </p>
            <div className="flex items-center gap-3 mt-2">
              {isAdmin && !topic.locked && (
                <button
                  onClick={() => {
                    setReplyingTo(isReplyOpen ? null : entry.id);
                    setReplyText('');
                    setError('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  <CornerDownRight size={12} /> Reply
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              )}
            </div>

            {isAdmin && isReplyOpen && (
              <div className="mt-3 glass-inset rounded-xl p-3 animate-slide-down">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 glass-field rounded-lg text-sm resize-none bg-transparent border-0 shadow-none focus:ring-0"
                  placeholder={`Reply to ${entry.authorName}...`}
                  rows={3}
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => postReply(entry.id)}
                    disabled={posting || !replyText.trim()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--accent)] text-white rounded-lg text-xs font-semibold hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50"
                  >
                    <Send size={12} /> Post Reply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {replies.length > 0 && (
          <ul className="ml-6 sm:ml-10 border-l-2 border-[var(--border)] divide-y divide-[var(--border)]/60">
            {replies.map((reply) => renderEntry(reply, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  const topLevel = childrenByParent.get(null) ?? [];

  return (
    <div className="max-w-3xl">
      <Link
        href={`/courses/${courseId}/discussions`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4 transition-colors"
      >
        <ArrowLeft size={13} /> All Discussions
      </Link>

      <article className="glass rounded-2xl p-5 mb-5">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {topic.pinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase">
              <Pin size={9} /> Pinned
            </span>
          )}
          {topic.locked && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] text-[10px] font-bold uppercase">
              <Lock size={9} /> Closed
            </span>
          )}
          <span className="text-xs text-[var(--muted-foreground)]">
            {topic.entries.length} {topic.entries.length === 1 ? 'reply' : 'replies'}
          </span>
        </div>

        <h1
          className="text-xl sm:text-2xl font-bold text-[var(--foreground)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {topic.title}
        </h1>

        <div className="flex items-center gap-3 mt-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: topic.course.color }}
          >
            {initials(topic.authorName) || '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{topic.authorName}</p>
            <p className="text-xs text-[var(--muted-foreground)]" title={formatDateTime(topic.createdAt)}>
              {formatDate(topic.createdAt)}
            </p>
          </div>
        </div>

        <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line mt-4 pt-4 border-t border-[var(--border)]">
          {topic.message}
        </p>
      </article>

      {error && (
        <div className="px-3 py-2.5 mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-[var(--destructive)] text-sm">
          {error}
        </div>
      )}

      <section className="glass rounded-2xl overflow-hidden mb-5">
        {topLevel.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
            No replies yet. Be the first to respond.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {topLevel.map((entry) => renderEntry(entry, 0))}
          </ul>
        )}
      </section>

      {!isAdmin ? null : topic.locked ? (
        <div className="flex items-center gap-2 px-4 py-3.5 glass rounded-2xl text-sm text-[var(--muted-foreground)]">
          <Lock size={15} /> This discussion is closed for new replies.
        </div>
      ) : (
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-semibold text-[var(--foreground)] mb-2">Reply to this discussion</p>
          <textarea
            value={topReply}
            onChange={(e) => setTopReply(e.target.value)}
            className="w-full px-3 py-2.5 glass-field rounded-xl text-sm resize-none"
            placeholder="Share your thoughts..."
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={() => postReply(null)}
              disabled={posting || !topReply.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50"
            >
              <Send size={14} /> Post Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
