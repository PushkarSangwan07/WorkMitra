import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {toast} from 'sonner';
import adminService from '../../services/admin.service';
import Loader from '../../components/common/Loader';

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadReviews = () => {
    setLoading(true);
    adminService.getAllReviews()
      .then((res) => setReviews(res.reviews || []))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review? This will remove it from the worker\'s profile.')) return;
    
    try {
      await adminService.deleteReview(id);
      toast.success('Review deleted successfully');
      setReviews(reviews.filter(r => r._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete review');
    }
  };

  // Filter Logic: Show all, or filter by specific star ratings (e.g., '1' for 1-star reviews)
  const filteredReviews = activeFilter === 'all' 
    ? reviews 
    : reviews.filter(r => {
        if (activeFilter === 'critical') return r.rating <= 2;
        if (activeFilter === 'positive') return r.rating >= 4;
        return true;
      });

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg key={star} className={`w-4 h-4 ${star <= rating ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-600'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) return <Loader text="Loading reviews..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 px-4 max-w-7xl mx-auto pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Review Moderation</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Monitor platform quality and remove abusive feedback</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 pb-2">
        {[{ id: 'all', label: 'All Reviews' }, { id: 'critical', label: 'Critical (1-2 Stars)' }, { id: 'positive', label: 'Positive (4-5 Stars)' }].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeFilter === tab.id 
                ? 'text-white' 
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
            }`}
          >
            {activeFilter === tab.id && (
              <motion.div 
                layoutId="reviewTabIndicator"
                className={`absolute inset-0 rounded-xl -z-10 shadow-lg ${
                  tab.id === 'critical' ? 'bg-red-500 shadow-red-500/20' : tab.id === 'positive' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-zinc-900 dark:bg-white'
                }`}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className={activeFilter === tab.id && tab.id === 'all' ? 'dark:text-zinc-900' : ''}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <AnimatePresence>
        {filteredReviews.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl">
            <p className="text-sm font-bold text-zinc-500">No reviews found for this filter.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReviews.map((r, index) => (
              <motion.div 
                key={r._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col justify-between group"
              >
                <div>
                  {/* Reviewer Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                        {getInitials(r.customer?.name)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{r.customer?.name || 'Unknown'}</p>
                        <p className="text-xs font-medium text-zinc-500">
                          {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-black/50 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-white/5">
                      {renderStars(r.rating)}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="mb-6 relative">
                    <svg className="absolute -top-2 -left-2 w-8 h-8 text-zinc-200 dark:text-white/5 -z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed pl-2 border-l-2 border-orange-500">
                      "{r.comment || 'No comment provided.'}"
                    </p>
                  </div>
                </div>

                {/* Footer: Worker Info & Delete Button */}
                <div className="pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between mt-auto">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Reviewed Worker</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      {r.worker?.user?.name || 'Unknown Worker'}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDelete(r._id)}
                    title="Delete Review"
                    className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}