
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import bookingService from '../../services/booking.service';
import Loader from '../../components/common/Loader';
import RecentlyViewed from '../../components/worker/RecentlyViewed';

// Stamped status styles mimicking the industrial theme
const STATUS_STYLES = {
  pending:     'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
  accepted:    'bg-blue-500/10 text-[#2C4257] dark:text-[#7dd3fc] border-[#2C4257]/30 dark:border-[#7dd3fc]/30',
  in_progress: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  completed:   'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  cancelled:   'bg-[#8B8577]/10 text-[#8B8577] dark:text-[#a1a1aa] border-[#8B8577]/30',
  rejected:    'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
};

// Framer motion variants for stamped mechanical loading
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const stampReveal = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } }
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingService.getMyBookings({ limit: 5 }).then((res) => {
      setBookings(res.bookings);
      const all = res.pagination?.total || 0;
      const done = res.bookings.filter(b => b.status === 'completed').length;
      const pend = res.bookings.filter(b => b.status === 'pending').length;
      setStats({ total: all, completed: done, pending: pend });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#EFEBE2] dark:bg-[#0a0a0a] font-['Work_Sans',sans-serif] transition-colors duration-300">
      
      {/* Blueprint Grid Background */}
      <div className="fixed inset-0 opacity-[0.06] pointer-events-none dark:hidden" style={{ backgroundImage: `linear-gradient(#16140F 1px, transparent 1px), linear-gradient(90deg, #16140F 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none hidden dark:block" style={{ backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show" 
        className="max-w-6xl mx-auto pt-24 pb-12 px-4 sm:px-6 relative z-10"
      >
        
        {/* ── Welcome Section ── */}
        <motion.div variants={stampReveal} className="mb-10">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase mb-4 text-[#2C4257] dark:text-[#7dd3fc] font-['IBM_Plex_Mono',monospace]">
            Client Portal · Active
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-[#16140F] dark:text-[#f4f4f5] font-['Oswald',sans-serif] uppercase tracking-wide">
            HEY, {user?.name?.split(' ')[0]} <span className="inline-block origin-bottom-right animate-wave">👋</span>
          </h1>
          <p className="text-[#8B8577] dark:text-[#a1a1aa] mt-2 font-medium max-w-lg">
            Welcome to your command center. Track active jobs, review past work, and dispatch new professionals.
          </p>
        </motion.div>

        {/* ── AI Matching Dispatch Ticket ── */}
        <motion.div variants={stampReveal} className="relative overflow-hidden rounded-2xl p-8 sm:p-10 mb-12 shadow-[8px_8px_0_0_#16140F] dark:shadow-[8px_8px_0_0_#f4f4f5] border-[3px] border-[#16140F] dark:border-[#f4f4f5] bg-[#c78968]">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/15 rounded-full blur-sm pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-sm pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2 text-[#16140F] font-['IBM_Plex_Mono',monospace]">
                Priority Dispatch
              </p>
              <h2 className="font-semibold text-white text-3xl font-['Oswald',sans-serif] uppercase tracking-wide mb-2">
                Need urgent assistance?
              </h2>
              <p className="text-white/90 text-sm font-medium max-w-md leading-relaxed">
                Skip the search. Let our automated matching system find the highest-rated professional for your specific issue instantly.
              </p>
            </div>
            <Link 
              to="/find-my-worker" 
              className="shrink-0 inline-flex items-center gap-2 bg-[#16140F] dark:bg-[#f4f4f5] text-white dark:text-[#0a0a0a] font-bold px-7 py-3.5 rounded-lg transition-transform hover:-translate-y-1 active:scale-95 border-2 border-[#16140F] dark:border-[#f4f4f5]"
            >
              Start Auto-Match
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </motion.div>

        {/* ── Stats Grid (Stamped Look) ── */}
        <motion.div variants={stampReveal} className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {[
            { label: 'TOTAL DISPATCHES', value: stats.total, color: 'text-[#2C4257] dark:text-[#7dd3fc]' },
            { label: 'COMPLETED JOBS', value: stats.completed, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'PENDING REQUESTS', value: stats.pending, color: 'text-[#FF6A1A]' },
          ].map((s, idx) => (
            <div key={idx} className="bg-[#FAF8F3] dark:bg-[#171717] border-2 border-dashed border-[#8B8577] dark:border-[#52525b] rounded-xl p-6 flex items-center justify-between transition-colors hover:border-[#16140F] dark:hover:border-[#f4f4f5]">
              <div>
                <p className="text-[10px] font-bold text-[#8B8577] dark:text-[#a1a1aa] font-['IBM_Plex_Mono',monospace] tracking-[0.15em] mb-1">{s.label}</p>
                <p className={`text-4xl font-semibold font-['Oswald',sans-serif] leading-none ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Quick Links ── */}
        <motion.div variants={stampReveal} className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
          {[
            { to: '/search', title: 'FIND A WORKER', desc: 'Browse the full directory manually', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
            { to: '/customer/bookings', title: 'MY BOOKINGS', desc: 'Track all active and past jobs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { to: '/customer/favorites', title: 'SAVED ROSTER', desc: 'Professionals you have favorited', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
          ].map((link, idx) => (
            <Link 
              key={idx} to={link.to} 
              className="group bg-white dark:bg-[#121212] border-2 border-[#16140F] dark:border-[#f4f4f5] rounded-xl p-6 hover:-translate-y-1.5 hover:shadow-[4px_4px_0_0_#16140F] dark:hover:shadow-[4px_4px_0_0_#f4f4f5] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded border-2 border-[#16140F] dark:border-[#f4f4f5] bg-[#FAF8F3] dark:bg-[#171717] text-[#16140F] dark:text-[#f4f4f5] flex items-center justify-center group-hover:bg-[#FF6A1A] group-hover:text-white group-hover:border-[#FF6A1A] transition-colors duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                </svg>
              </div>
              <p className="font-semibold text-[#16140F] dark:text-[#f4f4f5] font-['Oswald',sans-serif] text-lg mt-5 tracking-wide">{link.title}</p>
              <p className="text-xs font-medium text-[#8B8577] dark:text-[#a1a1aa] mt-1">{link.desc}</p>
            </Link>
          ))}
        </motion.div>

        {/* ── Recently Viewed & Recent Bookings ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <motion.div variants={stampReveal}>
            {/* The styling inside RecentlyViewed may need to be updated to match in its own file */}
            <RecentlyViewed />
          </motion.div>

          <motion.div variants={stampReveal} className="bg-[#FAF8F3] dark:bg-[#171717] border-2 border-[#16140F] dark:border-[#f4f4f5] rounded-2xl p-6 sm:p-8 relative">
            <div className="flex items-center justify-between mb-6 border-b-2 border-dashed border-[#8B8577] dark:border-[#52525b] pb-4">
              <h2 className="text-2xl font-semibold text-[#16140F] dark:text-[#f4f4f5] font-['Oswald',sans-serif] tracking-wide">WORK LOG</h2>
              <Link to="/customer/bookings" className="text-xs font-bold text-[#FF6A1A] font-['IBM_Plex_Mono',monospace] hover:opacity-70 transition-opacity">
                VIEW ALL →
              </Link>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12"><Loader size="md" /></div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-[#8B8577] dark:border-[#52525b] bg-[#EFEBE2] dark:bg-[#0a0a0a] rounded-xl">
                <div className="w-12 h-12 rounded bg-[#FAF8F3] dark:bg-[#171717] border-2 border-[#16140F] dark:border-[#f4f4f5] flex items-center justify-center mx-auto mb-3 text-[#16140F] dark:text-[#f4f4f5]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <p className="text-[#8B8577] dark:text-[#a1a1aa] font-bold text-xs font-['IBM_Plex_Mono',monospace]">NO WORK ORDERS LOGGED.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {bookings.map((b) => (
                  <div key={b._id} className="flex items-center justify-between p-4 bg-white dark:bg-[#121212] border-2 border-[#16140F]/10 dark:border-white/10 rounded-xl hover:border-[#16140F] dark:hover:border-[#f4f4f5] transition-colors">
                    <div>
                      <p className="text-sm font-bold text-[#16140F] dark:text-[#f4f4f5]">{b.worker?.profession || 'Professional'}</p>
                      <p className="text-[10px] font-bold text-[#8B8577] dark:text-[#a1a1aa] font-['IBM_Plex_Mono',monospace] mt-1">
                        {new Date(b.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} · {b.timeSlot.split(' ')[0].toUpperCase()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded border ${STATUS_STYLES[b.status] || STATUS_STYLES.pending} font-['IBM_Plex_Mono',monospace]`}>
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <style>{`
          @keyframes wave {
            0% { transform: rotate(0.0deg) }
            10% { transform: rotate(14.0deg) }
            20% { transform: rotate(-8.0deg) }
            30% { transform: rotate(14.0deg) }
            40% { transform: rotate(-4.0deg) }
            50% { transform: rotate(10.0deg) }
            60% { transform: rotate(0.0deg) }
            100% { transform: rotate(0.0deg) }
          }
          .animate-wave { animation: wave 2.5s infinite; }
        `}</style>
      </motion.div>
    </div>
  );
}
