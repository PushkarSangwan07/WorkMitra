import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import workerService from '../../services/worker.service';
import reviewService from '../../services/review.service';
import favoriteService from '../../services/favorite.service';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../../components/common/Loader';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';
import api from '../../services/api';

import BookingForm from '../../components/booking/BookingForm';

const MONO = "'IBM Plex Mono', monospace";
const DISPLAY = "'Oswald', sans-serif";

const T = {
  page: 'bg-[#EFEBE2] dark:bg-[#14120D]',
  card: 'bg-[#FAF8F3] dark:bg-[#1E1B15]',
  ink: 'text-[#16140F] dark:text-[#F3F0E8]',
  inkBorder: 'border-[#16140F] dark:border-[#F3F0E8]',
  steel: 'text-[#8B8577] dark:text-[#A39D8E]',
  hairline: 'border-[#E4E0D5] dark:border-[#2C2820]',
  amber: 'text-[#FF6A1A]',
  amberBg: 'bg-[#FF6A1A]',
  amberBorder: 'border-[#FF6A1A]',
  denim: 'text-[#2C4257] dark:text-[#8FA9BE]',
  green: 'text-[#3E8E5A] dark:text-[#6FBB8A]',
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < Math.round(rating) ? 'fill-[#FF6A1A] text-[#FF6A1A]' : 'fill-none text-[#E4E0D5] dark:text-[#2C2820]'}`}
          stroke="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function WorkerProfile() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addWorker } = useRecentlyViewed();

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const [showBooking, setShowBooking] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportForm, setReportForm] = useState({ reason: '', details: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [w, r] = await Promise.all([
          workerService.getWorkerById(id),
          reviewService.getWorkerReviews(id),
        ]);
        setWorker(w);
        setReviews(r.reviews || []);
        addWorker(w);
        if (isAuthenticated && user?.role === 'customer') {
          try {
            const favs = await favoriteService.getMyFavorites();
            setIsFavorite(favs.some((f) => f.worker?._id === id));
          } catch { }
        }
      } catch {
        toast.error('Could not load this profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isAuthenticated, user, addWorker]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(id);
        setIsFavorite(false);
        toast.success('Removed from saved');
      } else {
        await favoriteService.addFavorite(id);
        setIsFavorite(true);
        toast.success('Worker saved');
      }
    } catch { toast.error('Could not update'); }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    setReporting(true);
    try {
      await api.post(`/workers/${worker.user._id}/report`, reportForm);
      toast.success('Report submitted. Our team will review within 24 hours.');
      setShowReport(false);
      setReportForm({ reason: '', details: '' });
    } catch (error) {
      console.error("Report Error:", error.response?.data);
      toast.error(error.response?.data?.message || 'Could not submit report');
    } finally {
      setReporting(false);
    }
  };

  if (loading) return <Loader size="lg" />;
  if (!worker) return (
    <div className={`min-h-screen flex items-center justify-center ${T.page}`}>
      <p className={T.steel}>Worker not found</p>
    </div>
  );

  const {
    user: workerUser, profession, bio, skills, languages,
    experienceYears, rateAmount, location,
    ratingAvg, ratingCount, availability, verification, workImages,
  } = worker;

  const whatsappUrl = workerUser?.phone
    ? `https://wa.me/91${workerUser.phone}?text=${encodeURIComponent(`Hi ${workerUser?.name}, I found your profile on WorkMitra.`)}`
    : null;

  const statCards = [
    { label: 'Day Rate', value: `₹${rateAmount}` },
    { label: 'Hour Rate', value: `₹${Math.round(rateAmount / 8)}` },
    { label: 'Experience', value: `${experienceYears} yrs` },
    { label: 'Reviews', value: ratingCount || 0 },
  ];

  return (
    <div className={`min-h-screen pt-20 ${T.page}`} style={{ fontFamily: "'Work Sans', sans-serif" }}>
      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <Link
          to="/search"
          className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${T.steel} hover:${T.ink}`}
          style={{ fontFamily: MONO }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          BACK TO SEARCH
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column — photo + name, styled as the ID badge */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`relative overflow-hidden rounded-2xl h-72 border-2 ${T.inkBorder}`}>
              <img
                src={workerUser?.avatar?.url || "https://randomuser.me/api/portraits/men/43.jpg"}
                alt={workerUser?.name}
                className="w-full h-full object-cover"
              />
              {verification?.status === 'verified' && (
                <div
                  className={`absolute -bottom-3 -right-3 w-16 h-16 rounded-full border-[3px] border-dashed flex items-center justify-center rotate-[-12deg] bg-[#2C4257]/[0.06] dark:bg-[#8FA9BE]/10 ${T.denim}`}
                  style={{ borderColor: 'currentColor' }}
                >
                  <span className="text-[8px] font-bold tracking-wider text-center leading-tight" style={{ fontFamily: MONO }}>
                    VERIFIED
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {availability === 'available' && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 text-[10px] font-bold uppercase tracking-wide ${T.green}`}
                    style={{ borderColor: 'currentColor', fontFamily: MONO }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    Available
                  </span>
                )}
              </div>
              <h1 className={`text-2xl font-semibold ${T.ink}`} style={{ fontFamily: DISPLAY }}>
                {workerUser?.name?.toUpperCase()}
              </h1>
              <p className={`font-semibold mt-0.5 ${T.amber}`} style={{ fontFamily: MONO }}>{profession}</p>

              {location?.city && (
                <p className={`flex items-center gap-1.5 text-sm mt-2 ${T.steel}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {location.city}{location.state ? `, ${location.state}` : ''}
                </p>
              )}

              <div className="flex items-center gap-2 mt-3">
                <StarRating rating={ratingAvg || 0} />
                <span className={`text-sm font-semibold ${T.ink}`} style={{ fontFamily: MONO }}>{ratingAvg?.toFixed(1) || '0.0'}</span>
                <span className={`text-sm ${T.steel}`}>({ratingCount} reviews)</span>
              </div>
            </div>

            {/* Action buttons — ab yeh hamesha dikhenge */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Please log in as a customer to book a worker');
                    // Aap chahein toh navigate('/login') bhi use kar sakte hain
                    return;
                  }
                  if (user?.role !== 'customer') {
                    toast.error('Only customers can book workers');
                    return;
                  }
                  setShowBooking(true);
                }}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-full text-white font-semibold text-sm transition-transform hover:-translate-y-0.5 ${T.amberBg}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Now
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.error('Please log in to save workers');
                      return;
                    }
                    toggleFavorite();
                  }}
                  className={`flex-1 py-2.5 rounded-full text-sm font-semibold border-2 transition-colors ${isFavorite ? `${T.amberBorder} ${T.amber}` : `${T.hairline} ${T.ink} hover:bg-black/[0.03] dark:hover:bg-white/5`
                    }`}
                >
                  {isFavorite ? 'Saved' : 'Save'}
                </button>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm font-semibold transition-colors"
                  >
                    Chat
                  </a>
                )}

                <button
          onClick={() => {
            const profileUrl = window.location.href;
            if (navigator.share) {
              navigator.share({
                title: `${workerUser?.name} - WorkMitra`,
                text: `Check out ${workerUser?.name}'s profile on WorkMitra`,
                url: profileUrl,
              }).catch(() => {});
            } else {
              navigator.clipboard.writeText(profileUrl);
              toast.success('Profile link copied to clipboard!');
            }
          }}
          className={`px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition-colors ${T.hairline} ${T.ink} hover:bg-black/[0.03] dark:hover:bg-white/5`}
          title="Share Profile"
        >
          <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3.316 3.316 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3.316 3.316 0 00-5.368-2.684z" />
          </svg>
        </button>
              </div>
            </div>

            {/* Report button */}
            {isAuthenticated && user?.role === 'customer' && (
              <button
                onClick={() => setShowReport(true)}
                className={`w-full flex items-center justify-center py-2 text-xs font-semibold transition-colors ${T.steel} hover:text-[#B4232B] dark:hover:text-[#E2707A]`}
                style={{ fontFamily: MONO }}
              >
                Report this worker
              </button>
            )}
          </div>

          {/* Right column — stats + info */}
          <div className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {statCards.map((s) => (
                <div key={s.label} className={`rounded-xl p-4 border-2 border-dashed ${T.card} ${T.hairline}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${T.denim}`} style={{ fontFamily: MONO }}>
                    {s.label}
                  </p>
                  <p className={`text-xl font-semibold ${T.ink}`} style={{ fontFamily: DISPLAY }}>{s.value}</p>
                </div>
              ))}
            </div>

            {bio && (
              <div className={`rounded-2xl p-5 border-2 ${T.card} ${T.hairline}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-widest mb-3 ${T.denim}`} style={{ fontFamily: MONO }}>
                  About
                </p>
                <p className={`text-sm leading-relaxed ${T.steel}`}>{bio}</p>
                {skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {skills.map((s) => (
                      <span key={s} className={`text-[10px] px-2.5 py-1 rounded border ${T.hairline} ${T.steel}`} style={{ fontFamily: MONO }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            <div className={`rounded-2xl p-5 border-2 ${T.card} ${T.hairline}`}>
              <p className={`text-[11px] font-semibold uppercase tracking-widest mb-1 ${T.denim}`} style={{ fontFamily: MONO }}>
                Reviews
              </p>
              <h3 className={`text-lg font-semibold mb-4 ${T.ink}`} style={{ fontFamily: DISPLAY }}>
                WHAT CUSTOMERS SAY
              </h3>
              {reviews.length === 0 ? (
                <p className={`text-sm ${T.steel}`}>No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r._id} className={`flex gap-3 pb-4 border-b border-dashed last:border-0 last:pb-0 ${T.hairline}`}>
                      <div>
                        <p className={`font-semibold text-sm ${T.ink}`}>{r.customer?.name}</p>
                        {r.comment && <p className={`text-sm mt-0.5 ${T.steel}`}>{r.comment}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-2xl p-6 border-2 ${T.card} ${T.inkBorder}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-semibold text-lg ${T.ink}`} style={{ fontFamily: DISPLAY }}>REQUEST A BOOKING</h3>
              <button
                onClick={() => setShowBooking(false)}
                className={`transition-colors ${T.steel} hover:${T.ink}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <BookingForm
              workerId={id}
              rateAmount={rateAmount}
              onSuccess={() => setShowBooking(false)}
            />
          </div>
        </div>
      )}

      {/* Report modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl p-6 border-2 ${T.card} ${T.inkBorder}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-semibold text-lg ${T.ink}`} style={{ fontFamily: DISPLAY }}>REPORT WORKER</h3>
              <button
                onClick={() => setShowReport(false)}
                className={`transition-colors ${T.steel} hover:${T.ink}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${T.denim}`} style={{ fontFamily: MONO }}>
                  Reason
                </label>
                <select
                  required
                  value={reportForm.reason}
                  onChange={(e) => setReportForm((p) => ({ ...p, reason: e.target.value }))}
                  className={`w-full h-11 rounded-lg border-2 px-3 text-sm bg-transparent outline-none focus:border-[#FF6A1A] ${T.hairline} ${T.ink}`}
                >
                  <option value="">Select a reason</option>
                  <option value="scam">Suspected scam</option>
                  <option value="no_show">Did not show up</option>
                  <option value="unprofessional">Unprofessional behavior</option>
                  <option value="fake_profile">Fake profile / details</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={`block text-[10px] font-semibold uppercase tracking-widest mb-2 ${T.denim}`} style={{ fontFamily: MONO }}>
                  Details
                </label>
                <textarea
                  rows={3}
                  value={reportForm.details}
                  onChange={(e) => setReportForm((p) => ({ ...p, details: e.target.value }))}
                  placeholder="Tell us what happened..."
                  className={`w-full rounded-lg border-2 px-3 py-2.5 text-sm bg-transparent outline-none resize-none focus:border-[#FF6A1A] ${T.hairline} ${T.ink}`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReport(false)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-colors ${T.hairline} ${T.ink} hover:bg-black/[0.03] dark:hover:bg-white/5`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reporting || !reportForm.reason}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#B4232B] hover:bg-[#93171E] disabled:opacity-50 transition-colors"
                >
                  {reporting ? 'Submitting...' : 'Submit report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

}
