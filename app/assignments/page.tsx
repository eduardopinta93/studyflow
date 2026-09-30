'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, X, Edit2, Trash2, ClipboardList, ArrowLeft, BookOpen, Check } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Link from 'next/link';

interface Course {
  id: string;
  name: string;
  code: string | null;
}

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
  course: Course;
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

export default function AssignmentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <AssignmentsContent />
    </Suspense>
  );
}

function AssignmentsContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    points: 10,
    courseId: '',
    dueDate: '',
    type: 'assignment',
    priority: 'medium',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [assignmentsRes, coursesRes] = await Promise.all([
        fetch('/api/assignments'),
        fetch('/api/courses'),
      ]);
      if (assignmentsRes.ok) setAssignments(await assignmentsRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
    } catch {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormData({ title: '', description: '', content: '', points: 10, courseId: courseId || '', dueDate: '', type: 'assignment', priority: 'medium' });
    setEditingAssignment(null);
    setError('');
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (a: Assignment) => {
    setFormData({
      title: a.title,
      description: a.description || '',
      content: a.content || '',
      points: a.points ?? 10,
      courseId: a.courseId,
      dueDate: new Date(a.dueDate).toISOString().split('T')[0],
      type: a.type,
      priority: a.priority,
    });
    setEditingAssignment(a);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!formData.title.trim()) { setError('Title is required'); setSaving(false); return; }
    if (!formData.courseId) { setError('Please select a course'); setSaving(false); return; }
    if (!formData.dueDate) { setError('Due date is required'); setSaving(false); return; }

    try {
      const url = editingAssignment ? `/api/assignments/${editingAssignment.id}` : '/api/assignments';
      const method = editingAssignment ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, points: Number(formData.points) || 10 }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
        setSaving(false);
        return;
      }
      await fetchData();
      setShowModal(false);
      resetForm();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async (a: Assignment) => {
    try {
      const res = await fetch(`/api/assignments/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !a.completed }),
      });
      if (res.ok) await fetchData();
    } catch {
      console.error('Failed to toggle');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      if (res.ok) setAssignments(assignments.filter((a) => a.id !== id));
    } catch {
      console.error('Failed to delete');
    }
  };

  const filtered = assignments.filter((a) => {
    if (courseId && a.courseId !== courseId) return false;
    if (filter === 'completed') return a.completed;
    if (filter === 'pending') return !a.completed;
    return true;
  });

  const activeCourse = courseId ? courses.find((c) => c.id === courseId) : null;

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8 pt-12 lg:pt-0">
            <div>
              {activeCourse && (
                <Link href="/courses" className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-2 transition-colors">
                  <ArrowLeft size={12} /> All Courses
                </Link>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
                {activeCourse ? activeCourse.name : 'Assignments'}
              </h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">{filtered.length} assignment{filtered.length !== 1 ? 's' : ''}{activeCourse ? '' : `, ${assignments.filter(a => !a.completed).length} pending`}</p>
            </div>
            <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm w-full sm:w-auto justify-center">
              <Plus size={16} /> New Assignment
            </button>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filter === f ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4">
              <ClipboardList className="mx-auto text-[var(--muted-foreground)] mb-4" size={40} />
              <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>No assignments</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">{filter !== 'all' ? 'No assignments in this filter' : 'Add your first assignment'}</p>
              {filter === 'all' && courses.length > 0 && (
                <button onClick={openAddModal} className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all">Add Assignment</button>
              )}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filtered.map((a) => (
                <div key={a.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl sm:rounded-2xl hover:shadow-md transition-all">
                  <button
                    onClick={() => toggleComplete(a)}
                    title={a.completed ? 'Mark as not done' : `Mark done and earn ${a.points} points`}
                    className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all ${
                      a.completed
                        ? 'bg-[var(--success)] border-[var(--success)] text-white'
                        : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--success)] hover:text-[var(--success)]'
                    }`}
                  >
                    {a.completed ? <Check size={12} /> : null}
                    {a.completed ? 'Done' : 'Mark done'}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-[var(--foreground)] ${a.completed ? 'line-through text-[var(--muted-foreground)]' : ''}`}>{a.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">{a.course.name}{a.course.code ? ` (${a.course.code})` : ''}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0 ${
                      a.completed
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                    }`}
                    title={a.completed ? `+${a.points} points earned` : `${a.points} points on completion`}
                  >
                    {a.completed ? `+${a.points}` : `${a.points} pts`}
                  </span>
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${typeColors[a.type] || typeColors.assignment}`}>{a.type}</span>
                    <span className={`text-xs font-medium ${priorityColors[a.priority] || priorityColors.medium}`}>{a.priority}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] shrink-0">{new Date(a.dueDate).toLocaleDateString()}</p>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setViewingAssignment(a)} title="Lesson content" className="p-1.5 sm:p-2 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)] transition-colors">
                      <BookOpen size={14} />
                    </button>
                    <button onClick={() => openEditModal(a)} className="p-1.5 sm:p-2 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)] transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 sm:p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--destructive)] rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{editingAssignment ? 'Edit Assignment' : 'New Assignment'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-[var(--muted)] rounded-xl"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title <span className="text-[var(--destructive)]">*</span></label>
                <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="Assignment title" autoFocus required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Course <span className="text-[var(--destructive)]">*</span></label>
                <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" required>
                  <option value="">Select a course</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.name}{c.code ? ` (${c.code})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors resize-none" placeholder="Optional description" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Lesson Content</label>
                <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors resize-none" placeholder="Lesson material for this assignment — concepts, steps, references" rows={4} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Due Date <span className="text-[var(--destructive)]">*</span></label>
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors">
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Points</label>
                  <input type="number" min={1} max={100} value={formData.points} onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" />
                </div>
              </div>
              {error && <div className="px-3 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-[var(--destructive)] text-sm">{error}</div>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : editingAssignment ? 'Save Changes' : 'Add Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={() => setViewingAssignment(null)}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${typeColors[viewingAssignment.type] || typeColors.assignment}`}>{viewingAssignment.type}</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)]">{viewingAssignment.points} pts</span>
                  {viewingAssignment.completed && (
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">+{viewingAssignment.points} earned</span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{viewingAssignment.title}</h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {viewingAssignment.course.name}{viewingAssignment.course.code ? ` (${viewingAssignment.course.code})` : ''} · due {new Date(viewingAssignment.dueDate).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => setViewingAssignment(null)} className="p-2 hover:bg-[var(--muted)] rounded-xl text-[var(--muted-foreground)] transition-colors shrink-0">
                <X size={18} />
              </button>
            </div>

            {viewingAssignment.description && (
              <p className="text-sm text-[var(--muted-foreground)] mb-4 pb-4 border-b border-[var(--border)]">{viewingAssignment.description}</p>
            )}

            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={15} className="text-[var(--accent)]" />
              <span className="text-sm font-semibold">Lesson</span>
            </div>
            {viewingAssignment.content ? (
              <div className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
                {viewingAssignment.content}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)] bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
                No lesson content for this assignment yet. Add one via Edit.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
