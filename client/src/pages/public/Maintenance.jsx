import { motion } from 'framer-motion';

export default function Maintenance() {
  const checkStatus = () => {
    // Sends them back to the home page to see if the app is back online
    window.location.href = '/'; 
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-lg bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 mx-auto bg-orange-100 dark:bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-orange-200 dark:border-orange-500/20"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </motion.div>

          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-4">
            Under Maintenance
          </h1>
          
          <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-8">
            WorkMitra is currently undergoing scheduled upgrades to serve you better. We will be back online shortly. Thank you for your patience!
          </p>

          <button 
            onClick={checkStatus}
            className="w-full h-14 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Check Status & Reload
          </button>

          {/* Hidden backdoor link for admins to still access the login page if they need it */}
          <div className="mt-8">
            <a href="/login" className="text-xs font-bold text-zinc-400 hover:text-orange-500 transition-colors">
              Admin Access
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}