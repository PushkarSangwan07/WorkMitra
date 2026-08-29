import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EFEBE2] dark:bg-[#0a0a0a] text-[#16140F] dark:text-[#f4f4f5] font-['Work_Sans',sans-serif] transition-colors duration-300">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}