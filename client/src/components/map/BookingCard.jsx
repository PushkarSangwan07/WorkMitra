import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import bookingService from '../../services/booking.service';
import reviewService from '../../services/review.service';
import BookingProgressTracker from './BookingProgressTracker';

const statusConfig = {
  pending:     { label: 'Pending',     class: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
  accepted:    { label: 'Accepted',    class: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  in_progress: { label: 'In Progress', class: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
  completed:   { label: 'Completed',   class: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' },
  rejected:    { label: 'Rejected',    class: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' },
  cancelled:   { label: 'Cancelled',   class: 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 border-gray-200 dark:border-white/10' },
};

export default function BookingCard({ booking, viewerRole, onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const status = statusConfig[booking.status] || statusConfig.cancelled;
  const otherParty = viewerRole === 'customer' ? booking.worker?.user : booking.customer;

  const act = async (newStatus) => {
    setBusy(true);
    try {
      await bookingService.updateBookingStatus(booking._id, newStatus);
      toast.success(`Booking ${newStatus.replace('_', ' ')}`);
      onUpdated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await reviewService.createReview({ bookingId: booking._id, rating, comment });
      toast.success('Review submitted!');
      setShowReview(false);
      onUpdated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              {viewerRole === 'customer' ? booking.worker?.profession : otherParty?.name}
            </p>
            <span className={`badge border text-[11px] ${status.class}`}>
              {status.label}
            </span>
          </div>
          {otherParty?.name && viewerRole === 'customer' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">with {otherParty.name}</p>
          )}
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span>·</span>
            <span>{booking.timeSlot}</span>
            {booking.totalAmount > 0 && (
              <>
                <span>·</span>
                <span className="font-semibold text-gray-600 dark:text-gray-300">₹{booking.totalAmount}</span>
              </>
            )}
          </div>
          {booking.address && (
            <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 truncate">
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              <span className="truncate">{booking.address}</span>
            </p>
          )}
        </div>
      </div>

      {/* Progress tracker */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
        <BookingProgressTracker status={booking.status} />
      </div>

      {/* Actions - wrap on mobile */}
      <div className="mt-4 flex flex-wrap gap-2">
        {viewerRole === 'worker' && booking.status === 'pending' && (
          <>
            <button disabled={busy} onClick={() => act('accepted')}
              className="btn-primary text-xs px-3 py-2">
              ✓ Accept
            </button>
            <button disabled={busy} onClick={() => act('rejected')}
              className="btn-secondary text-xs px-3 py-2">
              ✗ Reject
            </button>
          </>
        )}
        {viewerRole === 'worker' && booking.status === 'accepted' && (
          <button disabled={busy} onClick={() => act('in_progress')}
            className="btn-primary text-xs px-3 py-2">
            ▶ Start job
          </button>
        )}
        {viewerRole === 'worker' && booking.status === 'in_progress' && (
          <button disabled={busy} onClick={() => act('completed')}
            className="btn-primary text-xs px-3 py-2">
            ✓ Mark completed
          </button>
        )}
        {viewerRole === 'customer' && ['pending', 'accepted'].includes(booking.status) && (
          <button disabled={busy} onClick={() => act('cancelled')}
            className="btn-secondary text-xs px-3 py-2 hover:text-red-600 hover:border-red-400">
            Cancel booking
          </button>
        )}
        {viewerRole === 'customer' && booking.status === 'completed' && (
          <button onClick={() => setShowReview((v) => !v)}
            className="btn-secondary text-xs px-3 py-2">
            ⭐ Leave a review
          </button>
        )}
        {otherParty?._id && (
          <Link to="/chat" state={{ otherUserId: otherParty._id }}
            className="btn-secondary text-xs px-3 py-2">
            💬 Message
          </Link>
        )}
      </div>

      {/* Review form */}
      {showReview && (
        <form onSubmit={submitReview}
          className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl space-y-3">
          <p className="text-sm font-bold text-gray-900 dark:text-white">Write a review</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button key={r} type="button" onClick={() => setRating(r)}
                className={`text-2xl transition-transform hover:scale-110 ${r <= rating ? 'opacity-100' : 'opacity-30'}`}>
                ⭐
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={2}
            className="input text-sm resize-none"
          />
          <button type="submit" disabled={busy}
            className="btn-primary text-xs px-4 py-2">
            Submit review
          </button>
        </form>
      )}
    </div>
  );
}
