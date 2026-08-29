import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import workerService from '../../services/worker.service';
import bookingService from '../../services/booking.service';
import Loader from '../../components/common/Loader';
import BookingCard from '../../components/booking/BookingCard';
import ProfileCompletenessMeter from '../../components/worker/ProfileCompletenessMeter';

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

export default function WorkerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [hasOverdueJobs, setHasOverdueJobs] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      workerService.getMyProfile(),
      // FIX #1: Removed the "status: pending" filter and increased limit to 30.
      // This ensures we fetch accepted/in_progress jobs to check if they are overdue.
      bookingService.getMyBookings({ limit: 30 }),
    ])
      .then(([p, b]) => {
        if (p.profileStrength === 0) {
          navigate('/worker/onboarding');
          return;
        }
        setProfile(p);
        
        // 🚨 ANTI-LEAKAGE LOGIC: Check for uncompleted jobs from the past
        const todayDateString = new Date().toISOString().split('T')[0];
        const overdue = b.bookings.some(job => 
          (job.status === 'accepted' || job.status === 'in_progress') && 
          job.date < todayDateString
        );
        setHasOverdueJobs(overdue);

        // Filter out ONLY the pending jobs to show in the UI list
        const pendingJobs = b.bookings.filter(job => job.status === 'pending').slice(0, 5);
        setRecentBookings(pendingJobs);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#EFEBE2] dark:bg-[#0a0a0a] pt-32 flex items-center justify-center">
      <Loader text="Loading your workspace..." size="lg" />
    </div>
  );

  const walletBalance = profile?.walletBalance || 0;
  const isLockedOut = walletBalance <= -500;
  const owesMoney = walletBalance < 0;
  const isNewProfile = !profile?.profession || profile?.profession === 'Not specified' || profile?.profileStrength === 0;

  return (
    <div className="min-h-screen bg-[#EFEBE2] dark:bg-[#0a0a0a] font-['Work_Sans',sans-serif] transition-colors duration-300">
      
      {/* Blueprint Grid Background */}
      <div className="fixed inset-0 opacity-[0.06] pointer-events-none dark:hidden" style={{ backgroundImage: `linear-gradient(#16140F 1px, transparent 1px), linear-gradient(90deg, #16140F 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none hidden dark:block" style={{ backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show" 
        className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto pb-12 relative z-10"
      >
        
        {/* 🚨 CRITICAL PAYWALL WARNING BANNER 🚨 */}
        {isLockedOut && (
          <motion.div variants={stampReveal} className="mb-8 relative overflow-hidden rounded-2xl shadow-[8px_8px_0_0_#9f1239] border-[3px] border-rose-700 bg-rose-600">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
            
            <div className="relative z-10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 shadow-inner border-2 border-white/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1 text-white/80 font-['IBM_Plex_Mono',monospace]">
                    Critical Alert
                  </p>
                  <h2 className="text-2xl font-black text-white tracking-wide font-['Oswald',sans-serif] uppercase">Account Suspended</h2>
                  <p className="text-sm font-medium text-rose-100 max-w-xl mt-1">You have reached the maximum credit limit of -₹500. You cannot receive new jobs until dues are cleared.</p>
                </div>
              </div>
              <Link to="/worker/wallet" className="w-full sm:w-auto px-6 py-3 bg-white text-rose-600 rounded-lg font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all text-center whitespace-nowrap border-2 border-transparent">
                Pay Dues Now
              </Link>
            </div>
          </motion.div>
        )}

        {/* 🚨 ANTI-LEAKAGE OVERDUE BANNER 🚨 */}
        {hasOverdueJobs && (
          <motion.div variants={stampReveal} className="mb-10 bg-rose-500/10 dark:bg-rose-500/5 border-[3px] border-rose-500 rounded-2xl p-6 shadow-[8px_8px_0_0_#e11d48] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 border-2 border-rose-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1 text-rose-600 dark:text-rose-400 font-['IBM_Plex_Mono',monospace]">
                  Action Required · Profile Hidden
                </p>
                <h3 className="text-2xl font-semibold text-rose-600 dark:text-rose-400 font-['Oswald',sans-serif] uppercase tracking-wide">
                  Clear Your Pending/In Progress Jobs
                </h3>
                <p className="text-sm font-medium text-rose-700 dark:text-rose-300 mt-2 max-w-xl">
                  You have active jobs from previous days. To receive new booking requests, you must mark your past jobs as <span className="font-bold underline">Completed</span> to settle the platform ledger.
                </p>
              </div>
            </div>
            <button 
            onClick={()=>navigate('/worker/bookings')}
              // onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="shrink-0 w-full sm:w-auto px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold transition-all hover:-translate-y-1 hover:shadow-[0_4px_0_0_#9f1239] active:translate-y-0 active:shadow-none border-2 border-rose-900 whitespace-nowrap"
            >
              Review Jobs ↓
            </button>
          </motion.div>
        )}

        {/* ── Welcome Header ── */}
        <motion.div variants={stampReveal} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase mb-4 text-[#2C4257] dark:text-[#7dd3fc] font-['IBM_Plex_Mono',monospace]">
              Worker Portal · Active
            </p>
            <h1 className="text-4xl sm:text-5xl font-semibold text-[#16140F] dark:text-[#f4f4f5] font-['Oswald',sans-serif] uppercase tracking-wide flex items-center gap-3">
              WELCOME BACK, {user?.name?.split(' ')[0]} 
              <svg className="w-8 h-8 text-[#FF6A1A] animate-wave origin-bottom-right" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>
            </h1>
            <p className="text-[#8B8577] dark:text-[#a1a1aa] mt-2 font-medium flex items-center gap-2 font-['IBM_Plex_Mono',monospace] text-xs">
              <svg className="w-4 h-4 text-[#FF6A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {profile?.profession?.toUpperCase()} 
              <span className="opacity-50">|</span> 
              <svg className="w-4 h-4 text-[#FF6A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {profile?.location?.city?.toUpperCase() || 'LOCATION NOT SET'}
            </p>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 shadow-sm font-['IBM_Plex_Mono',monospace] ${
            profile?.availability === 'available'
              ? 'bg-[#FAF8F3] dark:bg-[#171717] border-emerald-500 text-emerald-700 dark:text-emerald-400'
              : profile?.availability === 'busy'
              ? 'bg-[#FAF8F3] dark:bg-[#171717] border-amber-500 text-amber-700 dark:text-amber-400'
              : 'bg-[#FAF8F3] dark:bg-[#171717] border-[#8B8577] text-[#8B8577] dark:text-[#a1a1aa]'
          }`}>
            <span className={`w-3 h-3 rounded-full border-2 border-white dark:border-[#121212] ${
              profile?.availability === 'available' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' :
              profile?.availability === 'busy' ? 'bg-amber-500' : 'bg-[#8B8577]'
            }`} />
            <span className="text-xs font-bold uppercase tracking-wider">{profile?.availability || 'OFFLINE'}</span>
          </div>
        </motion.div>

        {/* ── Profile Completion Nudge ── */}
        {(!profile?.bio || !profile?.location?.city || profile?.profession === 'Not specified') && (
          <motion.div variants={stampReveal} className="mb-10 relative overflow-hidden rounded-2xl border-2 border-[#FF6A1A] bg-[#FF6A1A]/10 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FF6A1A] rounded-lg flex items-center justify-center shrink-0 mt-0.5 border-2 border-[#16140F]">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <p className="text-xl font-bold text-[#16140F] dark:text-[#f4f4f5] font-['Oswald',sans-serif] tracking-wide uppercase">Complete your profile to rank higher</p>
                <p className="text-sm font-medium text-[#8B8577] dark:text-[#a1a1aa] mt-1 max-w-xl">Add your city, bio, and skills so customers can easily find you in local search results.</p>
              </div>
            </div>
            <Link
              to={isNewProfile ? "/worker/onboarding" : "/worker/profile"}
              className="w-full sm:w-auto px-6 py-3 bg-[#16140F] dark:bg-[#f4f4f5] text-white dark:text-[#0a0a0a] font-bold text-sm rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg text-center whitespace-nowrap border-2 border-[#16140F] dark:border-[#f4f4f5]"
            >
              Complete Profile
            </Link>
          </motion.div>
        )}

        {/* ── Stats Grid (5 Columns) ── */}
        <motion.div variants={stampReveal} className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          
          {/* Wallet Card */}
          <Link 
            to="/worker/wallet" 
            className={`col-span-2 lg:col-span-1 rounded-2xl p-5 relative overflow-hidden group transition-all shadow-sm flex flex-col justify-between ${
              owesMoney 
                ? 'bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-500 hover:shadow-[4px_4px_0_0_#e11d48]' 
                : 'bg-[#FAF8F3] dark:bg-[#171717] border-2 border-[#16140F] dark:border-[#f4f4f5] hover:shadow-[4px_4px_0_0_#16140F] dark:hover:shadow-[4px_4px_0_0_#f4f4f5]'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded border-2 flex items-center justify-center ${owesMoney ? 'bg-rose-500 border-rose-700 text-white' : 'bg-[#FF6A1A] border-[#16140F] text-white'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <svg className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-transform -translate-x-2 group-hover:translate-x-0 ${owesMoney ? 'text-rose-600' : 'text-[#16140F] dark:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8B8577] dark:text-[#a1a1aa] font-['IBM_Plex_Mono',monospace] mb-1">Wallet Balance</p>
              <p className={`text-3xl font-semibold tracking-wide font-['Oswald',sans-serif] ${owesMoney ? 'text-rose-600 dark:text-rose-400' : 'text-[#16140F] dark:text-[#f4f4f5]'}`}>
                {owesMoney ? '-' : ''}₹{Math.abs(walletBalance).toLocaleString()}
              </p>
              <p className={`text-[10px] font-bold mt-2 uppercase tracking-wider font-['IBM_Plex_Mono',monospace] ${owesMoney ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {owesMoney ? 'Platform Dues' : 'All Clear'}
              </p>
            </div>
          </Link>

          {/* Existing Stats */}
          {[
            { label: 'LIFETIME EARNINGS', value: `₹${profile?.earnings?.toLocaleString() || 0}`, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /> },
            { label: 'JOBS DONE', value: profile?.jobsCompleted || 0, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
            { label: 'RATING', value: profile?.ratingAvg?.toFixed(1) || '0.0', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /> },
            { label: 'REVIEWS', value: profile?.ratingCount || 0, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
          ].map((stat, idx) => (
            <div key={idx} className="rounded-2xl border-2 border-[#16140F] dark:border-white/10 p-5 bg-[#FAF8F3] dark:bg-[#171717] shadow-sm flex flex-col justify-between">
              <div className="w-10 h-10 rounded border-2 border-[#16140F] dark:border-white/20 bg-white dark:bg-[#121212] text-[#16140F] dark:text-[#f4f4f5] flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{stat.icon}</svg>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#8B8577] dark:text-[#a1a1aa] font-['IBM_Plex_Mono',monospace] mb-1">{stat.label}</p>
                <p className="text-3xl font-semibold text-[#16140F] dark:text-[#f4f4f5] font-['Oswald',sans-serif] tracking-wide">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Profile Completeness + Quick Links ── */}
        {/* FIX #2: Added items-start here so the grid cells do not stretch vertically */}
       {/* ── Profile Completeness + Quick Links ── */}
        <motion.div variants={stampReveal} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16 items-stretch">
          
          <div className="lg:col-span-1">
            <ProfileCompletenessMeter profile={profile} />
          </div>
          
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { 
                to: isNewProfile ? '/worker/onboarding' : '/worker/profile', title: 'EDIT PROFILE', desc: 'Update details',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              }, 
              { 
                to: '/worker/bookings', title: 'BOOKINGS', desc: 'View job history',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              },
              { 
                to: '/worker/wallet', title: 'MY WALLET', desc: 'Check limits',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              },
              {
                to:'/worker/transactions' , title:'LEDGER' , desc: 'Statements',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              }
            ].map((link) => (
              <Link key={link.to} to={link.to}>
                <div className="h-full rounded-2xl border-2 border-[#16140F] dark:border-[#f4f4f5] p-5 bg-[#FAF8F3] dark:bg-[#121212] group hover:bg-[#16140F] dark:hover:bg-[#f4f4f5] hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#FF6A1A] transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-6">
                  <div className="w-10 h-10 rounded border-2 border-[#16140F] dark:border-[#f4f4f5] bg-white dark:bg-[#171717] text-[#16140F] dark:text-[#f4f4f5] flex items-center justify-center group-hover:bg-[#FF6A1A] group-hover:border-[#FF6A1A] group-hover:text-white transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{link.icon}</svg>
                  </div>
                  <div>
                    <p className="font-semibold font-['Oswald',sans-serif] text-[#16140F] dark:text-[#f4f4f5] text-lg tracking-wide group-hover:text-white dark:group-hover:text-[#0a0a0a] transition-colors">{link.title}</p>
                    <p className="text-[10px] font-bold font-['IBM_Plex_Mono',monospace] text-[#8B8577] dark:text-[#a1a1aa] group-hover:text-white/70 dark:group-hover:text-black/70 mt-1 uppercase">{link.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── Pending Booking Requests ── */}
        <motion.div variants={stampReveal} className="bg-[#FAF8F3] dark:bg-[#171717] border-2 border-[#16140F] dark:border-[#f4f4f5] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0_0_rgba(22,20,15,0.05)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between mb-8 border-b-2 border-dashed border-[#8B8577] dark:border-[#52525b] pb-4">
            <h2 className="text-2xl font-semibold text-[#16140F] dark:text-[#f4f4f5] font-['Oswald',sans-serif] tracking-wide">
              PENDING WORK ORDERS
            </h2>
            <Link to="/worker/bookings" className="text-xs font-bold text-[#FF6A1A] font-['IBM_Plex_Mono',monospace] hover:opacity-70 transition-colors flex items-center gap-1">
              VIEW ALL
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-[#8B8577] dark:border-[#52525b] bg-[#EFEBE2] dark:bg-[#0a0a0a]">
              <div className="w-16 h-16 bg-[#FAF8F3] dark:bg-[#171717] border-2 border-[#16140F] dark:border-[#f4f4f5] text-[#16140F] dark:text-[#f4f4f5] rounded flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <p className="text-lg font-semibold text-[#16140F] dark:text-[#f4f4f5] font-['Oswald',sans-serif] tracking-wide">NO DISPATCHES RIGHT NOW.</p>
              <p className="text-xs font-bold text-[#8B8577] dark:text-[#a1a1aa] font-['IBM_Plex_Mono',monospace] mt-2 max-w-sm mx-auto uppercase leading-relaxed">
                Make sure your profile is 100% complete and your status is set to "Available".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentBookings.map((b) => (
                <BookingCard key={b._id} booking={b} viewerRole="worker" onUpdated={load} />
              ))}
            </div>
          )}
        </motion.div>

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


