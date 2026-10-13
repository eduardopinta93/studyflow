import { BookOpen, CalendarCheck, GraduationCap } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: CalendarCheck, text: 'Assignments & to-dos in one place' },
  { icon: GraduationCap, text: 'Courses planned around your credits' },
  { icon: BookOpen, text: 'Lesson content and letter grades' },
];

const KEYWORD_RE = /(courses|assignments|academic life)/gi;

const rise = (delay: number) => ({
  animation: `hero-rise .7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
});

function Tagline({ text, delay }: { text: string; delay: number }) {
  const parts = text.split(KEYWORD_RE);
  return (
    <p className="mx-auto max-w-md text-lg leading-relaxed text-white/90" style={rise(delay)}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-semibold text-[#9BD4FF]">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

export default function AuthHero({ tagline }: { tagline: string }) {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden p-12 auth-hero">
      <div className="relative text-center text-white max-w-lg">
        <div
          className="relative mx-auto mb-7 w-[210px]"
          style={{ animation: 'hero-float 5s ease-in-out infinite' }}
        >
          <div
            className="relative overflow-hidden rounded-[2rem] p-1.5 bg-black/35 border border-white/20"
            style={rise(0.05)}
          >
            <div className="overflow-hidden rounded-[1.5rem]">
              <video
                src="/videos/puppy-reading.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="block h-[170px] w-full object-cover"
                aria-label="Animated puppy reading a book"
              />
            </div>
          </div>
        </div>

        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/85"
          style={rise(0.15)}
        >
          Welcome to
        </p>

        <h1
          className="mb-5 text-5xl font-bold tracking-tight text-white"
          style={{ fontFamily: 'var(--font-heading)', ...rise(0.25) }}
        >
          StudyFlow
        </h1>

        <Tagline text={tagline} delay={0.35} />

        <ul
          className="feature-stage relative mx-auto mt-9 h-[50px] w-[330px] max-w-full"
          style={rise(0.5)}
        >
          {HIGHLIGHTS.map(({ icon: Icon, text }, idx) => (
            <li
              key={text}
              className="feature-run absolute inset-x-0 mx-auto flex w-fit items-center gap-3 rounded-2xl px-4 py-2.5 bg-black/45 border border-white/20"
              style={{
                animation: 'feature-run 9s ease-in-out infinite both',
                animationDelay: `${0.6 + idx * 3}s`,
              }}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/25">
                <Icon size={14} className="text-white" />
              </span>
              <span className="text-sm font-medium text-white">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
