import { useEffect, useState, useCallback } from 'react';
import bookingService from '../../services/booking.service';
import BookingCard from '../../components/booking/BookingCard';
import Loader from '../../components/common/Loader';

const TABS = ['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'];

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params = tab === 'all' ? {} : { status: tab };
    bookingService
      .getMyBookings(params)
      .then((res) => setBookings(res.bookings))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="pt-20">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Bookings</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-3 py-1.5 rounded-full capitalize ${
              tab === t ? 'bg-primary-600 text-white' : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : bookings.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No bookings here.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <BookingCard key={b._id} booking={b} viewerRole="customer" onUpdated={load} />
          ))}
        </div>
      )}
    </div>
  );
}
