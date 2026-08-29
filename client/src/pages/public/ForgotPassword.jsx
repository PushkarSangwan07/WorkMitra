import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/auth.service';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const msg = await authService.forgotPassword(email);
      setMessage(msg);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot password?</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Enter your email and we'll send you a reset link.
        </p>

        {message && (
          <div className="mt-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-3 py-2 rounded-md">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-md"
          >
            {submitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link to="/login" className="text-primary-600 font-medium hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
