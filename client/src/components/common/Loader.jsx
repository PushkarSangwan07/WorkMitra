import { motion } from 'framer-motion';

export default function Loader({ size = 'md', text = '' }) {
  // Upgraded sizes to be slightly more prominent and well-proportioned
  const sizes = { 
    sm: 'w-6 h-6 border-2', 
    md: 'w-10 h-10 border-[3px]', 
    lg: 'w-14 h-14 border-[3px]' 
  };

  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 w-full">
      <div className={`relative flex items-center justify-center ${dimensions[size]}`}>
        
        {/* ── Background Track ── */}
        <div className={`absolute inset-0 rounded-full border-zinc-200 dark:border-zinc-800 ${sizes[size].split(' ')[2]}`} />
        
        {/* ── Spinning Highlight (The Glow) ── */}
        <motion.div 
          className={`absolute inset-0 rounded-full border-transparent border-t-orange-500 border-r-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] ${sizes[size].split(' ')[2]}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        {/* ── Inner Pulsing Core ── */}
        <motion.div 
          className="rounded-full bg-orange-500/20 dark:bg-orange-500/30"
          style={{ width: '40%', height: '40%' }}
          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
      </div>

      {/* ── Loading Text ── */}
      {text && (
        <motion.p 
          initial={{ opacity: 0, y: 5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-sm font-bold tracking-wide text-zinc-500 dark:text-zinc-400 animate-pulse"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}