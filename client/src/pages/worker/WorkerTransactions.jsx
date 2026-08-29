import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

export default function WorkerTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/workers/me/history')
      .then((res) => {
        const data = res.data?.data?.transactions || [];
        setTransactions(data);
      })
      .catch((err) => {
        console.error("Failed to load revenue history:", err);
        setTransactions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Calculate summaries dynamically
  const { totalEarnings, totalFees } = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      if (tx.type === 'credit') acc.totalEarnings += tx.amount;
      if (tx.type === 'debit') acc.totalFees += Math.abs(tx.amount);
      return acc;
    }, { totalEarnings: 0, totalFees: 0 });
  }, [transactions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#030303] pt-32 flex items-center justify-center">
        <Loader size="lg" text="Syncing financial ledger..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#030303] w-full max-w-[100vw] overflow-x-hidden text-zinc-900 dark:text-zinc-50 font-sans relative pt-24 md:pt-32 pb-32 transition-colors duration-300">
      
      {/* ── AMBIENT BACKGROUND GLOW ── */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center items-start overflow-hidden">
        <div className="absolute top-[-10%] w-full max-w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.08)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.12)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 mb-4 text-xs font-bold uppercase tracking-wider font-mono">
              Ledger & Statements
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
              Financial History
            </h1>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
              Detailed breakdown of your earnings, platform fees, and settlements.
            </p>
          </div>
        </div>

        {/* ── SUMMARY CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Earnings Summary */}
          <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">Total Net Earnings</p>
              <p className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                ₹{totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Fees Summary */}
          <div className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/5 rounded-3xl p-6 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">Total Platform Fees</p>
              <p className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
                ₹{totalFees.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* ── DETAILED TRANSACTION LIST ── */}
        <div className="bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-white/[0.07] rounded-3xl overflow-hidden shadow-xl transition-colors duration-300">
          
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Recent Activity</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4 text-orange-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-base font-bold text-zinc-900 dark:text-white">No transactions recorded yet.</p>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Completed jobs and fee deductions will appear here automatically with full details.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-white/[0.05]">
              {transactions.map((tx, index) => {
                const isCredit = tx.type === 'credit';
                const isSettlement = tx.title.toLowerCase().includes('settlement') || tx.title.toLowerCase().includes('dues cleared');
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    key={tx._id}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      
                      {/* Detailed Icon */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isSettlement 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          : isCredit 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                      }`}>
                        {isSettlement ? (
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        ) : isCredit ? (
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" /></svg>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-zinc-900 dark:text-white truncate">
                          {tx.title}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                            {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                          <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
                          {/* Transaction ID Badge */}
                          <p className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                            TXN-{tx._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center mt-2 sm:mt-0 ml-16 sm:ml-0">
                      <p className={`text-lg sm:text-xl font-black tracking-tight ${
                        isSettlement ? 'text-blue-600 dark:text-blue-400' :
                        isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-white'
                      }`}>
                        {isCredit || isSettlement ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString()}
                      </p>
                      <span className={`inline-block text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 ${
                        isSettlement 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}