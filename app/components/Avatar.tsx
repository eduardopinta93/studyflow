'use client';

type AvatarProps = {
  src?: string | null;
  name?: string | null;
  size?: number;
  ring?: boolean;
  className?: string;
};

function initialsOf(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export default function Avatar({ src, name, size = 40, ring = false, className = '' }: AvatarProps) {
  return (
    <div
      className={`relative shrink-0 rounded-full overflow-hidden flex items-center justify-center shadow-md ${
        ring ? 'ring-2 ring-[var(--accent)]/60 ring-offset-2 ring-offset-[var(--background)]' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatars are data-URLs or arbitrary external sources
        <img src={src} alt={name ? `${name}'s avatar` : 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-bold text-white select-none"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #8B5CF6 100%)',
            fontSize: Math.max(10, Math.round(size * 0.36)),
          }}
        >
          {initialsOf(name)}
        </span>
      )}
    </div>
  );
}
