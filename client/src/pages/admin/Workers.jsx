import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../../services/admin.service';
import Loader from '../../components/common/Loader';

// Helper to generate initials for avatars
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

// Helper for Verification Badge styling
const getVerificationStyles = (status) => {
  const styles = {
    verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20',
    unverified: 'bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-400 border-zinc-200 dark:border-white/10',
  };
  return styles[status] || styles.unverified;
};

export default function AdminWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // NEW: Verification Filter State

  useEffect(() => {
    adminService.getAllWorkers().then((res) => setWorkers(res.workers)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading workers..." />;

  // NEW: Filter Logic for Verification Status
  const filteredWorkers = activeTab === 'all' 
    ? workers 
    : workers.filter(w => (w.verification?.status || 'unverified') === activeTab);

  const tabs = [
    { id: 'all', label: 'All Workers' },
    { id: 'verified', label: 'Verified' },
    { id: 'pending', label: 'Pending Review' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'unverified', label: 'Unverified' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 px-4 max-w-7xl mx-auto pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Worker Directory</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Manage service providers and verify their profiles</p>
        </div>
      </div>

      {/* NEW: Interactive Verification Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'text-white' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="workerTabIndicator"
                className="absolute inset-0 bg-orange-500 rounded-xl -z-10 shadow-lg shadow-orange-500/20"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {tab.label}
            {/* Show count on the 'All' tab */}
            {tab.id === 'all' && (
              <span className={`ml-2 px-2 py-0.5 rounded-md text-xs ${activeTab === 'all' ? 'bg-white/20' : 'bg-zinc-200 dark:bg-white/10'}`}>
                {workers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Premium Table Container */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-black/50 border-b border-zinc-200 dark:border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Worker Details</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Profession</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Rating</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Verification</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
              <AnimatePresence>
                {filteredWorkers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <p className="text-sm font-bold">No workers found in this category.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredWorkers.map((w, index) => (
                    <motion.tr 
                      key={w._id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                      className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Worker Details (Avatar + Name + Email) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm font-bold shrink-0">
                            {getInitials(w.user?.name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-zinc-900 dark:text-white">{w.user?.name || 'Unknown'}</p>
                              {w.user?.isSuspended && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 uppercase tracking-wider">Banned</span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-zinc-500">{w.user?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Profession */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{w.profession || 'Not set'}</p>
                        {w.experienceYears && (
                          <p className="text-xs font-medium text-zinc-500">{w.experienceYears} years exp.</p>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{w.location?.city || '—'}</p>
                      </td>

                      {/* Rating */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">{w.ratingAvg?.toFixed?.(1) || '0.0'}</span>
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${getVerificationStyles(w.verification?.status)}`}>
                          {w.verification?.status || 'Unverified'}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/workers/${w._id}`} 
                          title="View Profile"
                          className="inline-flex p-2 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-orange-500 dark:border-white/10 dark:bg-transparent dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-orange-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}