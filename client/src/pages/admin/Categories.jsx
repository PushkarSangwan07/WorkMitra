import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {toast} from 'sonner';
import adminService from '../../services/admin.service';
import Loader from '../../components/common/Loader';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Form State
  const [newCat, setNewCat] = useState({ name: '', description: '', icon: '🔧' });

  const loadCategories = () => {
    setLoading(true);
    adminService.getCategories()
      .then((res) => setCategories(res))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCategories(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminService.createCategory(newCat);
      toast.success('Category added successfully!');
      setShowModal(false);
      setNewCat({ name: '', description: '', icon: '🔧' }); // reset
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await adminService.deleteCategory(id);
      toast.success('Category deleted');
      setCategories(categories.filter(c => c._id !== id));
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await adminService.syncCategories();
      toast.success(res.message);
      if (res.addedCount > 0) loadCategories(); // Refresh the grid if new ones were added
    } catch (err) {
      toast.error('Failed to sync categories');
    } finally {
      setIsSyncing(false);
    }
  };

  const popularIcons = ['🔧', '🧹', '⚡', '💻', '🎨', '🍳', '🚗', '🔨', '📦', '✂️'];

  if (loading) return <Loader text="Loading categories..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 px-4 max-w-7xl mx-auto pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Service Categories</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Manage the core services offered on WorkMitra</p>
        </div>
        
        <div className="flex gap-3">
          {/* NEW SYNC BUTTON */}
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="h-12 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSyncing ? (
              <span className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            )}
            Auto-Sync Workers
          </button>

          <button 
            onClick={() => setShowModal(true)}
            className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            Add New
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl">
          <p className="text-sm font-bold text-zinc-500">No categories found. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, index) => (
            <motion.div 
              key={cat._id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex items-start justify-between group hover:border-orange-500/50 transition-colors"
            >
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 flex items-center justify-center text-2xl shadow-inner">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-1">{cat.name}</h3>
                  <p className="text-sm font-medium text-zinc-500 leading-relaxed line-clamp-2">
                    {cat.description || 'No description provided.'}
                  </p>
                  <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(cat._id, cat.name)}
                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-6">Create Category</h3>
              
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest ml-1">Category Name</label>
                  <input required value={newCat.name} onChange={(e) => setNewCat({...newCat, name: e.target.value})} placeholder="e.g. Electrician" className="w-full h-12 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/50 px-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea rows="2" value={newCat.description} onChange={(e) => setNewCat({...newCat, description: e.target.value})} placeholder="Briefly describe this service..." className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/50 p-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all resize-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest ml-1">Select an Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {popularIcons.map(icon => (
                      <button key={icon} type="button" onClick={() => setNewCat({...newCat, icon})} className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${newCat.icon === icon ? 'bg-orange-500 shadow-lg shadow-orange-500/30 border-orange-500' : 'bg-zinc-100 dark:bg-white/5 border-transparent hover:bg-zinc-200 dark:hover:bg-white/10 border'} border`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-12 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 h-12 bg-orange-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none">
                    {isSubmitting ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}