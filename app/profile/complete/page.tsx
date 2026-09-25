'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, BookOpen, Target } from 'lucide-react';
import ProfilePhotoField from '../../components/ProfilePhotoField';

export default function CompleteProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    major: '',
    year: '',
    studyGoal: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const majors = [
    'Computer Science', 'Software Engineering', 'Data Science', 'Information Technology',
    'Business Administration', 'Economics', 'Accounting', 'Finance',
    'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
    'Medicine', 'Nursing', 'Psychology', 'Biology', 'Chemistry',
    'Mathematics', 'Physics', 'Education', 'Law', 'Graphic Design', 'Other'
  ];

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate', 'Post-Graduate'];
  const goals = ['Stay organized', 'Improve grades', 'Manage time better', 'Prepare for exams', 'Balance study & life'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.error ?? 'Could not save your profile.');
      setLoading(false);
      return;
    }
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="text-[var(--accent)]" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Complete Your Profile</h1>
          <p className="text-[var(--muted-foreground)]">Help us personalize your StudyFlow experience</p>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <BookOpen size={16} className="text-[var(--accent)]" />
                What&apos;s your major?
              </label>
              <select value={formData.major} onChange={(e) => setFormData({ ...formData, major: e.target.value })} className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none">
                <option value="">Select your major</option>
                {majors.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <GraduationCap size={16} className="text-[var(--accent)]" />
                Year of study
              </label>
              <div className="grid grid-cols-4 gap-2">
                {years.map((y) => (
                  <button key={y} type="button" onClick={() => setFormData({ ...formData, year: y })} className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${formData.year === y ? 'bg-[var(--accent)] text-white' : 'bg-[var(--background)] border-2 border-[var(--border)] hover:border-[var(--accent)]/50'}`}>
                    {y}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <Target size={16} className="text-[var(--accent)]" />
                Study goal
              </label>
              <div className="space-y-2">
                {goals.map((g) => (
                  <button key={g} type="button" onClick={() => setFormData({ ...formData, studyGoal: g })} className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 ${formData.studyGoal === g ? 'bg-[var(--accent)] text-white' : 'bg-[var(--background)] border-2 border-[var(--border)] hover:border-[var(--accent)]/50'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Profile photo (optional)</label>
              <ProfilePhotoField value={formData.avatarUrl} onChange={(avatarUrl) => setFormData({ ...formData, avatarUrl })} disabled={loading} />
            </div>

            {error && <p className="text-sm text-[var(--destructive)]" role="alert">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50">
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>

            <button type="button" onClick={() => router.push('/onboarding')} className="w-full py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium transition-colors text-sm">
              Skip for now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
