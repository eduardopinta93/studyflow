'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Sun, Moon, Monitor, Bell, BellOff, Trash2, Download, User } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

const themeOptions = [
  {
    value: 'light' as Theme,
    icon: Sun,
    label: 'Light',
    desc: 'Bright and clean',
    preview: { bg: '#F8FAFC', card: '#FFFFFF', text: '#0F172A', accent: '#4F46E5' },
  },
  {
    value: 'dark' as Theme,
    icon: Moon,
    label: 'Dark',
    desc: 'Easy on the eyes',
    preview: { bg: '#0F172A', card: '#1E293B', text: '#F8FAFC', accent: '#818CF8' },
  },
  {
    value: 'system' as Theme,
    icon: Monitor,
    label: 'System',
    desc: 'Matches your device',
    preview: { bg: '#334155', card: '#475569', text: '#F8FAFC', accent: '#818CF8' },
  },
];

export default function SettingsPage() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('sf-theme') as Theme) || 'dark';
    const savedNotif = localStorage.getItem('sf-notifications');
    const savedDigest = localStorage.getItem('sf-email-digest');
    setTheme(savedTheme);
    if (savedNotif !== null) setNotifications(savedNotif === 'true');
    if (savedDigest !== null) setEmailDigest(savedDigest === 'true');
  }, []);

  const applyTheme = (t: Theme) => {
    setTheme(t);
    localStorage.setItem('sf-theme', t);
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (t === 'system') {
      root.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } else {
      root.classList.add(t);
    }
  };

  const cycleTheme = () => {
    const order: Theme[] = ['dark', 'light', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    applyTheme(next);
    triggerSave();
  };

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem('sf-notifications', String(next));
  };

  const toggleEmailDigest = () => {
    const next = !emailDigest;
    setEmailDigest(next);
    localStorage.setItem('sf-email-digest', String(next));
  };

  const handleClearData = () => {
    localStorage.clear();
    setNotifications(true);
    setEmailDigest(false);
    applyTheme('dark');
    setShowClearConfirm(false);
    triggerSave();
  };

  const handleExportData = async () => {
    try {
      const [coursesRes, assignmentsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/assignments'),
      ]);
      const courses = coursesRes.ok ? await coursesRes.json() : [];
      const assignments = assignmentsRes.ok ? await assignmentsRes.json() : [];
      const data = JSON.stringify({ courses, assignments, exportedAt: new Date().toISOString() }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `studyflow-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      console.error('Export failed');
    }
  };

  const triggerSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentTheme = themeOptions.find((t) => t.value === theme) || themeOptions[1];

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto pt-12 lg:pt-0">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-heading)' }}>Settings</h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Customize your experience</p>
            </div>
            <button
              onClick={cycleTheme}
              className="p-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:bg-[var(--muted)] transition-colors"
              title={`Current: ${currentTheme.label}. Click to cycle.`}
            >
              <currentTheme.icon size={18} className="text-[var(--foreground)]" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Profile */}
            <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Profile</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center shrink-0">
                  <User className="text-[var(--accent)]" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--foreground)]">Student</p>
                  <p className="text-sm text-[var(--muted-foreground)] truncate">demo@studyflow.app</p>
                </div>
              </div>
            </section>

            {/* Appearance */}
            <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Appearance</h2>

              {/* Theme cards */}
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((t) => {
                  const active = theme === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => { applyTheme(t.value); triggerSave(); }}
                      className={`relative rounded-xl overflow-hidden transition-all ${
                        active ? 'ring-2 ring-[var(--accent)] shadow-md' : 'hover:shadow-md'
                      }`}
                    >
                      {/* Mini preview */}
                      <div className="h-20 sm:h-24 flex flex-col" style={{ backgroundColor: t.preview.bg }}>
                        <div className="flex-1 p-2">
                          <div className="h-2 rounded-sm mb-1.5" style={{ backgroundColor: t.preview.accent, width: '40%' }} />
                          <div className="h-1.5 rounded-sm mb-1" style={{ backgroundColor: t.preview.text, opacity: 0.15, width: '80%' }} />
                          <div className="h-1.5 rounded-sm" style={{ backgroundColor: t.preview.text, opacity: 0.1, width: '60%' }} />
                        </div>
                        <div className="mx-2 mb-2 h-6 rounded-md flex items-center px-2" style={{ backgroundColor: t.preview.card }}>
                          <div className="h-1 rounded-sm" style={{ backgroundColor: t.preview.accent, width: '30%' }} />
                        </div>
                      </div>

                      {/* Label */}
                      <div className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium ${
                        active ? 'bg-[var(--accent)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                      }`}>
                        <t.icon size={12} />
                        {t.label}
                      </div>

                      {active && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-[var(--accent)] rounded-full ring-2 ring-white dark:ring-[var(--card)]" />
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-[var(--muted-foreground)] mt-3 text-center">
                {currentTheme.desc}
              </p>
            </section>

            {/* Notifications */}
            <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {notifications ? <Bell size={18} className="text-[var(--accent)]" /> : <BellOff size={18} className="text-[var(--muted-foreground)]" />}
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">Push notifications</p>
                      <p className="text-xs text-[var(--muted-foreground)]">Deadline reminders</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { toggleNotifications(); triggerSave(); }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${notifications ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">Weekly email digest</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Summary of your upcoming week</p>
                  </div>
                  <button
                    onClick={() => { toggleEmailDigest(); triggerSave(); }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${emailDigest ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailDigest ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
            </section>

            {/* Data */}
            <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Data</h2>
              <div className="space-y-3">
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--muted)] rounded-xl text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
                >
                  <Download size={16} />
                  Export all data as JSON
                </button>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950/20 rounded-xl text-sm font-medium text-[var(--destructive)] hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 size={16} />
                  Clear all local data
                </button>
              </div>
            </section>

            {saved && (
              <div className="text-center text-sm text-[var(--success)] font-medium">
                Settings saved
              </div>
            )}
          </div>
        </div>
      </main>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Clear all data?</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-5">
              This will reset all your settings to defaults. Course and assignment data in the database will not be affected.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">
                Cancel
              </button>
              <button onClick={handleClearData} className="flex-1 py-2.5 bg-[var(--destructive)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all">
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
