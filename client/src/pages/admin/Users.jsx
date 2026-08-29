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

// Helper for Role Badge styling
const getRoleStyles = (role) => {
  const styles = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    worker: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
    customer: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  };
  return styles[role] || 'bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-300 border-zinc-200 dark:border-white/10';
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(''); // Replaces the old 'role' select state
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    // Use activeTab as the role filter for the backend
    adminService.getAllUsers({ search, role: activeTab }).then((res) => setUsers(res.users)).finally(() => setLoading(false));
  }, [search, activeTab]);

  useEffect(() => { 
    // Adding a slight debounce so typing doesn't spam the backend instantly
    const delayDebounceFn = setTimeout(() => { load(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [load]);

  const toggleSuspend = async (u) => {
    try {
      if (u.isSuspended) {
        await adminService.unsuspendUser(u._id);
        toast.success(`${u.name} has been unsuspended`);
      } else {
        await adminService.suspendUser(u._id);
        toast.success(`${u.name} has been suspended`);
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${u.name}? This action cannot be undone.`)) return;
    try {
      await adminService.deleteUser(u._id);
      toast.success('User deleted successfully');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const tabs = [
    { id: '', label: 'All Users' },
    { id: 'customer', label: 'Customers' },
    { id: 'worker', label: 'Workers' },
    { id: 'admin', label: 'Admins' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 px-4 max-w-7xl mx-auto pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">User Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">View and manage all registered accounts on the platform</p>
        </div>
      </div>

      {/* Controls: Search and Tabs */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative w-full lg:max-w-md">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all shadow-sm"
          />
        </div>

        {/* Animated Role Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 lg:ml-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'text-white' 
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="userRoleTabIndicator"
                  className="absolute inset-0 bg-zinc-900 dark:bg-white rounded-xl -z-10 shadow-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={activeTab === tab.id ? 'dark:text-zinc-900' : ''}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Premium Table Container */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader text="Fetching users..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 dark:bg-black/50 border-b border-zinc-200 dark:border-white/10">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">User Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Join Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                <AnimatePresence>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                          <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                          <p className="text-sm font-bold">No users found matching your criteria.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((u, index) => (
                      <motion.tr 
                        key={u._id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                        className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* User Details (Avatar + Name + Email) */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 flex items-center justify-center text-sm font-bold shrink-0">
                              {getInitials(u.name)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-900 dark:text-white">{u.name}</p>
                              <p className="text-xs font-medium text-zinc-500">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${getRoleStyles(u.role)}`}>
                            {u.role}
                          </span>
                        </td>

                        {/* Join Date */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {u.isSuspended ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 animate-pulse" />
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                              Active
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {u.role !== 'admin' && (
                              <>
                                {/* Suspend/Unsuspend Button */}
                                <button 
                                  onClick={() => toggleSuspend(u)} 
                                  title={u.isSuspended ? "Restore Account" : "Suspend Account"}
                                  className={`p-2 rounded-lg transition-colors border ${
                                    u.isSuspended 
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20' 
                                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-transparent dark:text-zinc-400 dark:hover:bg-white/5'
                                  }`}
                                >
                                  {u.isSuspended ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                  )}
                                </button>
                                
                                {/* Delete Button */}
                                <button 
                                  onClick={() => remove(u)} 
                                  title="Delete User"
                                  className="p-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}