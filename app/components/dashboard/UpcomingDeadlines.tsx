'use client';

interface Deadline {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  type: 'assignment' | 'exam' | 'project' | 'quiz';
}

const typeStyles: Record<string, { label: string; dot: string }> = {
  assignment: { label: 'Task', dot: 'bg-blue-500' },
  exam: { label: 'Exam', dot: 'bg-red-500' },
  project: { label: 'Project', dot: 'bg-purple-500' },
  quiz: { label: 'Quiz', dot: 'bg-amber-500' },
};

function daysLeft(date: string) {
  const d = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  if (d < 0) return { text: `${Math.abs(d)}d overdue`, urgent: true };
  if (d === 0) return { text: 'Due today', urgent: true };
  if (d === 1) return { text: 'Due tomorrow', urgent: true };
  if (d <= 3) return { text: `${d} days left`, urgent: true };
  return { text: `${d} days left`, urgent: false };
}

export default function UpcomingDeadlines({ deadlines = [] }: { deadlines?: Deadline[] }) {
  const sorted = [...deadlines].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 h-full flex flex-col">
      <h2 className="text-lg font-bold text-[var(--foreground)] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
        Coming Up
      </h2>

      <div className="space-y-2 flex-1 overflow-y-auto pr-1 scrollbar-thin">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">Nothing due soon. Nice work.</p>
          </div>
        ) : (
          sorted.map((d) => {
            const info = daysLeft(d.dueDate);
            const style = typeStyles[d.type] || typeStyles.assignment;
            return (
              <div
                key={d.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--muted)] transition-colors"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{d.title}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{d.course}</p>
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${info.urgent ? 'text-[var(--destructive)]' : 'text-[var(--muted-foreground)]'}`}>
                  {info.text}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
