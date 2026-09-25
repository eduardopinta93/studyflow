'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, GraduationCap } from 'lucide-react';
import CoursePickerModal from '../CoursePickerModal';

export default function QuickActions() {
  const router = useRouter();
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setEnrolled(!!data.enrolledCategoryId);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Quick Actions</h2>
      <div className="flex flex-wrap gap-3">
        {enrolled === false && (
          <button
            onClick={() => router.push('/onboarding')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all"
          >
            <GraduationCap size={16} />
            Set Up Studies
          </button>
        )}
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all"
        >
          <Plus size={16} />
          Add Course
        </button>
      </div>
      <CoursePickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onAdded={() => router.refresh()}
      />
    </div>
  );
}
