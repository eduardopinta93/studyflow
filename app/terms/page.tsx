import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';

export const metadata = { title: 'Terms of Service — StudyFlow' };

export default function TermsPage() {
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
              <Scale size={22} className="text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Terms of Service
              </h1>
              <p className="text-sm text-[var(--muted-foreground)]">Last updated: October 2026</p>
            </div>
          </div>

          <div className="space-y-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-1.5">1. Acceptance of terms</h2>
              <p>
                By creating an account or using StudyFlow you agree to these terms. If you do not agree,
                please do not use the service.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-1.5">2. Your account</h2>
              <p>
                You are responsible for keeping your credentials secure and for all activity under your
                account. Provide accurate information and notify us of any unauthorized use.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-1.5">3. Acceptable use</h2>
              <p>
                StudyFlow is a study-planning tool for coursework. Do not use it to store or share
                unlawful content, to harass others, or to interfere with the service.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-1.5">4. Your content</h2>
              <p>
                Courses, assignments, notes, and messages you create remain yours. You grant StudyFlow
                the limited licence needed to store and display them as part of the service.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-1.5">5. Availability</h2>
              <p>
                The service is provided &quot;as is&quot; without warranties. We may modify or discontinue
                features, and we are not liable for indirect or consequential damages to the extent
                permitted by law.
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-[var(--foreground)] mb-1.5">6. Contact</h2>
              <p>Questions about these terms can be raised through your study group administrator.</p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
