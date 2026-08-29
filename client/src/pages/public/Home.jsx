import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const PROFESSIONS = [
  { name: 'Electricians', tag: 'ELC', img: 'https://images.pexels.com/photos/14934022/pexels-photo-14934022.jpeg', to: '/search?profession=Electrician' },
  { name: 'Plumbers', tag: 'PLM', img: 'https://images.pexels.com/photos/27354189/pexels-photo-27354189.jpeg', to: '/search?profession=Plumber' },
  { name: 'Carpenters', tag: 'CRP', img: 'https://images.pexels.com/photos/5711881/pexels-photo-5711881.jpeg', to: '/search?profession=Carpenter' },
  { name: 'AC Technicians', tag: 'ACT', img: 'https://images.pexels.com/photos/10958586/pexels-photo-10958586.jpeg', to: '/search?profession=AC Technician' },
  { name: 'Painters', tag: 'PNT', img: 'https://images.pexels.com/photos/5711881/pexels-photo-5711881.jpeg', to: '/search?profession=Painter' },
  { name: 'Masons', tag: 'MSN', img: 'https://images.pexels.com/photos/14225905/pexels-photo-14225905.jpeg', to: '/search?profession=Mason' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Search', desc: 'Find verified workers by profession and city.' },
  { step: '02', title: 'Book', desc: 'Send a request in under a minute. Worker confirms.' },
  { step: '03', title: 'Get it done', desc: 'Worker arrives, job done. Pay and review.' },
];

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </div>
  );
}

// Reusable color tokens as class fragments — keep in sync across the file
const T = {
  page: 'bg-[#EFEBE2] dark:bg-[#14120D]',
  card: 'bg-[#FAF8F3] dark:bg-[#1E1B15]',
  ink: 'text-[#16140F] dark:text-[#F3F0E8]',
  inkBorder: 'border-[#16140F] dark:border-[#F3F0E8]',
  steel: 'text-[#8B8577] dark:text-[#A39D8E]',
  hairline: 'border-[#E4E0D5] dark:border-[#2C2820]',
  amber: 'text-[#FF6A1A]',
  amberBg: 'bg-[#FF6A1A]',
  amberBorder: 'border-[#FF6A1A]',
  denim: 'text-[#2C4257] dark:text-[#8FA9BE]',
  denimBorder: 'border-[#2C4257] dark:border-[#8FA9BE]',
};

export default function Home() {
  const [heroWorker] = useState({
    name: 'Ramesh Kumar',
    profession: 'Electrician',
    city: 'Delhi',
    rate: '₹700/day',
    rating: 4.8,
    id: 'WM-04471',
    avatar: 'https://images.pexels.com/photos/34969202/pexels-photo-34969202.jpeg',
  });

  return (
    <div className={`min-h-screen ${T.page}`} style={{ fontFamily: "'Work Sans', sans-serif" }}>

      {/* ── Hero ── */}
      <section className={`min-h-[92vh] flex items-center pt-10 relative overflow-hidden ${T.page}`}>
        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            color: '#16140F',
          }}
        />

        <div className="max-w-6xl mx-auto px-4 w-full relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">

            {/* Left — text */}
            <Reveal>
              <p className={`inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full border mb-6 ${T.denim} ${T.denimBorder}`}
                 style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                <span className={`w-1.5 h-1.5 rounded-full ${T.amberBg}`} />
                Bharat's skilled workforce · Verified
              </p>

              <h1 className={`text-5xl sm:text-6xl font-semibold leading-[1.03] tracking-tight ${T.ink}`}
                  style={{ fontFamily: "'Oswald', sans-serif" }}>
                HIRE TRUSTED
                <br />
                <span className={T.amber}>HANDS.</span> BUILD
                <br />
                THE LIFE YOU
                <br />
                DESERVE.
              </h1>

              <p className={`mt-6 text-base leading-relaxed max-w-md ${T.steel}`}>
                WorkMitra connects you with verified electricians, plumbers, carpenters,
                painters and more — rated by real customers, ready to work today.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/search"
                  className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg text-white transition-transform hover:-translate-y-0.5 ${T.amberBg}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find a Worker
                </Link>
                <Link to="/register"
                  className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg border-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${T.ink} ${T.inkBorder}`}>
                  Work with us →
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3 text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                {['ID VERIFIED', '4.8 AVG RATING', '12,000+ WORKERS'].map((label) => (
                  <span key={label} className={`px-3 py-1.5 rounded border-dashed border-[1.5px] font-medium tracking-wide ${T.hairline} ${T.ink}`}>
                    {label}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Right — worker ID badge */}
            <Reveal delay={150} className="hidden lg:flex justify-center">
              <div className="relative w-[300px]">
                <div className="mx-auto w-10 h-14 -mb-3 relative z-0">
                  <div className={`absolute inset-x-0 top-0 h-8 rounded-t-full border-4 ${T.inkBorder}`} />
                  <div className="absolute inset-x-2 bottom-0 h-8 rounded-sm bg-[#16140F] dark:bg-[#F3F0E8]" />
                </div>

                <div className={`relative rounded-2xl border-2 p-5 shadow-2xl rotate-[-3deg] hover:rotate-0 transition-transform duration-500 ${T.card} ${T.inkBorder}`}>
                  <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 ${T.page} ${T.inkBorder}`} />

                  <p className={`text-[10px] tracking-[0.25em] uppercase font-semibold text-center mb-4 ${T.denim}`}
                     style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    WorkMitra · Field ID
                  </p>

                  <div className="flex justify-center">
                    <img src={heroWorker.avatar} alt={heroWorker.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-[#FF6A1A]" />
                  </div>

                  <h3 className={`text-center mt-4 text-xl font-semibold ${T.ink}`} style={{ fontFamily: "'Oswald', sans-serif" }}>
                    {heroWorker.name.toUpperCase()}
                  </h3>
                  <p className={`text-center text-sm ${T.steel}`}>{heroWorker.profession} · {heroWorker.city}</p>

                  <div className={`mt-4 flex items-center justify-between text-xs px-3 py-2 rounded-lg ${T.page} ${T.ink}`}
                       style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    <span>{heroWorker.id}</span>
                    <span className={`flex items-center gap-1 font-semibold ${T.amber}`}>★ {heroWorker.rating}</span>
                    <span>{heroWorker.rate}</span>
                  </div>

                  <div className="mt-4 flex gap-[2px] h-5 items-end justify-center">
                    {[3,1,2,4,1,3,2,1,4,2,1,3,2,4,1,2].map((h, i) => (
                      <span key={i} className="bg-[#16140F] dark:bg-[#F3F0E8]" style={{ width: 2, height: `${h * 4}px` }} />
                    ))}
                  </div>

                  <div className={`absolute -bottom-4 -right-6 w-20 h-20 rounded-full border-[3px] border-dashed flex items-center justify-center rotate-[-14deg] bg-[#2C4257]/[0.06] dark:bg-[#8FA9BE]/10 ${T.denimBorder} ${T.denim}`}>
                    <span className="text-[10px] font-bold tracking-wider text-center leading-tight" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      VERIFIED
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Popular trades ── */}
      <section className={T.card}>
        <div className="max-w-6xl mx-auto px-4 py-20">
          <Reveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className={`text-[11px] font-semibold tracking-[0.2em] uppercase mb-3 ${T.denim}`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  The toolbox
                </p>
                <h2 className={`text-4xl font-semibold leading-tight ${T.ink}`} style={{ fontFamily: "'Oswald', sans-serif" }}>
                  EVERY JOB. EVERY SKILL.
                  <br />
                  ONE PLATFORM.
                </h2>
              </div>
              <Link to="/search" className={`text-sm font-semibold hidden sm:block hover:opacity-70 transition-opacity ${T.amber}`}>
                Browse all →
              </Link>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PROFESSIONS.map((p, i) => (
              <Reveal key={p.name} delay={i * 60}>
                <Link to={p.to} className={`group relative rounded-xl overflow-hidden block border-2 hover:-translate-y-1 transition-transform duration-300 ${T.inkBorder}`}>
                  <div className="relative aspect-[3/4]">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded text-white bg-[#FF6A1A]"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      {p.tag}
                    </span>
                  </div>
                  <div className={`p-2.5 border-t-2 border-dashed ${T.hairline} ${T.card}`}>
                    <p className={`font-semibold text-sm ${T.ink}`}>{p.name}</p>
                    <p className={`text-[11px] mt-0.5 ${T.steel}`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      BOOK TODAY →
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why WorkMitra ── */}
      <section className={T.page}>
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Reveal>
              <div className={`h-full rounded-2xl p-8 border-2 border-dashed ${T.hairline} ${T.card}`}>
                <p className={`text-[11px] font-semibold tracking-[0.2em] uppercase mb-3 ${T.denim}`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Work Order No. 00214 · For customers
                </p>
                <h3 className={`text-2xl font-semibold mb-3 ${T.ink}`} style={{ fontFamily: "'Oswald', sans-serif" }}>
                  ONLY VERIFIED WORKERS
                </h3>
                <p className={`text-sm leading-relaxed ${T.steel}`}>
                  Every worker on WorkMitra is ID-verified and rated by real customers.
                  What you see is what you get — no surprises, no scams.
                </p>
                <Link to="/search" className={`inline-flex items-center gap-2 mt-6 text-sm font-semibold hover:opacity-70 transition-opacity ${T.amber}`}>
                  Find a worker →
                </Link>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="h-full rounded-2xl p-8 relative overflow-hidden bg-[#FF6A1A]">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full" />
                <div className="relative">
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-3 text-white/80" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    Payslip preview · For workers
                  </p>
                  <h3 className="text-2xl font-semibold mb-3 text-white" style={{ fontFamily: "'Oswald', sans-serif" }}>
                    GROW YOUR INCOME.
                    <br />
                    OWN YOUR CALENDAR.
                  </h3>
                  <p className="text-sm leading-relaxed text-white/85">
                    Get discovered by thousands of customers. Manage bookings, collect
                    reviews, and grow your business — all from one place.
                  </p>
                  <Link to="/register" className="inline-flex items-center gap-2 mt-6 bg-white text-[#FF6A1A] font-semibold px-5 py-2.5 rounded-lg text-sm hover:-translate-y-0.5 transition-transform">
                    Join as a worker →
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className={T.card}>
        <div className="max-w-6xl mx-auto px-4 py-20">
          <Reveal>
            <div className="text-center mb-14">
              <p className={`text-[11px] font-semibold tracking-[0.2em] uppercase mb-3 ${T.denim}`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                The route
              </p>
              <h2 className={`text-4xl font-semibold ${T.ink}`} style={{ fontFamily: "'Oswald', sans-serif" }}>
                THREE STEPS. JOB DONE.
              </h2>
            </div>
          </Reveal>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`hidden md:block absolute top-6 left-[16.5%] right-[16.5%] border-t-2 border-dashed ${T.hairline}`} />
            {HOW_IT_WORKS.map((h, i) => (
              <Reveal key={h.step} delay={i * 120}>
                <div className="relative flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 relative z-10 mb-5 ${T.page} ${T.amberBorder} ${T.amber}`}
                       style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {h.step}
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${T.ink}`} style={{ fontFamily: "'Oswald', sans-serif" }}>
                    {h.title.toUpperCase()}
                  </h3>
                  <p className={`text-sm leading-relaxed max-w-[220px] ${T.steel}`}>{h.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className={T.page}>
        <div className="max-w-2xl mx-auto px-4 py-20">
          <Reveal>
            <div className={`text-center py-14 px-8 rounded-lg border-2 relative ${T.card} ${T.inkBorder}`}>
              <p className={`text-[11px] font-semibold tracking-[0.2em] uppercase mb-4 ${T.denim}`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                Admit one · WorkMitra
              </p>
              <h2 className={`text-4xl font-semibold mb-4 ${T.ink}`} style={{ fontFamily: "'Oswald', sans-serif" }}>
                READY TO GET STARTED?
              </h2>
              <p className={`text-sm mb-8 ${T.steel}`}>
                Join thousands of customers and workers already using WorkMitra.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/search" className="px-8 py-3 rounded-lg text-sm font-semibold text-white hover:-translate-y-0.5 transition-transform bg-[#FF6A1A]">
                  Find a Worker
                </Link>
                <Link to="/register" className={`px-8 py-3 rounded-lg text-sm font-semibold border-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${T.ink} ${T.inkBorder}`}>
                  Join as Worker
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
