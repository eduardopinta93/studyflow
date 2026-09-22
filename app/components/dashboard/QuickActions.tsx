'use client';

import { useRouter } from 'next/navigation';
import { Plus, ClipboardList } from 'lucide-react';

export default function QuickActions() {
  const router = useRouter();

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Quick Actions</h2>
      <div className="flex gap-3">
        <button
          onClick={() => router.push('/courses')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all"
        >
          <Plus size={16} />
          New Course
        </button>
        <button
          onClick={() => router.push('/assignments')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--muted)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-[var(--border)] transition-all"
        >
          <ClipboardList size={16} />
          New Assignment
        </button>
      </div>
    </div>
  );
}
