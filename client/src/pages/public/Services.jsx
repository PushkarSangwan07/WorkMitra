import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

// --- ENHANCED DATA WITH CINEMATIC IMAGES ---
const SERVICES = [
  { name: 'Electrician', icon: '⚡', img: 'https://images.pexels.com/photos/14934022/pexels-photo-14934022.jpeg', desc: 'House wiring, panel installation, fans, lights, inverters, solar panels' },
  { name: 'Plumber', icon: '💧', img: 'https://images.pexels.com/photos/27354189/pexels-photo-27354189.jpeg', desc: 'Pipe fitting, bathroom renovation, water tank, drainage, geyser' },
  { name: 'Carpenter', icon: '🪚', img: 'https://images.pexels.com/photos/5711881/pexels-photo-5711881.jpeg', desc: 'Custom furniture, modular kitchen, wardrobes, flooring, doors' },
  { name: 'AC Technician', icon: '❄️', img: 'https://images.pexels.com/photos/10958586/pexels-photo-10958586.jpeg', desc: 'AC installation, servicing, gas refilling, PCB repair, all brands' },
  { name: 'Painter', icon: '🎨', img: 'https://images.pexels.com/photos/1669002/pexels-photo-1669002.jpeg', desc: 'Interior, exterior, texture, wallpaper, waterproofing, wood polish' },
  { name: 'Mason', icon: '🧱', img: 'https://images.pexels.com/photos/14225905/pexels-photo-14225905.jpeg', desc: 'Brickwork, plastering, tiling, RCC work, marble, granite fitting' },
  { name: 'Welder', icon: '🔥', img: 'https://images.pexels.com/photos/27630177/pexels-photo-27630177.jpeg', desc: 'Arc, MIG, TIG welding, gate fabrication, railings, steel structures' },
  { name: 'Construction Worker', icon: '🏗️', img: 'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg', desc: 'Site supervision, civil work, foundation, concrete, shuttering' },
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
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} style={{ x: springX, y: springY }} className="relative inline-block">
      {children}
    </motion.div>
  );
}

// --- CYBER-GLOW SERVICE CARD ---
function ServiceCard({ service, index }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link 
        to={`/search?profession=${encodeURIComponent(service.name)}`}
        onMouseMove={handleMouseMove}
        className="group relative block h-[320px] md:h-[380px] w-full overflow-hidden rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 transition-shadow duration-500 hover:shadow-2xl hover:shadow-primary-500/20"
      >
        {/* Laser Border Hover Effect */}
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-20"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                400px circle at ${mouseX}px ${mouseY}px,
                rgba(249, 115, 22, 0.5),
                transparent 80%
              )
            `,
          }}
        />

        {/* Cinematic Background Image */}
        <img 
          src={service.img} 
          alt={service.name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />
        
        {/* Deep Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 transition-opacity duration-500 group-hover:from-black group-hover:via-black/60" />

        {/* Floating Icon Pill */}
        <div className="absolute top-6 left-6 z-10 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-2xl shadow-lg shadow-black/20 group-hover:-translate-y-1 transition-transform duration-300">
          {service.icon}
        </div>

        {/* Content Reveal */}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col justify-end z-10">
          <h3 className="text-3xl font-black tracking-tighter text-white mb-2 group-hover:-translate-y-1 transition-transform duration-300">
            {service.name}
          </h3>
          <p className="text-sm md:text-base font-medium text-zinc-300 mb-4 opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300 delay-75 line-clamp-2">
            {service.desc}
          </p>
          
          <div className="flex items-center gap-2 text-primary-400 font-bold text-sm tracking-wide uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
            Deploy Expert <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// --- MAIN COMPONENT ---
export default function Services() {
  return (
  <div className="bg-zinc-50 dark:bg-[#030303] min-h-screen w-full max-w-[100vw] overflow-x-hidden text-zinc-900 dark:text-zinc-50 font-sans selection:bg-orange-500/30 relative pt-20 pb-32">
      
      {/* ── AMBIENT DIGITAL GRID ── */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center items-start overflow-hidden">
        <div className="absolute top-[-10%] w-full max-w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.12)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10">
        
        {/* ── 1. THE TERMINAL HEADER ── */}
        <section className="pt-24 pb-16 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-xl mb-8 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
            <span className="text-[11px] font-bold tracking-widest text-zinc-600 dark:text-zinc-400 uppercase font-mono">
              The Service Matrix
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, type: "spring" }}
            className="text-5xl sm:text-6xl md:text-[80px] font-black leading-[0.9] tracking-tighter text-zinc-900 dark:text-white mb-6 text-balance"
          >
            Capabilities & <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-amber-500">
              Disciplines.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl mb-12 text-balance"
          >
            Explore our curated database of verified physical domains. Deploy an expert for any structural or technical requirement.
          </motion.p>

          {/* Magnetic AI Command Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
            <Magnetic pull={0.1}>
              <Link 
                to="/find-my-worker" 
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[1.5rem] text-lg font-bold shadow-2xl hover:shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-primary-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
                <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                  <span className="text-xl">✨</span> Initiate AI Matchmaking
                </span>
              </Link>
            </Magnetic>
          </motion.div>

        </section>

        {/* ── 2. THE HIGH-DENSITY BENTO GRID ── */}
        <section className="pb-32 px-6 max-w-[100rem] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {SERVICES.map((s, i) => (
              <ServiceCard key={s.name} service={s} index={i} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}