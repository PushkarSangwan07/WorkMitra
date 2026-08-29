import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import favoriteService from '../../services/favorite.service';
import Loader from '../../components/common/Loader';

// Framer motion variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function CustomerFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    favoriteService.getMyFavorites()
      .then(setFavorites)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (workerId) => {
    // Optimistic UI update for instant feedback
    setFavorites((prev) => prev.filter((f) => f.worker?._id !== workerId));
    
    try {
      await favoriteService.removeFavorite(workerId);
      toast.success('Removed from favorites');
    } catch {
      toast.error('Could not remove favorite');
      load(); // Revert if failed
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-32 flex items-center justify-center">
      <Loader size="lg" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pt-24 pb-12 px-4 sm:px-6">
      
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            Saved Workers
            <svg className="w-8 h-8 text-rose-500 fill-rose-500" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
            Professionals you've bookmarked for quick access.
          </p>
        </div>
      </motion.div>

      {/* ── Content Area ── */}
      {favorites.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="text-center py-20 px-4 rounded-[2rem] bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 border-dashed"
        >
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rose-500 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No favorites yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto mb-6">
            When you see a worker you like, click the heart icon on their profile to save them here for later.
          </p>
          <Link 
            to="/search" 
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            Browse Workers
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          variants={container} 
          initial="hidden" 
          animate="show" 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {favorites.map((f) => {
              const workerId = f.worker?._id;
              const name = f.worker?.user?.name || 'Unknown Worker';
              const initials = name.substring(0, 2).toUpperCase();
              
              return (
                <motion.div 
                  key={f._id} 
                  variants={item}
                  exit="exit"
                  layout
                  className="group relative bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-zinc-300 dark:hover:border-white/10 transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-4">
                    
                    {/* Avatar & Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center text-white font-black text-lg shadow-inner shrink-0">
                        {initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-white line-clamp-1">{name}</h3>
                        <p className="text-sm font-medium text-orange-500 dark:text-orange-400 line-clamp-1">
                          {f.worker?.profession || 'Professional'}
                        </p>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => remove(workerId)} 
                      className="p-2 -mr-2 -mt-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      title="Remove from favorites"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                    <Link 
                      to={`/workers/${workerId}`} 
                      className="text-sm font-bold text-zinc-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors flex items-center gap-1"
                    >
                      View Profile
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}