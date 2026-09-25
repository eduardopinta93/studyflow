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
    <p className="mx-auto max-w-md text-lg leading-relaxed text-white/75" style={rise(delay)}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-semibold text-[#C7D2FE]">
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
    <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden p-12">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/auth-hero.jpg)' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(160deg, rgba(10,12,26,0.88) 0%, rgba(10,12,26,0.5) 50%, rgba(10,12,26,0.9) 100%)',
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0" style={{ backgroundColor: 'var(--accent)', opacity: 0.16 }} aria-hidden="true" />

      <div className="relative text-center text-white max-w-lg">
        <div
          className="relative mx-auto mb-7 w-[210px]"
          style={{ animation: 'hero-float 5s ease-in-out infinite' }}
        >
          <div className="absolute -inset-3 rounded-[2.5rem] bg-[#818CF8]/40 blur-2xl" aria-hidden="true" />
          <div
            className="relative overflow-hidden rounded-3xl border border-white/25 shadow-2xl ring-1 ring-white/10"
            style={rise(0.05)}
          >
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

        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/55"
          style={rise(0.15)}
        >
          Welcome to
        </p>

        <h1
          className="mb-5 bg-gradient-to-b from-white via-white to-[#C7D2FE] bg-clip-text text-5xl font-bold tracking-tight text-transparent drop-shadow-sm"
          style={{ fontFamily: 'var(--font-heading)', ...rise(0.25) }}
        >
          StudyFlow
        </h1>

        <Tagline text={tagline} delay={0.35} />

        <ul className="mx-auto mt-9 w-fit space-y-3 text-left">
          {HIGHLIGHTS.map(({ icon: Icon, text }, idx) => (
            <li
              key={text}
              className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-sm"
              style={rise(0.5 + idx * 0.1)}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <Icon size={14} className="text-white" />
              </span>
              <span className="text-sm font-medium text-white/90">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
