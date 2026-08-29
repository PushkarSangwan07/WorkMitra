import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';

// --- DATA ---
const links = {
  Platform: [
    { to: '/search',          label: 'Find Workers' },
    { to: '/find-my-worker',  label: '✨ AI Matching', isSpecial: true },
    { to: '/services',        label: 'Services Directory' },
    { to: '/register',        label: 'Join as a Worker' },
  ],
  Company: [
    { to: '/about',   label: 'About WorkMitra' },
    { to: '/contact', label: 'Contact Support' },
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms',   label: 'Terms of Service' },
  ],
};

const TRADES = [
  { icon: '⚡', label: 'Electrical' },
  { icon: '💧', label: 'Plumbing' },
  { icon: '🪵', label: 'Carpentry' },
  { icon: '❄️', label: 'Climate' }
];

// --- MAGNETIC PHYSICS WRAPPER ---
function Magnetic({ children, pull = 0.15 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { damping: 15, stiffness: 150, mass: 0.1 });
  const springY = useSpring(y, { damping: 15, stiffness: 150, mass: 0.1 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    x.set((clientX - (left + width / 2)) * pull);
    y.set((clientY - (top + height / 2)) * pull);
  };

  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} style={{ x: springX, y: springY }} className="relative flex items-center justify-center">
      {children}
    </motion.div>
  );
}

// --- FLUID LINK COMPONENT ---
function FooterLink({ item }) {
  return (
    <li>
      <Link to={item.to} className="group flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors py-1.5 relative overflow-hidden">
        {/* Hover Highlight Line */}
        <motion.div 
          className="absolute left-0 bottom-0 w-full h-[1px] bg-primary-500 origin-left"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
        <span className={`relative transition-transform duration-300 group-hover:translate-x-1 ${item.isSpecial ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500' : ''}`}>
          {item.label}
        </span>
        <svg className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary-500" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </li>
  );
}

// --- LIVE CLOCK COMPONENT ---
function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 font-mono text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest w-max shadow-inner">
      <span>AMBALA, IND</span>
      <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
      <span className="text-zinc-700 dark:text-zinc-200">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}
      </span>
    </div>
  );
}

// --- MAIN FOOTER ---
export default function Footer() {
  // Global Footer Mouse Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <footer 
      onMouseMove={handleMouseMove}
      className="relative bg-zinc-50 dark:bg-[#030303] border-t border-zinc-200 dark:border-white/10 overflow-hidden transition-colors duration-500 pt-20 group/footer"
    >
      
      {/* ── GLOBAL AMBIENT SPOTLIGHT ── */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-1000 group-hover/footer:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              800px circle at ${mouseX}px ${mouseY}px,
              rgba(249, 115, 22, 0.05),
              transparent 80%
            )
          `,
        }}
      />
      {/* Structural Grain */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="relative z-10 max-w-[100rem] mx-auto px-6 lg:px-12 flex flex-col min-h-[500px] justify-between">
        
        {/* ── 1. MAIN GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-20 relative z-20">
          
          {/* Brand & Telemetry Column */}
          <div className="md:col-span-12 lg:col-span-5 flex flex-col items-start">
            <Magnetic pull={0.1}>
              <Link to="/" className="flex items-center gap-3 shrink-0 group mb-6">
                <div className="h-10 w-10 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/20 transition-transform group-hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-hammer h-5 w-5 text-white" aria-hidden="true"><path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"></path><path d="m18 15 4-4"></path><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"></path></svg>
                </div>
                <span className="font-black text-2xl text-zinc-900 dark:text-white tracking-tighter">
                  Work<span className="text-primary-600">Mitra</span>
                </span>
              </Link>
            </Magnetic>

            <p className="text-base font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-sm mb-8">
              The premium digital infrastructure connecting modern spaces with India's rigorously verified craftsmanship.
            </p>

           
          </div>

          {/* Links Columns */}
          <div className="md:col-span-7 lg:col-span-4 grid grid-cols-2 gap-8 md:gap-16">
            {Object.entries(links).map(([group, items]) => (
              <div key={group}>
                <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.25em] mb-6">
                  {group}
                </p>
                <ul className="space-y-4">
                  {items.map((item) => (
                    <FooterLink key={item.to} item={item} />
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Terminal / Newsletter Column */}
          <div className="md:col-span-5 lg:col-span-3 flex flex-col">
            <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.25em] mb-6">
              Network Updates
            </p>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">
              Get notified about new regions and platform features.
            </p>
            
            
           
          </div>

        </div>

        {/* ── 2. BOTTOM META BAR ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-zinc-200 dark:border-white/10 relative z-20">
          <p className="text-xs font-bold text-zinc-500 tracking-wide uppercase">
            © {new Date().getFullYear()} WorkMitra Platform.
          </p>
          
        </div>
      </div>

      {/* ── 3. GRADIENT MEGA WATERMARK ── */}
      {/* Fades perfectly into the background using a transparency gradient mask */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden flex justify-center pointer-events-none select-none z-0 translate-y-1/4">
        <h1 className="text-[22vw] font-black leading-[0.75] tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-zinc-200 dark:from-white/10 to-transparent">
          WORKMITRA
        </h1>
      </div>

    </footer>
  );
}