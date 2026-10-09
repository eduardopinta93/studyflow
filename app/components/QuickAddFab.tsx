'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, ClipboardList, Mail, Plus } from 'lucide-react';
import { useIsAdmin } from '@/lib/use-is-admin';

const actions = [
  { label: 'New course', href: '/courses?new=1', icon: BookOpen, adminOnly: false },
  { label: 'New assignment', href: '/assignments?new=1', icon: ClipboardList, adminOnly: true },
  { label: 'New message', href: '/inbox?compose=1', icon: Mail, adminOnly: true },
];

export default function QuickAddFab() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const visibleActions = actions.filter((action) => !action.adminOnly || isAdmin);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {open && (
          <div className="glass-popover rounded-2xl overflow-hidden min-w-44">
            {visibleActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors whitespace-nowrap"
              >
                <action.icon size={16} className="text-[var(--accent)]" />
                {action.label}
              </Link>
            ))}
          </div>
        )}

        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close quick actions' : 'Quick add'}
          aria-expanded={open}
          className="glass-fab w-14 h-14 rounded-full text-white flex items-center justify-center"
        >
          <Plus
            size={24}
            className={`transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
          />
        </button>
      </div>
    </>
  );
}
