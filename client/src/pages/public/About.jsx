import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, useInView } from 'framer-motion';

// --- DATA ---
const TEAM_VALUES = [
  { icon: '🛡️', title: 'Absolute Trust', desc: 'Every node in our network is cryptographically and physically verified. No anonymous profiles. No exceptions.' },
  { icon: '⭐', title: 'Verified Telemetry', desc: 'Only customers with cryptographically confirmed bookings can submit reviews. Zero fabricated data.' },
  { icon: '⚡', title: 'Frictionless Speed', desc: 'Initiate and lock a professional deployment in under 120 seconds. Zero calls, zero waiting, absolute efficiency.' },
  { icon: '🤝', title: 'Worker Equity', desc: 'Professionals retain their exact quoted capital. We engineered a system that never takes a cut from their labor.' },
];

const MILESTONES = [
  { year: '2024', event: 'System Initialized. WorkMitra deployed across the Delhi NCR grid, connecting the first cohort of professionals.' },
  { year: '2024', event: 'Network Expansion. Infrastructure scaled to Mumbai, Bangalore, and Hyderabad. 5,000+ nodes onboarded.' },
  { year: '2025', event: 'Algorithmic Matching. Real-time encrypted chat and AI-driven matchmaking protocols deployed to production.' },
  { year: '2025', event: 'Mass Adoption. Network reaches 50,000 active professionals operating across 500+ Indian cities.' },
];

// --- 1. CYBER-GLOW CARD ---
function CyberCard({ children, className }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden rounded-[2rem] bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 transition-all duration-500 hover:shadow-2xl hover:border-orange-500/30 ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-20"
        style={{ background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(249, 115, 22, 0.15), transparent 80%)` }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

// --- 2. MAGNETIC WRAPPER ---
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

  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={() => { x.set(0); y.set(0); }} style={{ x: springX, y: springY }} className="relative inline-block w-full sm:w-auto">
      {children}
    </motion.div>
  );
}

// --- 3. MILESTONE NODE (Scroll-driven) ---
function MilestoneNode({ milestone, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-20% 0px -20% 0px", once: false });

  return (
    <div ref={ref} className="relative flex gap-6 md:gap-10 py-6 md:py-10 group">
      {/* Node Indicator */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div 
          initial={false}
          animate={{ 
            backgroundColor: isInView ? 'rgb(249, 115, 22)' : 'rgba(161, 161, 170, 0.2)',
            scale: isInView ? 1.2 : 1,
            boxShadow: isInView ? '0 0 20px rgba(249, 115, 22, 0.5)' : '0 0 0px rgba(0,0,0,0)'
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-5 h-5 md:w-6 md:h-6 rounded-full border-4 border-zinc-50 dark:border-[#030303] flex-shrink-0 relative z-20"
        />
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0.4, x: 10 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 pb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-black tracking-widest uppercase mb-3">
          Phase {index + 1} // {milestone.year}
        </div>
        <p className="text-xl md:text-2xl font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed text-balance">
          {milestone.event}
        </p>
      </motion.div>
    </div>
  );
}

// --- MAIN ABOUT COMPONENT ---
export default function About() {
  const timelineRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"]
  });
  
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="bg-zinc-50 dark:bg-[#030303] min-h-screen w-full max-w-[100vw] overflow-x-hidden text-zinc-900 dark:text-zinc-50 font-sans selection:bg-orange-500/30 selection:text-white relative pt-20">
      
      {/* ── AMBIENT DIGITAL GRID ── */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center items-start overflow-hidden">
        {/* FIX APPLIED HERE: Swapped w-[1000px] to w-full max-w-[1000px] */}
        <div className="absolute top-[-10%] w-full max-w-[1000px] h-[800px] bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.1)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 w-full">
        
        {/* ── 1. THE ORIGIN TERMINAL (Hero) ── */}
        <section className="pt-24 pb-20 px-6 max-w-[90rem] mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-xl mb-8 shadow-sm"
          >
            <span className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-zinc-400 uppercase font-mono">
              System Origin
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, type: "spring" }}
            className="text-5xl sm:text-6xl md:text-[90px] font-black leading-[0.9] tracking-tighter text-zinc-900 dark:text-white mb-8 text-balance break-words"
          >
            Built for India's <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              skilled workforce.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-2xl font-medium text-zinc-500 dark:text-zinc-400 max-w-3xl mb-12 text-balance leading-relaxed"
          >
            WorkMitra was engineered to solve a persistent physical problem — deploying trustworthy craftsmanship with zero latency. We are the bridge between demand and absolute quality.
          </motion.p>
        </section>

        {/* ── 2. CORE PROTOCOLS (Values Grid) ── */}
        <section className="py-24 px-6 max-w-[90rem] mx-auto border-t border-zinc-200 dark:border-white/5">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">Core Protocols.</h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium mt-3">The logic that dictates every node in our system.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {TEAM_VALUES.map((v, i) => (
              <motion.div 
                key={v.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <CyberCard className="p-8 md:p-12 h-full flex flex-col group">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 flex items-center justify-center text-2xl shadow-inner mb-8 group-hover:scale-110 transition-transform duration-300">
                    {v.icon}
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">{v.title}</h3>
                  <p className="text-base font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {v.desc}
                  </p>
                </CyberCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 3. SYSTEM LOG (Scroll-Driven Timeline) ── */}
        <section className="py-32 bg-zinc-100/50 dark:bg-[#070707] border-y border-zinc-200 dark:border-white/5 overflow-hidden">
          <div className="max-w-[60rem] mx-auto px-6">
            <div className="mb-20 text-center md:text-left">
              <p className="text-orange-500 font-mono text-[11px] font-bold tracking-[0.2em] uppercase mb-4">Telemetry Log</p>
              <h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter">Our Evolution.</h2>
            </div>

            <div className="relative pl-2 md:pl-0" ref={timelineRef}>
              {/* Background Track */}
              <div className="absolute left-[11px] md:left-[11px] top-0 bottom-0 w-[2px] bg-zinc-200 dark:bg-zinc-800" />
              
              {/* Animated Progress Line */}
              <motion.div 
                style={{ height: lineHeight }}
                className="absolute left-[11px] md:left-[11px] top-0 w-[2px] bg-gradient-to-b from-orange-400 to-orange-600 shadow-[0_0_10px_rgba(249,115,22,0.8)] origin-top" 
              />

              <div className="space-y-4">
                {MILESTONES.map((m, i) => (
                  <MilestoneNode key={i} milestone={m} index={i} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. THE CORE CONSOLE (Final CTA) ── */}
        <section className="py-32 px-6 max-w-[90rem] mx-auto">
          <div className="relative rounded-[3rem] p-12 md:p-24 overflow-hidden bg-zinc-900 dark:bg-[#0a0a0a] border border-zinc-800 dark:border-white/10 shadow-2xl text-center flex flex-col items-center w-full">
            
            {/* Ambient Deep Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(249,115,22,0.2),transparent_70%)] pointer-events-none" />
            
            <div className="relative z-10 w-full">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter break-words">
                Initialize Connection.
              </h2>
              <p className="text-lg md:text-xl font-medium text-zinc-400 mb-12 max-w-xl mx-auto text-balance">
                Whether you are seeking physical execution or looking to deploy your skills — the network is waiting.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-center w-full">
                <Magnetic pull={0.1}>
                  <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-orange-500 text-white rounded-2xl text-lg font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                    Establish Node <span className="text-xl">→</span>
                  </Link>
                </Magnetic>
                <Magnetic pull={0.1}>
                  <Link to="/search" className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-lg font-bold hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center">
                    Browse Network
                  </Link>
                </Magnetic>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}



