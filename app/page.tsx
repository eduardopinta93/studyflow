'use client';

import Sidebar from './components/Sidebar';
import QuickActions from './components/dashboard/QuickActions';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Hash, StickyNote } from 'lucide-react';
import { getCourseImage } from '@/lib/course-image';
import { GRADE_STYLES, type CourseGrade } from '@/lib/grade';

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

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) setCourses(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
    const i = setInterval(fetchCourses, 5000);
    return () => clearInterval(i);
  }, [fetchCourses]);

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 sm:mb-8 pt-12 lg:pt-0">
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

          <QuickActions />

          <div className="mt-5 sm:mt-6">
            {loading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[var(--muted-foreground)] mt-4 text-sm">Loading courses...</p>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4">
                <BookOpen className="mx-auto text-[var(--muted-foreground)] mb-4" size={40} />
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
                    href={`/assignments?courseId=${course.id}`}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    <div className="relative h-32 sm:h-36 overflow-hidden">
                      <img
                        src={getCourseImage(course.code)}
                        alt={course.name}
                        className="w-full h-full object-cover"
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

                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[var(--border)]">
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
        </div>
      </main>
    </div>
  );
}
