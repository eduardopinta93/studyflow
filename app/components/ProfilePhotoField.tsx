'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Trash2, User } from 'lucide-react';

type ProfilePhotoFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ProfilePhotoField({ value, onChange, disabled = false }: ProfilePhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Choose a JPG, PNG, WebP, or GIF image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Choose an image smaller than 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setError('');
        onChange(reader.result);
      }
    };
    reader.onerror = () => setError('Could not read that image.');
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
        {value ? (
          <img src={value} alt="Profile preview" className="w-full h-full object-cover" />
        ) : (
          <User className="text-[var(--accent)]" size={26} />
        )}
      </div>
      <div className="min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] transition-colors disabled:opacity-50"
          >
            <ImagePlus size={16} />
            {value ? 'Change photo' : 'Add photo'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => { setError(''); onChange(''); }}
              disabled={disabled}
              aria-label="Remove profile photo"
              title="Remove profile photo"
              className="p-2 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--muted-foreground)]">JPG, PNG, WebP, or GIF up to 2 MB</p>
        {error && <p className="text-xs text-[var(--destructive)]">{error}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} className="hidden" />
    </div>
  );
}
