'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Plus,
  X,
  Edit2,
  Trash2,
  ClipboardList,
  Check,
  BookOpen,
} from 'lucide-react';
import { useIsAdmin } from '@/lib/use-is-admin';

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  points: number;
  dueDate: string;
  completed: boolean;
  type: string;
  priority: string;
  courseId: string;
}

const typeColors: Record<string, string> = {
  assignment: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  exam: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  project: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  quiz: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const priorityColors: Record<string, string> = {
  low: 'text-blue-500',
  medium: 'text-amber-500',
  high: 'text-red-500',
};

export default function CourseAssignmentsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const isAdmin = useIsAdmin();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [viewing, setViewing] = useState<Assignment | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    points: 10,
    dueDate: '',
    type: 'assignment',
    priority: 'medium',
  });

  const fetchAssignments = useCallback(() => {
    fetch(`/api/assignments?courseId=${courseId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data)) setAssignments(data);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const openAdd = () => {
    setEditing(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      points: 10,
      dueDate: '',
      type: 'assignment',
      priority: 'medium',
    });
    setError('');
    setShowModal(true);
  };

  const openEdit = (a: Assignment) => {
    setEditing(a);
    setFormData({
      title: a.title,
      description: a.description || '',
      content: a.content || '',
      points: a.points ?? 10,
      dueDate: new Date(a.dueDate).toISOString().split('T')[0],
      type: a.type,
      priority: a.priority,
    });
    setError('');
    setShowModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return setError('Title is required');
    if (!formData.dueDate) return setError('Due date is required');

    setSaving(true);
    setError('');
    try {
      const url = editing ? `/api/assignments/${editing.id}` : '/api/assignments';
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          courseId,
          points: Number(formData.points) || 10,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
        return;
      }
      setShowModal(false);
      fetchAssignments();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (a: Assignment) => {
    const res = await fetch(`/api/assignments/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !a.completed }),
    }).catch(() => null);
    if (res && res.ok) fetchAssignments();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' }).catch(() => null);
    if (res && res.ok) setAssignments(assignments.filter((a) => a.id !== id));
  };

  const filtered = assignments.filter((a) => {
    if (filter === 'completed') return a.completed;
    if (filter === 'pending') return !a.completed;
    return true;
  });

  const pending = assignments.filter((a) => !a.completed).length;

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2
            className="text-lg font-bold text-[var(--foreground)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Assignments
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} · {pending} pending
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm"
          >
            <Plus size={16} /> New Assignment
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {(['all', 'pending', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-[var(--accent)] text-white'
                : 'glass-flat text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass rounded-3xl px-4">
          <ClipboardList className="mx-auto text-[var(--muted-foreground)] mb-4" size={36} />
          <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            No assignments
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-5">
            {filter !== 'all' ? 'Nothing matches this filter.' : 'Add the first assignment.'}
          </p>
          {filter === 'all' && isAdmin && (
            <button
              onClick={openAdd}
              className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all"
            >
              Add Assignment
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass-flat rounded-2xl hover:shadow-md transition-all"
            >
              {isAdmin ? (
                <button
                  onClick={() => toggle(a)}
                  title={a.completed ? 'Mark as not done' : `Mark done and earn ${a.points} points`}
                  className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                    a.completed
                      ? 'bg-[var(--success)] border-[var(--success)] text-white'
                      : 'border-white/15 text-[var(--muted-foreground)] hover:border-[var(--success)] hover:text-[var(--success)]'
                  }`}
                >
                  {a.completed ? <Check size={12} /> : null}
                  {a.completed ? 'Done' : 'Mark done'}
                </button>
              ) : (
                <span
                  className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border-2 ${
                    a.completed
                      ? 'bg-[var(--success)] border-[var(--success)] text-white'
                      : 'border-white/15 text-[var(--muted-foreground)]'
                  }`}
                >
                  {a.completed ? <Check size={12} /> : null}
                  {a.completed ? 'Done' : 'Not done'}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium text-[var(--foreground)] ${
                    a.completed ? 'line-through text-[var(--muted-foreground)]' : ''
                  }`}
                >
                  {a.title}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">
                  {a.description || 'No description'}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0 ${
                  a.completed
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                }`}
              >
                {a.completed ? `+${a.points}` : `${a.points} pts`}
              </span>
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    typeColors[a.type] || typeColors.assignment
                  }`}
                >
                  {a.type}
                </span>
                <span
                  className={`text-xs font-medium ${priorityColors[a.priority] || priorityColors.medium}`}
                >
                  {a.priority}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] shrink-0">
                {new Date(a.dueDate).toLocaleDateString()}
              </p>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setViewing(a)}
                  title="Lesson content"
                  className="p-1.5 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)] transition-colors"
                >
                  <BookOpen size={14} />
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => openEdit(a)}
                      className="p-1.5 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)] transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => remove(a.id)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--destructive)] rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdmin && showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="glass-popover rounded-t-[1.75rem] sm:rounded-[1.75rem] p-5 sm:p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                {editing ? 'Edit Assignment' : 'New Assignment'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-[var(--muted)] rounded-xl"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Title <span className="text-[var(--destructive)]">*</span>
                </label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 glass-field rounded-xl text-sm"
                  placeholder="Assignment title"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 glass-field rounded-xl text-sm resize-none"
                  placeholder="Optional description"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Lesson Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2.5 glass-field rounded-xl text-sm resize-none"
                  placeholder="Lesson material for this assignment"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Due Date <span className="text-[var(--destructive)]">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2.5 glass-field rounded-xl text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2.5 glass-field rounded-xl text-sm"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2.5 glass-field rounded-xl text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Points</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 glass-field rounded-xl text-sm"
                  />
                </div>
              </div>
              {error && (
                <div className="px-3 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-[var(--destructive)] text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 glass-btn rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewing && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
          onClick={() => setViewing(null)}
        >
          <div
            className="glass-popover rounded-t-[1.75rem] sm:rounded-[1.75rem] p-5 sm:p-6 w-full sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      typeColors[viewing.type] || typeColors.assignment
                    }`}
                  >
                    {viewing.type}
                  </span>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)]">
                    {viewing.points} pts
                  </span>
                </div>
                <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {viewing.title}
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Due {new Date(viewing.dueDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setViewing(null)}
                className="p-2 hover:bg-[var(--muted)] rounded-xl text-[var(--muted-foreground)] transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>
            {viewing.description && (
              <p className="text-sm text-[var(--muted-foreground)] mb-4 pb-4 border-b border-white/10">
                {viewing.description}
              </p>
            )}
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={15} className="text-[var(--accent)]" />
              <span className="text-sm font-semibold">Lesson</span>
            </div>
            {viewing.content ? (
              <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line glass-inset rounded-xl p-4">
                {viewing.content}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)] glass-inset rounded-xl p-4">
                No lesson content yet. Add one via Edit.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
