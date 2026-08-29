import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {toast} from 'sonner';
import authService from '../../services/auth.service';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset link is invalid or expired');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-gray-700 dark:text-gray-200">Missing reset token.</p>
          <Link to="/forgot-password" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset password</h1>

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-md"
          >
            {submitting ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}
