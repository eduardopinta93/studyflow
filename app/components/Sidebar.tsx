'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Home, BookOpen, ClipboardList, ListTodo, Settings, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Courses', href: '/courses', icon: BookOpen },
  { label: 'Assignments', href: '/assignments', icon: ClipboardList },
  { label: 'To-dos', href: '/todos', icon: ListTodo },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-sm"
        aria-label="Toggle menu"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-60 bg-[var(--card)] border-r border-[var(--border)] z-40 transition-transform duration-200 ease-out lg:translate-x-0 flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border)]">
          <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center text-white text-xs font-bold">
            SF
          </div>
          <span className="text-base font-bold text-[var(--foreground)] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            StudyFlow
          </span>
        </div>

        <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {session?.user && (
          <div className="p-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-3 px-3 py-2 mb-1 min-w-0">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                {session.user.avatarUrl ? (
                  <img src={session.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-[var(--accent)]">
                    {(session.user.name ?? session.user.email ?? 'S').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ redirectTo: '/auth/login' })}
              className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
