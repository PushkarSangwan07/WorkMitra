import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import adminService from '../../services/admin.service';
import Loader from '../../components/common/Loader';

// Helper to generate initials for avatars
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

// Helper for Status Badge styling
const getStatusStyles = (status) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    accepted: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    in_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20',
  };
  return styles[status] || 'bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-300 border-zinc-200 dark:border-white/10';
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // NEW: Filter State

  useEffect(() => {
    adminService.getAllBookings().then((res) => setBookings(res.bookings)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading bookings..." />;

  // NEW: Filter Logic
  const filteredBookings = activeTab === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === activeTab);

  const tabs = [
    { id: 'all', label: 'All Bookings' },
    { id: 'pending', label: 'Pending' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 px-4 max-w-7xl mx-auto pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Bookings Directory</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Manage and track all service requests</p>
        </div>
      </div>

      {/* NEW: Interactive Status Tabs */}
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
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-orange-500 rounded-xl -z-10 shadow-lg shadow-orange-500/20"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {tab.label}
            {/* Show count on the 'All' tab */}
            {tab.id === 'all' && (
              <span className={`ml-2 px-2 py-0.5 rounded-md text-xs ${activeTab === 'all' ? 'bg-white/20' : 'bg-zinc-200 dark:bg-white/10'}`}>
                {bookings.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Premium Table Container */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-black/50 border-b border-zinc-200 dark:border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Worker</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
              <AnimatePresence>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No bookings found for this status.</p>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b, index) => (
                    <motion.tr 
                      key={b._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Customer Info (Name + Email) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">
                            {getInitials(b.customer?.name)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white">{b.customer?.name || 'Unknown'}</p>
                            <p className="text-xs font-medium text-zinc-500">{b.customer?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Worker Info (Name + Email) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center text-sm font-bold shrink-0">
                            {getInitials(b.worker?.user?.name)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-white">{b.worker?.user?.name || 'Unknown'}</p>
                            <p className="text-xs font-medium text-zinc-500">{b.worker?.user?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Date formatting */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {/* If you have time in your DB, you can add it here. Otherwise, show a subtle "Created" tag */}
                        <p className="text-xs font-medium text-zinc-500 mt-0.5">Booking Date</p>
                      </td>

                      {/* Dynamic Status Badge */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${getStatusStyles(b.status)}`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-black text-zinc-900 dark:text-white">
                          ₹{b.totalAmount ? b.totalAmount.toLocaleString() : '0'}
                        </p>
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