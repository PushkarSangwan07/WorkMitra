import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { motion, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';

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
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} style={{ x: springX, y: springY }} className="relative inline-block w-full">
      {children}
    </motion.div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Global mouse tracking for ambient form glow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Sending data to Web3Forms API to deliver directly to the Admin's Email
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          // REPLACE THIS WITH YOUR WEB3FORMS ACCESS KEY
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
          name: form.name,
          email: form.email,
          message: form.message,
          subject: "New Direct Message from WorkMitra Contact Form",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Transmission successful. We will respond shortly.");
        setForm({ name: '', email: '', message: '' });
      } else {
        toast.error("Transmission failed. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-zinc-50 dark:bg-[#030303] min-h-screen w-full max-w-[100vw] overflow-x-hidden text-zinc-900 dark:text-zinc-50 font-sans selection:bg-orange-500/30 selection:text-white relative pt-20 pb-32">
      
      {/* ── AMBIENT DIGITAL GRID ── */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center items-start overflow-hidden">
        {/* FIXED: w-[1000px] changed to w-full max-w-[1000px] for mobile */}
        <div className="absolute top-[-10%] w-full max-w-[1000px] h-[800px] bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 max-w-[90rem] mx-auto px-4 sm:px-6 pt-16">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-200/50 dark:bg-zinc-900 border border-zinc-300 dark:border-white/5 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-zinc-600 dark:text-zinc-400 uppercase font-mono">
              Secure Communications Channel
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 dark:text-white mb-6 text-balance">
            Establish Connection.
          </h1>
          <p className="text-lg md:text-xl font-medium text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-balance">
            Require assistance or looking to partner? Transmit a secure message to our core team and we will respond within 24 hours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          
          {/* ── LEFT: TELEMETRY & CONTACT INFO ── */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col gap-8"
          >
            <div className="p-8 md:p-10 bg-zinc-100 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-white/5">
              <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-8">Direct Lines</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm shrink-0 text-zinc-700 dark:text-zinc-300">
                    {/* SVG replacing Email Emoji */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Email Support</p>
                    <a href="mailto:workmitra.app@gmail.com" className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white hover:text-orange-500 transition-colors break-all">
                      workmitra.app@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm shrink-0 text-zinc-700 dark:text-zinc-300">
                    {/* SVG replacing Location Emoji */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Headquarters</p>
                    <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                      Ambala, Haryana<br/>India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status Readout */}
            <div className="p-8 bg-orange-50 dark:bg-orange-900/10 rounded-[2rem] border border-orange-100 dark:border-orange-500/10">
              <p className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2 font-mono">System Status</p>
              <h4 className="text-lg font-black text-zinc-900 dark:text-white mb-2">Average Response Time</h4>
              <p className="text-3xl font-black text-orange-600 dark:text-orange-500">{"< 2 Hours"}</p>
            </div>
          </motion.div>

          {/* ── RIGHT: THE SECURE FORM ── */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-7"
          >
            <div 
              onMouseMove={handleMouseMove}
              className="relative p-6 sm:p-8 md:p-12 bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-zinc-200 dark:border-white/5 shadow-2xl overflow-hidden group"
            >
              {/* Laser Hover Effect */}
              <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
                style={{
                  background: useMotionTemplate`
                    radial-gradient(
                      600px circle at ${mouseX}px ${mouseY}px,
                      rgba(249, 115, 22, 0.08),
                      transparent 80%
                    )
                  `,
                }}
              />

              <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Your Name"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 px-5 text-base text-zinc-900 dark:text-white font-medium placeholder:text-zinc-400 focus:outline-none focus:border-orange-500/50 focus:bg-white dark:focus:bg-black transition-all shadow-inner"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="Enter Your Email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 px-5 text-base text-zinc-900 dark:text-white font-medium placeholder:text-zinc-400 focus:outline-none focus:border-orange-500/50 focus:bg-white dark:focus:bg-black transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Message Input */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Message Transmission</label>
                  <textarea
                    required
                    placeholder="How can we assist you?"
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 p-5 text-base text-zinc-900 dark:text-white font-medium placeholder:text-zinc-400 focus:outline-none focus:border-orange-500/50 focus:bg-white dark:focus:bg-black transition-all shadow-inner resize-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Magnetic pull={0.1}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-16 bg-orange-500 text-white rounded-2xl text-lg font-bold shadow-xl shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Transmitting...
                        </>
                      ) : (
                        <>
                          Transmit Message <svg className="w-5 h-5 -rotate-45" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </>
                      )}
                    </button>
                  </Magnetic>
                </div>
                
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}