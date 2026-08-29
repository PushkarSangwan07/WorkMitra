import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import adminService from '../../services/admin.service'; // Adjust path
import Loader from '../../components/common/Loader';

export default function AdminRevenue() {
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getRevenueLedger()
      .then((data) => setLedger(data))
      .catch(() => toast.error('Failed to load financial data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading ledger..." />;

  const { stats, topDebtors } = ledger;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 px-4 max-w-7xl mx-auto pb-12">
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Financial Ledger</h1>
        <p className="text-zinc-500 font-medium mt-1">Track platform revenue and pending worker dues.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 rounded-3xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
          <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Pending Dues</p>
          <h2 className="text-4xl font-black">₹{stats.pendingDues.toLocaleString()}</h2>
          <p className="text-xs font-medium mt-2 opacity-80">Money owed to WorkMitra</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10">
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Active Debtors</p>
          <h2 className="text-4xl font-black text-zinc-900 dark:text-white">{stats.debtorsCount}</h2>
          <p className="text-xs font-medium text-zinc-500 mt-2">Workers with negative balances</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10">
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Total Worker Payouts</p>
          <h2 className="text-4xl font-black text-zinc-900 dark:text-white">₹{stats.totalWorkerEarnings.toLocaleString()}</h2>
          <p className="text-xs font-medium text-zinc-500 mt-2">All-time earnings via platform</p>
        </motion.div>
      </div>

      {/* Debtors Ledger Table */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white">Outstanding Balances</h3>
          <span className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold rounded-full">
            Top 50 Debtors
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-white/5 text-xs uppercase tracking-widest text-zinc-500">
                <th className="p-4 font-bold">Worker Name</th>
                <th className="p-4 font-bold">Contact</th>
                <th className="p-4 font-bold">Profession</th>
                <th className="p-4 font-bold text-right">Balance Due</th>
                <th className="p-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
              {topDebtors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-zinc-500 font-medium">
                    No workers currently owe platform dues. 🎉
                  </td>
                </tr>
              ) : (
                topDebtors.map((worker) => {
                  const isLocked = worker.walletBalance <= -500;
                  const isWarning = worker.walletBalance <= -400 && !isLocked;
                  
                  return (
                    <tr key={worker._id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-zinc-900 dark:text-white">{worker.user?.name || 'Unknown'}</p>
                      </td>
                      <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                        {worker.user?.phone || 'N/A'}
                      </td>
                      <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                        {worker.profession}
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-black text-red-600 dark:text-red-400">
                          ₹{Math.abs(worker.walletBalance).toLocaleString()}
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Locked
                          </span>
                        ) : isWarning ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Near Limit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-400 text-xs font-bold">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

    </motion.div>
  );
}