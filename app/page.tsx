'use client';

import Sidebar from './components/Sidebar';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Calendar, Hash, StickyNote } from 'lucide-react';
import { getCourseImage } from '@/lib/course-image';
import { GRADE_STYLES, type CourseGrade } from '@/lib/grade';
import UpcomingDeadlines from './components/dashboard/UpcomingDeadlines';
import ThemeToggle from './components/ThemeToggle';

interface Course {
  id: string;
  name: string;
  code: string | null;
  term: string | null;
  notes: string | null;
  color: string;
  createdAt: string;
  _count?: { assignments: number };
  grade: CourseGrade | null;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  type: string;
  completed: boolean;
  course: { name: string };
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(() => {
    Promise.all([
      fetch('/api/courses').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/assignments').then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([coursesData, assignmentsData]) => {
        if (Array.isArray(coursesData)) setCourses(coursesData);
        if (Array.isArray(assignmentsData)) setAssignments(assignmentsData);
      })
      .catch(() => {
        // silent
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCourses();
    const i = setInterval(fetchCourses, 5000);
    return () => clearInterval(i);
  }, [fetchCourses]);

  const deadlines = assignments
    .filter((a) => !a.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 8)
    .map((a) => ({
      id: a.id,
      title: a.title,
      course: a.course.name,
      dueDate: a.dueDate,
      type: a.type as 'assignment' | 'exam' | 'project' | 'quiz',
    }));

  return (
    <div className="flex min-h-screen glass-backdrop">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 sm:mb-8 pt-12 lg:pt-0 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
                Dashboard
              </h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {loading
                  ? 'Loading...'
                  : courses.length === 0
                    ? 'Add a course to get started'
                    : `${courses.length} course${courses.length !== 1 ? 's' : ''} on your dashboard`}
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div className="mt-5 sm:mt-6 grid grid-cols-1 xl:grid-cols-4 gap-5">
            <div className="xl:col-span-3">
            {loading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[var(--muted-foreground)] mt-4 text-sm">Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-16 sm:py-20 glass rounded-[2rem] px-4">
                <div className="glass-inset w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5">
                  <BookOpen className="text-[var(--accent)]" size={34} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  No courses yet
                </h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Set up your studies or add a course using the buttons above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="glass-flat glass-hover glass-sheen rounded-[1.75rem] overflow-hidden cursor-pointer block"
                  >
                    <div className="relative h-32 sm:h-36 overflow-hidden">
                      <Image
                        src={getCourseImage(course.code)}
                        alt={course.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-2 left-2">
                        {course.code && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-md text-xs font-mono font-medium text-white">
                            <Hash size={10} />
                            {course.code}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-base font-bold text-[var(--foreground)] mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                        {course.name}
                      </h3>

                      {course.term && (
                        <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mb-1">
                          <Calendar size={10} /> {course.term}
                        </p>
                      )}

                      {course.notes && (
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-1.5 flex items-start gap-1">
                          <StickyNote size={10} className="mt-0.5 shrink-0" /> {course.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-2.5 glass-divider">
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {course._count?.assignments || 0} assignment{course._count?.assignments !== 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-2">
                          {course.grade && (
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-lg ${GRADE_STYLES[course.grade.letter]}`}
                              title={`Grade ${course.grade.letter} · ${course.grade.earned}/${course.grade.possible} pts · ${course.grade.percent}%`}
                            >
                              Grade {course.grade.letter}
                            </span>
                          )}
                          <div
                            className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: course.color }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            </div>
            <aside className="xl:col-span-1">
              <div className="xl:sticky xl:top-6">
                <UpcomingDeadlines deadlines={deadlines} />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
