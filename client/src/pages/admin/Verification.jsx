import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {toast} from 'sonner';
import adminService from '../../services/admin.service';
import Loader from '../../components/common/Loader';

// Helper to generate initials for avatars
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function AdminVerification() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminService.getVerificationRequests({ status: 'pending' })
      .then((res) => setRequests(res.requests))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const decide = async (id, decision, actionType = 'standard') => {
    let note = '';
    
    if (actionType === 'reupload') {
      const reason = window.prompt('Why do they need to re-upload? (e.g., "ID is blurry"):');
      if (reason === null) return; // User clicked cancel
      if (!reason.trim()) return toast.error('A reason is required to request a re-upload.');
      note = `ACTION REQUIRED: Please re-upload your documents. Reason: ${reason}`;
    } else if (decision === 'rejected') {
      const reason = window.prompt('Reason for permanent rejection (optional):');
      if (reason === null) return; // User clicked cancel
      note = reason;
    }

    try {
      await adminService.reviewVerification(id, decision, note);
      if (actionType === 'reupload') {
        toast.success('Worker notified to re-upload documents.');
      } else {
        toast.success(`Verification ${decision} successfully.`);
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <Loader text="Loading pending requests..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 px-4 max-w-7xl mx-auto pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Verification Queue</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Review identity documents and approve worker profiles</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-500/20">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-sm font-bold">{requests.length} Pending</span>
        </div>
      </div>

      <AnimatePresence>
        {requests.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">You're all caught up!</h3>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">There are no pending verification requests at the moment.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {requests.map((r, index) => (
              <motion.div 
                key={r._id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm flex flex-col"
              >
                {/* Card Header (Worker Info) */}
                <div className="p-6 border-b border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-black shrink-0 shadow-inner">
                      {getInitials(r.worker?.user?.name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-zinc-900 dark:text-white">{r.worker?.user?.name || 'Unknown User'}</h3>
                      <p className="text-sm font-medium text-zinc-500">{r.worker?.user?.email}</p>
                      <span className="inline-block mt-2 px-2.5 py-1 rounded-md text-xs font-bold bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300">
                        {r.worker?.profession || 'Profession not set'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submitted Documents Section */}
                <div className="p-6 flex-1">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Submitted Documents</h4>
                  <div className="space-y-3">
                    {r.documents?.length > 0 ? (
                      r.documents.map((d, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/50 hover:border-orange-500/30 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-900 dark:text-white">Document {i + 1}</p>
                              <p className="text-xs text-zinc-500 font-medium">Uploaded for verification</p>
                            </div>
                          </div>
                          
                          {/* File Actions */}
                          <div className="flex gap-2">
                            <a href={d.url} target="_blank" rel="noreferrer" title="View Document" className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors shadow-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </a>
                            {/* Adding the download attribute prompts the browser to save it rather than just open it */}
                            <a href={d.url} download={`Worker_Document_${i+1}`} target="_blank" rel="noreferrer" title="Download Document" className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors shadow-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500 italic">No documents provided.</p>
                    )}
                  </div>
                </div>

                {/* Card Footer (Actions) */}
                <div className="p-6 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.02] flex flex-wrap gap-3">
                  <button 
                    onClick={() => decide(r._id, 'approved')} 
                    className="flex-1 min-w-[120px] h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Approve
                  </button>

                  <button 
                    onClick={() => decide(r._id, 'rejected', 'reupload')} 
                    className="flex-1 min-w-[140px] h-11 bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Need Re-upload
                  </button>

                  <button 
                    onClick={() => decide(r._id, 'rejected')} 
                    className="flex-1 min-w-[120px] h-11 bg-white hover:bg-red-50 text-red-600 dark:bg-transparent dark:hover:bg-red-500/10 dark:text-red-400 border border-zinc-200 dark:border-white/10 hover:border-red-200 dark:hover:border-red-500/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Reject
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