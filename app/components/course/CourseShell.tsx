'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Sidebar from '../Sidebar';
import ThemeToggle from '../ThemeToggle';

interface CourseShellCourse {
  id: string;
  name: string;
  code: string | null;
  term: string | null;
  color: string;
}

export default function CourseShell({
  course,
  children,
}: {
  course: CourseShellCourse;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/courses/${course.id}`;

  const tabs = [
    { label: 'Home', href: base },
    { label: 'Announcements', href: `${base}/announcements` },
    { label: 'Modules', href: `${base}/modules` },
    { label: 'Assignments', href: `${base}/assignments` },
    { label: 'Discussions', href: `${base}/discussions` },
    { label: 'Grades', href: `${base}/grades` },
  ];

  const isActive = (href: string) =>
    href === base ? pathname === base : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen glass-backdrop">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-w-0 relative z-10 flex flex-col">
        <header
          className="relative shrink-0 pt-14 lg:pt-0"
          style={{
            background: `linear-gradient(135deg, ${course.color} 0%, color-mix(in srgb, ${course.color} 55%, #05263D) 100%)`,
          }}
        >
          <div className="px-4 sm:px-6 lg:px-8 pt-4 lg:pt-6 pb-1">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-xs text-white/70 mb-1.5"
            >
              <Link href="/courses" className="hover:text-white transition-colors">
                Courses
              </Link>
              <ChevronRight size={12} className="opacity-60" />
              <span className="text-white/90 font-medium truncate max-w-[50vw]">
                {course.code ? `${course.code} · ` : ''}
                {course.name}
              </span>
            </nav>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1
                  className="text-xl sm:text-2xl font-bold text-white leading-tight truncate"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {course.name}
                </h1>
                {course.term && (
                  <p className="text-xs text-white/70 mt-0.5">{course.term}</p>
                )}
              </div>
              <ThemeToggle />
            </div>
          </div>

          <nav className="flex gap-0.5 px-2 sm:px-4 overflow-x-auto scrollbar-thin mt-2">
            {tabs.map((tab) => {
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`relative px-3 sm:px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'text-white'
                      : 'text-white/65 hover:text-white'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`absolute left-2 right-2 -bottom-px h-[3px] rounded-t-full transition-opacity ${
                      active ? 'bg-white opacity-100' : 'opacity-0'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </header>

        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
