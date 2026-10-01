'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Mail,
  MailOpen,
  Pencil,
  Reply,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface Message {
  id: string;
  subject: string;
  body: string;
  senderId: string | null;
  senderName: string;
  recipientId: string;
  read: boolean;
  createdAt: string;
  sender: UserSummary | null;
  recipient: UserSummary | null;
}

const inputCls =
  'w-full py-2.5 px-3.5 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm transition-all placeholder:text-[var(--muted-foreground)]/70 focus:outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10';

function formatDate(value: string) {
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function InboxPage() {
  const [box, setBox] = useState<'inbox' | 'sent'>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Message | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [recipients, setRecipients] = useState<UserSummary[]>([]);
  const [form, setForm] = useState({ recipientId: '', subject: '', body: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchMessages = useCallback(async (activeBox: 'inbox' | 'sent') => {
    try {
      const res = await fetch(`/api/messages?box=${activeBox}`);
      if (res.ok) setMessages(await res.json());
    } catch {
      console.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const openCompose = async (prefill?: { recipientId?: string; subject?: string }) => {
    setForm({ recipientId: prefill?.recipientId ?? '', subject: prefill?.subject ?? '', body: '' });
    setError('');
    setComposeOpen(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) setRecipients(await res.json());
    } catch {
      console.error('Failed to fetch recipients');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages(box);
  }, [box, fetchMessages]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('compose') === '1') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openCompose();
    }
  }, []);

  const openMessage = async (message: Message) => {
    setViewing(message);
    if (box === 'inbox' && !message.read) {
      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, read: true } : m)));
      setViewing({ ...message, read: true });
      try {
        await fetch(`/api/messages/${message.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true }),
        });
      } catch {
        console.error('Failed to mark message as read');
      }
    }
  };

  const toggleRead = async (message: Message) => {
    const next = !message.read;
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, read: next } : m)));
    setViewing({ ...message, read: next });
    try {
      await fetch(`/api/messages/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: next }),
      });
    } catch {
      console.error('Failed to update message');
    }
  };

  const deleteMessage = async (message: Message) => {
    try {
      const res = await fetch(`/api/messages/${message.id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== message.id));
        setViewing(null);
      }
    } catch {
      console.error('Failed to delete message');
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to send message');
        setSaving(false);
        return;
      }

      setComposeOpen(false);
      setBox('inbox');
      await fetchMessages('inbox');
    } catch {
      setError('Failed to send message');
      setSaving(false);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8 pt-12 lg:pt-0">
            <div>
              <div className="flex items-center gap-2.5">
                <h1
                  className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Inbox
                </h1>
                {box === 'inbox' && unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-white text-xs font-semibold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Messages from your instructor and classmates
              </p>
            </div>
            <button
              onClick={() => openCompose()}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm"
            >
              <Pencil size={15} />
              New message
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            {(['inbox', 'sent'] as const).map((b) => (
              <button
                key={b}
                onClick={() => { setBox(b); setLoading(true); setMessages([]); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  box === b
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
                }`}
              >
                {b === 'inbox' ? 'Inbox' : 'Sent'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-16">
              <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center">
              <Mail size={40} className="mx-auto text-[var(--muted-foreground)] mb-4" />
              <p className="text-sm font-medium text-[var(--foreground)]">
                {box === 'inbox' ? 'Your inbox is empty' : 'No sent messages'}
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {box === 'inbox'
                  ? 'New messages from your instructor will show up here'
                  : 'Messages you send will show up here'}
              </p>
            </div>
          ) : (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden divide-y divide-[var(--border)]">
              {messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className={`w-full flex items-start gap-3 px-4 sm:px-5 py-4 text-left hover:bg-[var(--muted)] transition-colors ${
                    box === 'inbox' && !message.read ? 'bg-[var(--accent)]/5' : ''
                  }`}
                >
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      box === 'inbox' && !message.read ? 'bg-[var(--accent)]' : 'bg-transparent'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span
                        className={`text-sm truncate ${
                          box === 'inbox' && !message.read
                            ? 'font-semibold text-[var(--foreground)]'
                            : 'font-medium text-[var(--foreground)]'
                        }`}
                      >
                        {box === 'inbox'
                          ? message.sender?.name ?? message.senderName
                          : message.recipient?.name ?? 'Recipient'}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)] shrink-0">
                        {formatDate(message.createdAt)}
                      </span>
                    </span>
                    <span className="block text-sm text-[var(--foreground)] truncate mt-0.5">
                      {message.subject}
                    </span>
                    <span className="block text-xs text-[var(--muted-foreground)] truncate mt-0.5">
                      {message.body}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {viewing && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setViewing(null)}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-5 border-b border-[var(--border)]">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {viewing.subject}
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {viewing.senderId ? `From ${viewing.sender?.name ?? viewing.senderName}` : `From ${viewing.senderName}`}
                  {' · '}
                  {new Date(viewing.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={() => setViewing(null)}
                aria-label="Close message"
                className="p-2 hover:bg-[var(--muted)] rounded-xl text-[var(--muted-foreground)] transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                {viewing.body}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-5 pt-0">
              {viewing.senderId && viewing.senderId !== viewing.recipientId && (
                <button
                  onClick={() => {
                    const replyTo = viewing.senderId!;
                    const subject = viewing.subject.startsWith('Re:') ? viewing.subject : `Re: ${viewing.subject}`;
                    setViewing(null);
                    openCompose({ recipientId: replyTo, subject });
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm"
                >
                  <Reply size={15} />
                  Reply
                </button>
              )}

              {box === 'inbox' && (
                <button
                  onClick={() => toggleRead(viewing)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  {viewing.read ? <Mail size={15} /> : <MailOpen size={15} />}
                  {viewing.read ? 'Mark unread' : 'Mark read'}
                </button>
              )}

              <button
                onClick={() => deleteMessage(viewing)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors ml-auto"
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {composeOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setComposeOpen(false)}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
                New message
              </h2>
              <button
                onClick={() => setComposeOpen(false)}
                aria-label="Close composer"
                className="p-2 hover:bg-[var(--muted)] rounded-xl text-[var(--muted-foreground)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={send} className="p-5 space-y-4">
              <div>
                <label htmlFor="recipient" className="block text-sm font-medium mb-2">To</label>
                <select
                  id="recipient"
                  value={form.recipientId}
                  onChange={(e) => setForm({ ...form, recipientId: e.target.value })}
                  className={inputCls}
                  required
                >
                  <option value="">Select a recipient</option>
                  {recipients.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {recipients.length === 0 && (
                  <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
                    No other students have joined yet.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
                <input
                  id="subject"
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className={inputCls}
                  placeholder="What is this about?"
                  required
                />
              </div>

              <div>
                <label htmlFor="body" className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  id="body"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className={`${inputCls} min-h-32 resize-y`}
                  placeholder="Write your message..."
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-[var(--destructive)]">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setComposeOpen(false)}
                  className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.recipientId}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={15} />
                  {saving ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
