import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = { title: 'Privacy Policy — StudyFlow' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen glass-backdrop p-6 sm:p-10">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="glass-btn inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-8 px-4 py-2 rounded-full"
        >
          <ArrowLeft size={16} /> Back to StudyFlow
        </Link>

        <article className="glass-strong glass-in rounded-[2rem] p-7 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="glass-inset w-12 h-12 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={22} className="text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Privacy Policy
              </h1>
              <p className="text-sm text-[var(--muted-foreground)]">Last updated: October 2026</p>
            </div>
          </div>

          <div className="space-y-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-1.5">What we collect</h2>
              <p>
                Your name, email, optional profile details, and the academic content you enter —
                courses, assignments, to-dos, and messages. Authentication providers may share your
                name, email, and avatar when you sign in with them.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-1.5">How we use it</h2>
              <p>
                Solely to run StudyFlow: showing your schedule, tracking grades, delivering messages,
                and keeping your account secure. We do not sell your data.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-1.5">Storage &amp; security</h2>
              <p>
                Data is stored in managed databases with encrypted transport. Passwords are stored
                only as salted hashes and are never readable in plain text.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-1.5">Sharing</h2>
              <p>
                Coursemates see only the content your courses are explicitly shared with. Third-party
                processors (hosting, authentication) receive the minimum needed to provide their
                service.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-1.5">Your rights</h2>
              <p>
                You can review and update your profile in Settings at any time. To request deletion of
                your account and its data, contact your study group administrator.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-1.5">Cookies</h2>
              <p>
                StudyFlow uses a single session cookie to keep you signed in. No advertising or
                cross-site tracking cookies are used.
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
