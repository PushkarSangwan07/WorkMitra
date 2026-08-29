import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

// Clean layout for auth pages — no navbar, no footer
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#080808]">
        <Navbar />
      <Outlet />
    </div>
  );
}