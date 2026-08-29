import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import adminService from '../../services/admin.service';
import Loader from '../../components/common/Loader';

// --- Premium SVG Icons ---
const Icons = {
  users: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  worker: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.827M15.75 15.75l-2.25-2.25m0 0l-1.5-1.5m1.5 1.5l1.5-1.5m-1.5 1.5l-1.5 1.5m4.5 4.5l-1.5-1.5m1.5 1.5l1.5-1.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15zm0 0v1.5m0 0h1.5m-1.5 0H9m1.5 0v1.5" /></svg>,
  booking: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3h5.25m-5.25 3h5.25" /></svg>,
  revenue: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

function StatCard({ label, value, icon, color = 'orange', delay = 0 }) {
  const colorMap = {
    orange: 'from-orange-500 to-amber-500 shadow-orange-500/20 text-orange-50',
    blue: 'from-blue-500 to-cyan-500 shadow-blue-500/20 text-blue-50',
    purple: 'from-purple-500 to-fuchsia-500 shadow-purple-500/20 text-purple-50',
    green: 'from-emerald-500 to-teal-500 shadow-emerald-500/20 text-emerald-50',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${colorMap[color]} p-6 shadow-xl`}
    >
      {/* Decorative background shape */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wider uppercase opacity-80 mb-2">{label}</p>
          <p className="text-4xl font-black tracking-tight">{value}</p>
        </div>
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
          <div className="w-6 h-6 text-white">{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/10 p-4 rounded-2xl shadow-xl">
        <p className="text-sm font-bold text-zinc-900 dark:text-white mb-1">{label || payload[0].name}</p>
        <p className="text-lg font-black text-orange-500">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getAnalytics().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading analytics..." />;
  if (!stats) return <div className="flex h-[50vh] items-center justify-center"><p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Could not load analytics</p></div>;

  // Formatting Donut Chart Data
  const userBreakdownData = [
    { name: 'Customers', value: stats.totalCustomers, color: '#8b5cf6' }, // Purple
    { name: 'Workers', value: stats.totalWorkers, color: '#f97316' },     // Orange
  ];

  const bookingStatusData = [
    { name: 'Active', value: stats.activeBookings, color: '#3b82f6' },    // Blue
    { name: 'Completed', value: stats.completedBookings, color: '#10b981' } // Green
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 px-4 max-w-7xl mx-auto pb-12">
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Platform Analytics</h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Real-time overview of WorkMitra's performance</p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard delay={0.1} label="Total Users" value={stats.totalUsers?.toLocaleString()} icon={Icons.users} color="purple" />
        <StatCard delay={0.2} label="Total Workers" value={stats.totalWorkers?.toLocaleString()} icon={Icons.worker} color="orange" />
        <StatCard delay={0.3} label="Total Bookings" value={stats.totalBookings?.toLocaleString()} icon={Icons.booking} color="blue" />
        <StatCard delay={0.4} label="Total Revenue" value={`₹${stats.totalRevenue?.toLocaleString()}`} icon={Icons.revenue} color="green" />
      </div>

      {/* Middle Section: Donut Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Bookings Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Booking Status</p>
            <div className="space-y-4">
              {bookingStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{item.value.toLocaleString()}</p>
                    <p className="text-xs font-medium text-zinc-500">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={bookingStatusData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                  {bookingStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Users Donut */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">User Breakdown</p>
            <div className="space-y-4">
              {userBreakdownData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{item.value.toLocaleString()}</p>
                    <p className="text-xs font-medium text-zinc-500">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={userBreakdownData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                  {userBreakdownData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section: Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Professions Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-sm"
        >
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Top Professions</p>
          {stats.topProfessions?.length === 0 ? (
            <p className="text-sm font-medium text-zinc-400 py-12 text-center">No profession data yet.</p>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topProfessions} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <defs>
                    <linearGradient id="colorProf" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#52525b" strokeOpacity={0.2} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="profession" width={100} tick={{ fontSize: 12, fill: '#71717a', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(249, 115, 22, 0.05)' }} content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="url(#colorProf)" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Cities Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-sm"
        >
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Most Active Cities</p>
          {stats.topCities?.length === 0 ? (
            <p className="text-sm font-medium text-zinc-400 py-12 text-center">No city data yet.</p>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topCities} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <defs>
                    <linearGradient id="colorCity" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#d946ef" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#52525b" strokeOpacity={0.2} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="city" width={100} tick={{ fontSize: 12, fill: '#71717a', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }} content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="url(#colorCity)" radius={[0, 8, 8, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}







