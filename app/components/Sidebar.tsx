'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  ClipboardList,
  GraduationCap,
  ListTodo,
  Mail,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import QuickAddFab from './QuickAddFab';
import Avatar from './Avatar';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Courses', href: '/courses', icon: BookOpen },
  { label: 'Assignments', href: '/assignments', icon: ClipboardList },
  { label: 'Grades', href: '/grades', icon: GraduationCap },
  { label: 'To-dos', href: '/todos', icon: ListTodo },
  { label: 'Inbox', href: '/inbox', icon: Mail },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    let cancelled = false;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/messages');
        if (!res.ok) return;
        const messages = await res.json();
        if (!cancelled && Array.isArray(messages)) {
          setUnread(messages.filter((m: { read: boolean }) => !m.read).length);
        }
      } catch {
        /* ignore */
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 60_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [session?.user, pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="glass-btn lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl"
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
        className={`glass-nav fixed left-0 top-0 h-full w-60 rounded-r-[2rem] z-40 transition-transform duration-200 ease-out lg:translate-x-0 flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-5 glass-divider">
          <Image src="/logo.png" alt="" width={32} height={32} className="w-8 h-8 rounded-lg" />
          <div className="min-w-0">
            <span
              className="block text-base font-bold text-[var(--foreground)] tracking-tight leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              StudyFlow
            </span>
            <span className="block text-[10px] uppercase tracking-[0.14em] font-semibold text-[var(--muted-foreground)]">
              Student Portal
            </span>
          </div>
        </div>

        <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`glass-nav-item flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  active
                    ? 'glass-nav-active'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <item.icon size={16} />
                {item.label}
                {item.href === '/inbox' && unread > 0 && (
                  <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {session?.user && (
          <div className="p-3 glass-divider">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              title="View profile"
              className="glass-nav-item flex items-center gap-3 px-3 py-2 mb-1 min-w-0 rounded-xl"
            >
              <Avatar
                src={session.user.avatarUrl}
                name={session.user.name ?? session.user.email}
                size={36}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">
                  {session.user.email}
                </p>
              </div>
            </Link>
            <button
              onClick={() => signOut({ redirectTo: '/auth/login' })}
              className="glass-nav-item flex w-full items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </aside>

      <QuickAddFab />
    </>
  );
}
