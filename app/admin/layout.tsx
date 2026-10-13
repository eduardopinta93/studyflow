import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import AdminTabs from './AdminTabs';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect('/auth/login?callbackUrl=/admin');
  if (session.user.role !== 'ADMIN') redirect('/');

  return (
    <div className="flex min-h-screen glass-backdrop">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 pt-12 lg:pt-0 flex items-start justify-between gap-4">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Admin console
              </h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Platform health, accounts and content moderation
              </p>
            </div>
            <ThemeToggle />
          </div>

          <AdminTabs />

          <div className="mt-5 sm:mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
