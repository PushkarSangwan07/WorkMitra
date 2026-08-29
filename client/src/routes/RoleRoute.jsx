import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Usage: <Route element={<RoleRoute allowedRoles={['admin']} />}>...</Route>
// Must be nested inside a <ProtectedRoute /> so isAuthenticated is already guaranteed.
export default function RoleRoute({ allowedRoles = [] }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
