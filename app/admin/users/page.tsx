'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ChevronLeft, ChevronRight, Mail, Search, ShieldCheck, Trash2, User as UserIcon } from 'lucide-react';
import Avatar from '../../components/Avatar';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  major: string | null;
  year: string | null;
  createdAt: string;
  _count: { courses: number; assignments: number };
}

const ROLES = ['ALL', 'ADMIN', 'USER'] as const;

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [role, setRole] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (q.trim()) params.set('q', q.trim());
      if (role !== 'ALL') params.set('role', role);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Failed to load users');
        return;
      }
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setError('');
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, q, role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const changeRole = async (user: AdminUser) => {
    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Failed to update role');
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)));
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (user: AdminUser) => {
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? 'Failed to delete user');
        return;
      }
      setConfirmDelete(null);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const myId = session?.user?.id;

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
            placeholder="Search by name or email..."
            className="glass-field rounded-xl pl-10 pr-3.5 py-2.5 text-sm w-full"
          />
        </div>
        <div className="glass-chip inline-flex items-center gap-1 p-1 rounded-xl">
          {ROLES.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setRole(filter);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                role === filter
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {filter === 'ALL' ? 'Everyone' : filter === 'ADMIN' ? 'Admins' : 'Students'}
            </button>
          ))}
        </div>
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
            <p className="text-[var(--muted-foreground)] mt-3 text-sm">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <UserIcon className="mx-auto text-[var(--muted-foreground)] mb-3" size={28} />
            <p className="text-sm text-[var(--muted-foreground)]">No users match this filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="glass-divider text-left text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Activity</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Joined</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === myId;
                  return (
                    <tr key={user.id} className="glass-divider">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar src={user.avatarUrl} name={user.name || user.email} size={34} />
                          <div className="min-w-0">
                            <p className="font-medium text-[var(--foreground)] truncate flex items-center gap-1.5">
                              {user.name || 'Unnamed'}
                              {isSelf && (
                                <span className="text-[10px] text-[var(--muted-foreground)]">(you)</span>
                              )}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-500/15 text-purple-400'
                              : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                          }`}
                        >
                          {user.role === 'ADMIN' && <ShieldCheck size={11} />}
                          {user.role === 'ADMIN' ? 'Admin' : 'Student'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[var(--muted-foreground)] hidden md:table-cell">
                        {user._count.courses} courses · {user._count.assignments} assignments
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[var(--muted-foreground)] hidden md:table-cell whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/inbox?compose=1&to=${user.id}`}
                            title="Message this user"
                            className="glass-btn px-2.5 py-1.5 rounded-lg text-xs inline-flex items-center"
                          >
                            <Mail size={14} />
                          </Link>
                          <button
                            onClick={() => changeRole(user)}
                            disabled={busyId === user.id || isSelf}
                            title={
                              isSelf
                                ? 'You cannot change your own role'
                                : user.role === 'ADMIN'
                                  ? 'Demote to student'
                                  : 'Promote to admin'
                            }
                            className="glass-btn px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
                          >
                            {user.role === 'ADMIN' ? 'Demote' : 'Promote'}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(user)}
                            disabled={busyId === user.id || isSelf}
                            title={isSelf ? 'You cannot delete your own account' : 'Delete user'}
                            className="glass-btn px-2.5 py-1.5 rounded-lg text-xs text-[var(--destructive-text)] disabled:opacity-40"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-[var(--muted-foreground)] text-xs">
          {total} user{total !== 1 ? 's' : ''}
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
              Delete {confirmDelete.name || confirmDelete.email}?
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              This permanently removes the account along with their{' '}
              <strong>{confirmDelete._count.courses}</strong> course
              {confirmDelete._count.courses !== 1 ? 's' : ''} and{' '}
              <strong>{confirmDelete._count.assignments}</strong> assignment
              {confirmDelete._count.assignments !== 1 ? 's' : ''}. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="glass-btn px-4 py-2 rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => removeUser(confirmDelete)}
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
