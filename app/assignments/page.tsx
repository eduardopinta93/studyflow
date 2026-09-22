'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Edit2, Trash2, CheckCircle, Clock, AlertCircle, ClipboardList } from 'lucide-react';
import Sidebar from '../components/Sidebar';

interface Course {
  id: string;
  name: string;
  code: string | null;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
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
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
    setFormData({ title: '', description: '', courseId: '', dueDate: '', type: 'assignment', priority: 'medium' });
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
        body: JSON.stringify(formData),
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
    if (filter === 'completed') return a.completed;
    if (filter === 'pending') return !a.completed;
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pt-12 lg:pt-0">
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>Assignments</h1>
              <p className="text-[var(--muted-foreground)] mt-1">{assignments.length} total, {assignments.filter(a => !a.completed).length} pending</p>
            </div>
            <button onClick={openAddModal} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm">
              <Plus size={18} /> New Assignment
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
              <ClipboardList className="mx-auto text-[var(--muted-foreground)] mb-4" size={48} />
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>No assignments</h3>
              <p className="text-[var(--muted-foreground)] mb-6">{filter !== 'all' ? 'No assignments in this filter' : 'Add your first assignment'}</p>
              {filter === 'all' && courses.length > 0 && (
                <button onClick={openAddModal} className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl font-medium hover:bg-[var(--accent-hover)] transition-all">Add Assignment</button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl hover:shadow-md transition-all group">
                  <button onClick={() => toggleComplete(a)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${a.completed ? 'bg-[var(--success)] border-[var(--success)]' : 'border-[var(--border)] hover:border-[var(--accent)]'}`}>
                    {a.completed && <CheckCircle size={14} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-[var(--foreground)] ${a.completed ? 'line-through text-[var(--muted-foreground)]' : ''}`}>{a.title}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">{a.course.name}{a.course.code ? ` (${a.course.code})` : ''}</p>
                  </div>
                  <span className={`hidden sm:inline px-3 py-1 rounded-lg text-xs font-medium ${typeColors[a.type] || typeColors.assignment}`}>{a.type}</span>
                  <span className={`hidden sm:inline text-sm font-medium ${priorityColors[a.priority] || priorityColors.medium}`}>{a.priority}</span>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-[var(--foreground)]">{new Date(a.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEditModal(a)} className="p-2 hover:bg-[var(--muted)] rounded-lg text-[var(--muted-foreground)]"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(a.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 text-[var(--destructive)] rounded-lg"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>{editingAssignment ? 'Edit Assignment' : 'New Assignment'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-[var(--muted)] rounded-xl"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title <span className="text-[var(--destructive)]">*</span></label>
                <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" placeholder="Assignment title" autoFocus required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Course <span className="text-[var(--destructive)]">*</span></label>
                <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" required>
                  <option value="">Select a course</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.name}{c.code ? ` (${c.code})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors resize-none" placeholder="Optional description" rows={2} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Due Date <span className="text-[var(--destructive)]">*</span></label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors">
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              {error && <div className="px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-[var(--destructive)] text-sm">{error}</div>}
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
    </div>
  );
}
