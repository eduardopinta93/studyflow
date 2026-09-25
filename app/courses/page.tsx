'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  X,
  BookOpen,
  Edit2,
  Trash2,
  Save,
  Hash,
  Calendar,
  StickyNote,
  Palette,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import CoursePickerModal from '../components/CoursePickerModal';
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

const COLOR_PRESETS = [
  '#4F46E5',
  '#0EA5E9',
  '#16A34A',
  '#F59E0B',
  '#DC2626',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
  '#F97316',
];

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'code' | 'createdAt'>('createdAt');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    term: '',
    notes: '',
    color: '#4F46E5',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch {
      console.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const resetForm = () => {
    setFormData({ name: '', code: '', term: '', notes: '', color: '#4F46E5' });
    setEditingCourse(null);
    setError('');
  };

  const openAddModal = () => {
    setShowPicker(true);
  };

  const openEditModal = (course: Course) => {
    setFormData({
      name: course.name,
      code: course.code || '',
      term: course.term || '',
      notes: course.notes || '',
      color: course.color,
    });
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setSaving(true);
    setError('');

    if (!formData.name.trim()) {
      setError('Course name is required');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
        setSaving(false);
        return;
      }

      await fetchCourses();
      setShowModal(false);
      resetForm();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCourses(courses.filter((c) => c.id !== id));
      }
    } catch {
      console.error('Failed to delete course');
    }
    setDeletingId(null);
  };

  const filtered = courses
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.term?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'code') return (a.code || '').localeCompare(b.code || '');
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8 pt-12 lg:pt-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>My Courses</h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {courses.length} course{courses.length !== 1 ? 's' : ''} enrolled
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all shadow-sm w-full sm:w-auto justify-center"
            >
              <Plus size={16} /> Add Course
            </button>
          </div>

          {courses.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-[var(--muted-foreground)]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="flex-1 sm:flex-none px-3 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                >
                  <option value="createdAt">Newest</option>
                  <option value="name">Name</option>
                  <option value="code">Code</option>
                </select>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[var(--muted-foreground)] mt-4 text-sm">Loading courses...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 sm:py-20 bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4">
              <BookOpen className="mx-auto text-[var(--muted-foreground)] mb-4" size={40} />
              <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {search ? 'No courses found' : 'No courses yet'}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">
                {search ? 'Try a different search term' : 'Add your first course to get started'}
              </p>
              {!search && (
                <button
                  onClick={openAddModal}
                  className="px-5 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all"
                >
                  Add Course
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((course) => (
                <div
                  key={course.id}
                  onClick={() => router.push(`/assignments?courseId=${course.id}`)}
                  className="bg-[var(--card)] border border-[var(--border)] rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  {/* Course image */}
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
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(course); }}
                        className="p-1.5 bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-lg text-white transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingId(course.id); }}
                        className="p-1.5 bg-black/40 backdrop-blur-sm hover:bg-red-500/80 rounded-lg text-white transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
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
              <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>
                Edit Course
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="p-2 hover:bg-[var(--muted)] rounded-xl text-[var(--muted-foreground)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Course Name <span className="text-[var(--destructive)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="e.g. Introduction to Computer Science"
                  autoFocus
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Course Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors font-mono"
                    placeholder="CS101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Term</label>
                  <input
                    type="text"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                    placeholder="Fall 2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  placeholder="Room number, instructor, schedule..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  <span className="flex items-center gap-1.5"><Palette size={14} /> Course Color</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-8 h-8 rounded-xl transition-all duration-200 ${
                        formData.color === c
                          ? 'ring-2 ring-offset-2 ring-[var(--foreground)] scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
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
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--accent-hover)] transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CoursePickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onAdded={fetchCourses}
      />

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Delete Course?
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-5">
              This will permanently delete this course and all its assignments. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deletingId)}
                className="flex-1 py-2.5 bg-[var(--destructive)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
