import { Link } from 'react-router-dom';

const availabilityConfig = {
  available: {
    label: 'Available',
    dot: 'bg-green-500',
    badge: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  busy: {
    label: 'Busy',
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  offline: {
    label: 'Offline',
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-500',
  },
};

export default function WorkerCard({ worker }) {
  const {
    user, profession, experienceYears, location,
    rateAmount, rateType, ratingAvg, ratingCount,
    availability, verification, skills,
  } = worker;

  const avail = availabilityConfig[availability] || availabilityConfig.offline;

  return (
    <Link
      to={`/workers/${worker._id}`}
      className="card p-4 sm:p-5 flex flex-col gap-3 group hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <img
            src={
              user?.avatar?.url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'W')}&background=16a34a&color=fff&size=96`
            }
            alt={user?.name}
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl object-cover"
          />
          {availability === 'available' && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-[#0f1f35]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {user?.name}
                </h3>
                {verification?.status === 'verified' && (
                  <svg className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{profession}</p>
            </div>

            <span className={`badge shrink-0 text-[10px] ${avail.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${avail.dot}`} />
              {avail.label}
            </span>
          </div>
        </div>
      </div>

      {/* Skills - show on mobile too but just 2 */}
      {skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 3).map((s) => (
            <span key={s} className="badge bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-[10px]">
              {s}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="badge bg-gray-100 dark:bg-white/5 text-gray-400 text-[10px]">
              +{skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {location?.city && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              </svg>
              {location.city}
            </span>
          )}
          <span>·</span>
          <span>{experienceYears}y exp</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs">
            <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span className="font-bold text-gray-900 dark:text-white">{ratingAvg?.toFixed(1) || '0.0'}</span>
            <span className="text-gray-400">({ratingCount || 0})</span>
          </span>

          <span className="font-black text-gray-900 dark:text-white text-sm">
            ₹{rateAmount?.toLocaleString()}
            <span className="text-xs font-normal text-gray-400">/{rateType === 'hourly' ? 'hr' : 'day'}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
