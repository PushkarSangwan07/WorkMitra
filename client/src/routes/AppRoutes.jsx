import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

import Loader from '../components/common/Loader';

// ---- Public ----
const Home = lazy(() => import('../pages/public/Home'));
const About = lazy(() => import('../pages/public/About'));
const Services = lazy(() => import('../pages/public/Services'));
const SearchWorkers = lazy(() => import('../pages/public/SearchWorkers'));
const WorkerProfile = lazy(() => import('../pages/public/WorkerProfile'));
const Login = lazy(() => import('../pages/public/Login'));
const Register = lazy(() => import('../pages/public/Register'));
const ForgotPassword = lazy(() => import('../pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/public/ResetPassword'));
const Contact = lazy(() => import('../pages/public/Contact'));
const Terms = lazy(() => import('../pages/public/TermsOfServices'));
const Privacy = lazy(() => import('../pages/public/Privacy'));
const NotFound = lazy(() => import('../pages/public/NotFound'));
const Maintenance = lazy(() => import('../pages/public/Maintenance'));
const AIWorkerMatching = lazy(() => import('../pages/public/AIWorkerMatching'));

// ---- Chat (shared) ----
const Chat = lazy(() => import('../pages/chat/Chat'));

// ---- Customer ----
const CustomerDashboard = lazy(() => import('../pages/customer/Dashboard'));
const CustomerBookings = lazy(() => import('../pages/customer/Bookings'));
const CustomerFavorites = lazy(() => import('../pages/customer/Favorites'));

// ---- Worker ----
const WorkerDashboard = lazy(() => import('../pages/worker/Dashboard'));
const WorkerEarnings = lazy(() => import('../pages/worker/Earnings'));
const WorkerBookingRequests = lazy(() => import('../pages/worker/BookingRequests'));
const WorkerProfileEdit = lazy(() => import('../pages/worker/Profile'));
const WorkerOnboarding = lazy(() => import('../pages/worker/Onboarding'));
const WorkerWallet = lazy(() => import('../pages/worker/WorkerWallet'));
const WorkerTransactions = lazy(() => import('../pages/worker/WorkerTransactions'));

// ---- Admin ----
const AdminAnalytics = lazy(() => import('../pages/admin/Analytics'));
const AdminUsers = lazy(() => import('../pages/admin/Users'));
const AdminWorkers = lazy(() => import('../pages/admin/Workers'));
const AdminBookings = lazy(() => import('../pages/admin/Bookings'));
const AdminVerification = lazy(() => import('../pages/admin/Verification'));
const AdminReports = lazy(() => import('../pages/admin/Reports'));
const AdminReviews = lazy(() => import('../pages/admin/AdminReviews'));
const AdminCategories = lazy(() => import('../pages/admin/Categories'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));
const AdminTransactions = lazy(() => import('../pages/admin/AdminTransaction'));
const AdminRevenue = lazy(() => import('../pages/admin/AdminRevenue'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/search" element={<SearchWorkers />} />
          <Route path="/workers/:id" element={<WorkerProfile />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/find-my-worker" element={<AIWorkerMatching />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Authenticated routes (any logged-in role) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/chat" element={<Chat />} />
          </Route>

          {/* Customer */}
          <Route element={<RoleRoute allowedRoles={['customer']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/bookings" element={<CustomerBookings />} />
              <Route path="/customer/favorites" element={<CustomerFavorites />} />
            </Route>
          </Route>

          {/* Worker */}
          <Route element={<RoleRoute allowedRoles={['worker']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/worker/dashboard" element={<WorkerDashboard />} />
              <Route path="/worker/profile" element={<WorkerProfileEdit />} />
              <Route path="/worker/onboarding" element={<WorkerOnboarding />} />
              <Route path="/worker/earnings" element={<WorkerEarnings />} />
              <Route path="/worker/bookings" element={<WorkerBookingRequests />} />
              <Route path="/worker/wallet" element={<WorkerWallet />} />
              <Route path="/worker/transactions" element={<WorkerTransactions />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/workers" element={<AdminWorkers />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/verification" element={<AdminVerification />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/transactions" element={<AdminTransactions />} />
              <Route path="/admin/revenue" element={<AdminRevenue />} />
            </Route>
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}