import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import workerService from '../../services/worker.service';
import reviewService from '../../services/review.service';
import favoriteService from '../../services/favorite.service';
import bookingService from '../../services/booking.service';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../../components/common/Loader';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';
import ShareProfileButton from '../../components/worker/ShareProfileButton';
import AIJobDescriptionHelper from '../../components/ai/AIJobDescriptionHelper';

export default function WorkerProfile() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addWorker } = useRecentlyViewed();

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({ date: '', timeSlot: '', address: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [workerData, reviewData] = await Promise.all([
          workerService.getWorkerById(id),
          reviewService.getWorkerReviews(id),
        ]);
        setWorker(workerData);
        setReviews(reviewData.reviews);
        addWorker(workerData);

        if (isAuthenticated && user?.role === 'customer') {
          try {
            const favorites = await favoriteService.getMyFavorites();
            setIsFavorite(favorites.some((f) => f.worker?._id === id));
          } catch { /* non-fatal */ }
        }
      } catch {
        toast.error('Could not load this profile');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(id);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await favoriteService.addFavorite(id);
        setIsFavorite(true);
        toast.success('Saved to favorites');
      }
    } catch {
      toast.error('Could not update favorites');
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bookingService.createBooking({ workerId: id, ...bookingForm });
      toast.success('Booking request sent!');
      setShowBookingForm(false);
      setBookingForm({ date: '', timeSlot: '', address: '', description: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader size="lg" />;
  if (!worker) return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-5xl mb-3">😕</p>
        <p className="font-bold text-gray-900 dark:text-white">Worker not found</p>
      </div>
    </div>
  );

  const {
    user: workerUser, profession, bio, skills, languages,
    experienceYears, rateAmount, rateType, location,
    ratingAvg, ratingCount, availability, verification, workImages,
  } = worker;

  const whatsappUrl = workerUser?.phone
    ? `https://wa.me/91${workerUser.phone}?text=${encodeURIComponent(
        `Hi ${workerUser?.name}, I found your profile on WorkMitra. I'm interested in hiring you.`
      )}`
    : null;

  const availabilityColors = {
    available: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    busy:      'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    offline:   'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#060d1a]">

      {/* Hero section */}
      <div className="bg-white dark:bg-[#0a1628] border-b border-gray-100 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">

            {/* Avatar */}
            <div className="relative shrink-0 self-start">
              <img
                src={workerUser?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(workerUser?.name || 'W')}&background=16a34a&color=fff&size=200`}
                alt={workerUser?.name}
                className="h-20 w-20 sm:h-28 sm:w-28 rounded-2xl object-cover shadow-card"
              />
              {availability === 'available' && (
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white dark:border-[#0a1628] shadow" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-start gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                  {workerUser?.name}
                </h1>
                {verification?.status === 'verified' && (
                  <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border border-primary-200 dark:border-primary-800 text-[11px]">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Verified
                  </span>
                )}
                <span className={`badge capitalize text-[11px] ${availabilityColors[availability] || availabilityColors.offline}`}>
                  {availability}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{profession}</p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                {location?.city && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                    {location.city}{location.state ? `, ${location.state}` : ''}
                  </span>
                )}
                <span>{experienceYears} yrs exp</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span className="font-semibold text-gray-900 dark:text-white">{ratingAvg?.toFixed(1) || '0.0'}</span>
                  <span>({ratingCount || 0} reviews)</span>
                </span>
              </div>

              <div className="mt-3">
                <span className="text-2xl font-black text-gray-900 dark:text-white">
                  ₹{rateAmount?.toLocaleString()}
                </span>
                <span className="text-gray-400 text-sm">/{rateType === 'hourly' ? 'hour' : 'day'}</span>
              </div>

              {/* Action buttons - wraps on mobile */}
              <div className="mt-4 flex flex-wrap gap-2">
                {isAuthenticated && user?.role === 'customer' && (
                  <>
                    <button
                      onClick={() => setShowBookingForm((v) => !v)}
                      className="btn-primary text-sm px-4 py-2.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      Book now
                    </button>

                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm font-semibold rounded-xl transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.561 4.14 1.535 5.874L.057 23.215a.75.75 0 00.916.927l5.453-1.43A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.714 9.714 0 01-4.953-1.355l-.355-.211-3.678.964.982-3.588-.232-.369A9.712 9.712 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                        </svg>
                        WhatsApp
                      </a>
                    )}

                    <button
                      onClick={toggleFavorite}
                      className={`btn-secondary text-sm px-4 py-2.5 ${isFavorite ? 'border-red-300 text-red-500 dark:border-red-700 dark:text-red-400' : ''}`}
                    >
                      {isFavorite ? '❤️ Saved' : '🤍 Save'}
                    </button>
                  </>
                )}

                <ShareProfileButton workerName={workerUser?.name} workerId={id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking form */}
      {showBookingForm && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="card p-5 sm:p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Request a booking</h3>
            <form onSubmit={handleBookingSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingForm((p) => ({ ...p, date: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Time slot *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 AM – 12 PM"
                    value={bookingForm.timeSlot}
                    onChange={(e) => setBookingForm((p) => ({ ...p, timeSlot: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Address *</label>
                <input
                  type="text"
                  required
                  placeholder="House no., street, city..."
                  value={bookingForm.address}
                  onChange={(e) => setBookingForm((p) => ({ ...p, address: e.target.value }))}
                  className="input"
                />
              </div>

              <AIJobDescriptionHelper
                value={bookingForm.description}
                onChange={(val) => setBookingForm((p) => ({ ...p, description: val }))}
                profession={profession}
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Estimated: <span className="font-bold text-gray-900 dark:text-white">
                    ₹{rateAmount?.toLocaleString()}/{rateType === 'hourly' ? 'hr' : 'day'}
                  </span>
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="btn-secondary text-sm flex-1 sm:flex-none px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-sm flex-1 sm:flex-none px-4 py-2"
                  >
                    {submitting ? 'Sending...' : 'Send request'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

        {bio && (
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-2">About</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{bio}</p>
          </div>
        )}

        {(skills?.length > 0 || languages?.length > 0) && (
          <div className="card p-5">
            {skills?.length > 0 && (
              <div className="mb-4">
                <h2 className="font-bold text-gray-900 dark:text-white mb-2">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="badge bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {languages?.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white mb-2">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {languages.map((l) => (
                    <span key={l} className="badge bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {workImages?.length > 0 && (
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-3">Work samples</h2>
            <div className="grid grid-cols-3 gap-2">
              {workImages.map((img) => (
                <img
                  key={img.publicId}
                  src={img.url}
                  alt="Work sample"
                  className="rounded-xl aspect-square object-cover hover:scale-[1.02] transition-transform cursor-pointer"
                />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Reviews</h2>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="font-bold text-gray-900 dark:text-white text-sm">{ratingAvg?.toFixed(1) || '0.0'}</span>
              <span className="text-gray-400 text-xs">({reviews.length})</span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="flex gap-3 pb-4 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
                  <img
                    src={r.customer?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.customer?.name || 'C')}&background=6366f1&color=fff&size=64`}
                    alt={r.customer?.name}
                    className="h-9 w-9 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{r.customer?.name}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{r.comment}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
