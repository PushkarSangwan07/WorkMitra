import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {toast} from 'sonner';
import adminService from '../../services/admin.service';
import Loader from '../../components/common/Loader';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platformFeePercentage: 10,
    supportEmail: '',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    adminService.getSettings()
      .then((res) => {
        if (res) setSettings(res);
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminService.updateSettings(settings);
      toast.success('Global settings updated successfully!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <Loader text="Loading settings..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 px-4 max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Global Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Master control panel for the WorkMitra platform</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Financial Settings Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white">Financials</h2>
              <p className="text-sm font-medium text-zinc-500">Configure platform fees and commissions</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest ml-1">Platform Commission Fee (%)</label>
            <div className="relative mt-2 max-w-xs">
              <input 
                type="number" 
                min="0" 
                max="100"
                required 
                value={settings.platformFeePercentage} 
                onChange={(e) => setSettings({...settings, platformFeePercentage: Number(e.target.value)})} 
                className="w-full h-12 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/50 pl-4 pr-10 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all" 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">%</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2 ml-1">This is the percentage WorkMitra takes from every completed booking.</p>
          </div>
        </motion.div>

        {/* General Settings Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white">Support & Contact</h2>
              <p className="text-sm font-medium text-zinc-500">How users get in touch with the platform</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest ml-1">Official Support Email</label>
            <input 
              type="email" 
              required 
              value={settings.supportEmail} 
              onChange={(e) => setSettings({...settings, supportEmail: e.target.value})} 
              placeholder="e.g. support@workmitra.com"
              className="w-full max-w-md h-12 mt-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/50 px-4 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500 transition-all" 
            />
          </div>
        </motion.div>

        {/* Danger Zone (Maintenance Mode) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-3xl p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-red-700 dark:text-red-400">Danger Zone</h2>
              <p className="text-sm font-medium text-red-600/80 dark:text-red-400/80">Critical platform controls</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-5 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-red-100 dark:border-red-500/20">
            <div>
              <p className="font-bold text-zinc-900 dark:text-white">Maintenance Mode</p>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">Disable access for all non-admin users. Use only during major updates.</p>
            </div>
            
            {/* Custom Toggle Switch */}
            <button
              type="button"
              onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${settings.maintenanceMode ? 'bg-red-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isSaving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            )}
            {isSaving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>

      </form>
    </motion.div>
  );
}