import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {toast} from 'sonner';
import adminService from '../../services/admin.service';
import Loader from '../../components/common/Loader';

export default function AdminTransactions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getFinancials()
      .then((res) => setData(res))
      .catch(() => toast.error('Failed to load financial data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading financial records..." />;
  if (!data) return <div className="text-center py-20 text-zinc-500 font-bold">Failed to load data.</div>;

  const { stats, transactions } = data;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 px-4 max-w-7xl mx-auto pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Financial Overview</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Track platform revenue, total volume, and worker payouts</p>
        </div>
        <div className="bg-zinc-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-0.5">Current Fee Rate</p>
          <p className="text-lg font-black text-orange-500">{stats.feePercentage}%</p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Total Volume */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Gross Volume</p>
          <p className="text-4xl font-black text-zinc-900 dark:text-white mb-1">
            ₹{stats.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm font-medium text-zinc-400">Total money processed</p>
        </motion.div>

        {/* Platform Earnings (WorkMitra's Cut) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 shadow-xl shadow-emerald-500/20 text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-2">WorkMitra Revenue</p>
          <p className="text-4xl font-black mb-1">
            ₹{stats.totalPlatformEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm font-medium text-emerald-100">Your total profit</p>
        </motion.div>

        {/* Worker Earnings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Worker Earnings</p>
          <p className="text-4xl font-black text-zinc-900 dark:text-white mb-1">
            ₹{stats.totalWorkerEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm font-medium text-zinc-400">Total paid to workers</p>
        </motion.div>

      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
          <h2 className="text-lg font-black text-zinc-900 dark:text-white">Recent Transactions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/10">
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Parties</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Total Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50/50 dark:bg-emerald-500/5">Platform Fee</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-right">Worker Payout</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
              <AnimatePresence>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <p className="text-sm font-bold text-zinc-500">No completed transactions yet.</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((t, index) => (
                    <motion.tr 
                      key={t._id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                      className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Date & ID */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase mt-1">ID: {t._id.substring(t._id.length - 6)}</p>
                      </td>

                      {/* Customer & Worker */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          {t.customerName}
                        </p>
                        <p className="text-sm font-bold text-zinc-500 flex items-center gap-2 mt-1">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          {t.workerName}
                        </p>
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-zinc-900 dark:text-white">
                          ₹{t.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </td>

                      {/* Platform Fee (Highlighted) */}
                      <td className="px-6 py-4 bg-emerald-50/30 dark:bg-emerald-500/5">
                        <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          + ₹{t.platformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </td>

                      {/* Worker Payout */}
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">
                          ₹{t.workerPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                          {t.status}
                        </span>
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