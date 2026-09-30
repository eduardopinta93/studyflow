'use client';

import Sidebar from '../components/Sidebar';
import TodoList from '../components/dashboard/TodoList';

export default function TodosPage() {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 sm:mb-8 pt-12 lg:pt-0">
            <h1
              className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              To-dos
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Your scratchpad tasks
            </p>
          </div>
          <TodoList />
        </div>
      </main>
    </div>
  );
}
