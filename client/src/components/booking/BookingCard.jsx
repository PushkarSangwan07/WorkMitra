import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import bookingService from '../../services/booking.service';
import reviewService from '../../services/review.service';
import BookingProgressTracker from './BookingProgressTracker';

const MONO = "'IBM Plex Mono', monospace";
const DISPLAY = "'Oswald', sans-serif";

const T = {
  card: 'bg-[#FAF8F3] dark:bg-[#1E1B15]',
  ink: 'text-[#16140F] dark:text-[#F3F0E8]',
  inkBorder: 'border-[#16140F] dark:border-[#F3F0E8]',
  steel: 'text-[#8B8577] dark:text-[#A39D8E]',
  hairline: 'border-[#E4E0D5] dark:border-[#2C2820]',
  amber: 'text-[#FF6A1A]',
  amberBg: 'bg-[#FF6A1A]',
  amberBorder: 'border-[#FF6A1A]',
  green: 'text-[#3E8E5A] dark:text-[#6FBB8A]',
  greenBorder: 'border-[#3E8E5A] dark:border-[#6FBB8A]',
  denim: 'text-[#2C4257] dark:text-[#8FA9BE]',
  denimBorder: 'border-[#2C4257] dark:border-[#8FA9BE]',
  red: 'text-[#B4232B] dark:text-[#E2707A]',
  redBorder: 'border-[#B4232B] dark:border-[#E2707A]',
};

const statusConfig = {
  pending:     { label: 'Pending',     class: `${T.amber} ${T.amberBorder}` },
  accepted:    { label: 'Accepted',    class: `${T.denim} ${T.denimBorder}` },
  in_progress: { label: 'In Progress', class: `${T.amber} ${T.amberBorder}` },
  completed:   { label: 'Completed',   class: `${T.green} ${T.greenBorder}` },
  rejected:    { label: 'Rejected',    class: `${T.red} ${T.redBorder}` },
  cancelled:   { label: 'Cancelled',   class: `${T.steel} ${T.hairline}` },
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

  const secondaryBtn = `text-xs px-3 py-2 rounded-lg font-semibold border-2 transition-colors ${T.hairline} ${T.ink} hover:bg-black/[0.03] dark:hover:bg-white/5`;
  const primaryBtn = `text-xs px-3 py-2 rounded-lg font-semibold text-white transition-transform hover:-translate-y-0.5 ${T.amberBg}`;

  return (
    <div className={`rounded-2xl border-2 p-5 ${T.card} ${T.hairline}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-semibold ${T.ink}`} style={{ fontFamily: DISPLAY }}>
              {(viewerRole === 'customer' ? booking.worker?.profession : otherParty?.name)?.toUpperCase()}
            </p>
            <span
              className={`px-2.5 py-0.5 rounded-full border-2 border-dashed text-[10px] font-bold uppercase tracking-wide ${status.class}`}
              style={{ fontFamily: MONO }}
            >
              {status.label}
            </span>
          </div>
          {otherParty?.name && viewerRole === 'customer' && (
            <p className={`text-sm mt-0.5 ${T.steel}`}>with {otherParty.name}</p>
          )}
          <div className={`flex flex-wrap gap-3 mt-2 text-xs ${T.steel}`} style={{ fontFamily: MONO }}>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span>·</span>
            <span>{booking.timeSlot}</span>
            {booking.totalAmount > 0 && (
              <>
                <span>·</span>
                <span className={`font-semibold ${T.ink}`}>₹{booking.totalAmount}</span>
              </>
            )}
          </div>
          {booking.address && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${T.steel}`}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {booking.address}
            </p>
          )}
        </div>
      </div>

      {booking.description && (
        <p className={`mt-2 text-sm italic ${T.steel}`}>"{booking.description}"</p>
      )}

      {/* Progress tracker */}
      <div className={`mt-4 pt-4 border-t-2 border-dashed ${T.hairline}`}>
        <BookingProgressTracker status={booking.status} />
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {viewerRole === 'worker' && booking.status === 'pending' && (
          <>
            <button disabled={busy} onClick={() => act('accepted')} className={primaryBtn}>✓ Accept</button>
            <button disabled={busy} onClick={() => act('rejected')} className={secondaryBtn}>✗ Reject</button>
          </>
        )}
        {viewerRole === 'worker' && booking.status === 'accepted' && (
          <button disabled={busy} onClick={() => act('in_progress')} className={primaryBtn}>▶ Start job</button>
        )}
        {viewerRole === 'worker' && booking.status === 'in_progress' && (
          <button disabled={busy} onClick={() => act('completed')} className={primaryBtn}>✓ Mark completed</button>
        )}
        {viewerRole === 'customer' && ['pending', 'accepted'].includes(booking.status) && (
          <button
            disabled={busy}
            onClick={() => act('cancelled')}
            className={`text-xs px-3 py-2 rounded-lg font-semibold border-2 transition-colors ${T.hairline} ${T.ink} hover:text-[#B4232B] dark:hover:text-[#E2707A] hover:border-[#B4232B] dark:hover:border-[#E2707A]`}
          >
            Cancel booking
          </button>
        )}
        {viewerRole === 'customer' && booking.status === 'completed' && (
          <button onClick={() => setShowReview((v) => !v)} className={secondaryBtn}>
            ★ Leave a review
          </button>
        )}
        {otherParty?._id && (
          <Link to="/chat" state={{ otherUserId: otherParty._id, otherUser: otherParty }} className={secondaryBtn}>
            Message
          </Link>
        )}
      </div>

      {/* Review form */}
      {showReview && (
        <form onSubmit={submitReview} className={`mt-4 p-4 rounded-xl border-2 border-dashed space-y-3 ${T.hairline}`}>
          <p className={`text-sm font-semibold ${T.ink}`} style={{ fontFamily: DISPLAY }}>WRITE A REVIEW</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                className={`text-2xl transition-transform hover:scale-110 ${r <= rating ? 'opacity-100 saturate-100' : 'opacity-30 saturate-0'}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={2}
            className={`w-full rounded-lg border-2 px-3 py-2 text-sm bg-transparent outline-none resize-none focus:border-[#FF6A1A] ${T.hairline} ${T.ink}`}
          />
          <button type="submit" disabled={busy} className={primaryBtn}>Submit review</button>
        </form>
      )}
    </div>
  );
}
