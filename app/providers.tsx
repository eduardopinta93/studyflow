'use client';

import { useLayoutEffect } from 'react';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  // The inline bootstrap script in the root layout applies the saved theme before
  // paint. React's Strict Mode remount in development resets <html> to only the
  // attributes it manages from JSX, clearing the class the script set — re-apply
  // it here (before paint) so the theme survives hydration. No-op in production.
  useLayoutEffect(() => {
    try {
      const root = document.documentElement;
      const saved = (localStorage.getItem('sf-theme') as 'light' | 'dark' | 'system') || 'light';
      root.classList.remove('light', 'dark');
      if (saved === 'system') {
        root.classList.add(
          window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        );
      } else {
        root.classList.add(saved);
      }
    } catch {
      // localStorage unavailable — keep the server-rendered default
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
