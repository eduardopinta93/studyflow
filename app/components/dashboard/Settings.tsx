'use client';

import { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

interface SettingsProps {
  onClose?: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  const applyTheme = (t: 'light' | 'dark' | 'system') => {
    setTheme(t);
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else if (t === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
      <h2 className="text-lg font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Settings</h2>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-3 block">Theme</label>
          <div className="flex gap-3">
            {[
              { value: 'light', icon: Sun, label: 'Light' },
              { value: 'dark', icon: Moon, label: 'Dark' },
              { value: 'system', icon: Monitor, label: 'System' },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => applyTheme(t.value as 'light' | 'dark' | 'system')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${theme === t.value ? 'bg-[var(--accent)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80'}`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Push Notifications</p>
              <p className="text-xs text-[var(--muted-foreground)]">Get reminders for deadlines</p>
            </div>
            <button onClick={() => setNotifications(!notifications)} className={`w-12 h-6 rounded-full transition-all ${notifications ? 'bg-[var(--accent)]' : 'bg-[var(--muted)]'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Weekly Email Digest</p>
              <p className="text-xs text-[var(--muted-foreground)]">Summary of your week</p>
            </div>
            <button onClick={() => setEmailDigest(!emailDigest)} className={`w-12 h-6 rounded-full transition-all ${emailDigest ? 'bg-[var(--accent)]' : 'bg-[var(--muted)]'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${emailDigest ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="w-full py-2.5 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 transition-all text-sm">
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}
