'use client';

import Sidebar from './components/Sidebar';
import TodoList from './components/dashboard/TodoList';
import UpcomingDeadlines from './components/dashboard/UpcomingDeadlines';
import StudyStats from './components/dashboard/StudyStats';
import QuickActions from './components/dashboard/QuickActions';
import { useState, useEffect, useCallback } from 'react';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  type: string;
  course: { name: string };
}

interface Course {
  id: string;
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [c, a] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/assignments'),
      ]);
      if (c.ok) setCourses(await c.json());
      if (a.ok) setAssignments(await a.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 5000);
    return () => clearInterval(i);
  }, [fetchData]);

  const done = assignments.filter((a) => a.completed).length;
  const pending = assignments.filter((a) => !a.completed);
  const overdue = pending.filter((a) => new Date(a.dueDate).getTime() < Date.now());

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 pt-12 lg:pt-0">
            <h1 className="text-3xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
              Dashboard
            </h1>
            <p className="text-[var(--muted-foreground)] mt-1">
              {loading
                ? 'Loading...'
                : assignments.length === 0
                  ? 'Add a course to get started'
                  : pending.length === 0
                    ? 'All caught up. Great work!'
                    : `${pending.length} assignment${pending.length !== 1 ? 's' : ''} on your plate${overdue.length > 0 ? `, ${overdue.length} overdue` : ''}`}
            </p>
          </div>

          <StudyStats
            stats={{
              totalCourses: courses.length,
              totalAssignments: assignments.length,
              completedAssignments: done,
              pendingAssignments: pending.length,
              overdueCount: overdue.length,
            }}
          />

          <div className="mt-6">
            <QuickActions />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <TodoList />
            <UpcomingDeadlines
              deadlines={pending.map((a) => ({
                id: a.id,
                title: a.title,
                course: a.course.name,
                dueDate: a.dueDate,
                type: a.type as 'assignment' | 'exam' | 'project' | 'quiz',
              }))}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
