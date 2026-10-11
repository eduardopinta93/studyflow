'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, Megaphone, Users } from 'lucide-react';

const tabs = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Courses', href: '/admin/courses', icon: BookOpen },
  { label: 'Announcements', href: '/admin/announcements', icon: Megaphone },
];

export default function AdminTabs() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div className="glass-chip inline-flex items-center gap-1 p-1 rounded-2xl">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            isActive(tab.href)
              ? 'bg-[var(--accent)] text-white shadow-sm'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          <tab.icon size={15} />
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
