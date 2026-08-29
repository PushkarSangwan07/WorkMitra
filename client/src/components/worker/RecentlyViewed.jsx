import { Link } from 'react-router-dom';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';

export default function RecentlyViewed() {
  const { recent, clearRecent } = useRecentlyViewed();

  if (recent.length === 0) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 dark:text-white">Recently viewed</h2>
        <button
          onClick={clearRecent}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          Clear
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {recent.map((w) => (
          <Link
            key={w._id}
            to={`/workers/${w._id}`}
            className="shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors w-24 text-center group"
          >
            <img
              src={w.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name || 'W')}&background=16a34a&color=fff&size=80`}
              alt={w.name}
              className="h-12 w-12 rounded-2xl object-cover group-hover:scale-105 transition-transform"
            />
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate w-full">{w.name?.split(' ')[0]}</p>
              <p className="text-[10px] text-gray-400 truncate w-full">{w.profession}</p>
              {w.ratingAvg > 0 && (
                <p className="text-[10px] text-yellow-500 font-medium">⭐ {w.ratingAvg?.toFixed(1)}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
