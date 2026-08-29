const PROFESSIONS = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter',
  'Mason', 'Welder', 'AC Technician', 'Construction Worker',
];

export default function WorkerFilters({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  const clearAll = () => onChange({ sort: 'rating' });

  const activeCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'sort' && v !== '' && v !== undefined
  ).length;

  return (
    <div className="space-y-5">
      {/* Header with clear */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Filters</h3>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      {/* Profession */}
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Profession
        </label>
        <select
          value={filters.profession || ''}
          onChange={(e) => update('profession', e.target.value)}
          className="input text-sm"
        >
          <option value="">All professions</option>
          {PROFESSIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          City
        </label>
        <input
          type="text"
          value={filters.city || ''}
          onChange={(e) => update('city', e.target.value)}
          placeholder="Delhi, Mumbai..."
          className="input text-sm"
        />
      </div>

      {/* Availability */}
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Availability
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: '',          label: 'Any',       dot: 'bg-gray-300'   },
            { value: 'available', label: 'Available', dot: 'bg-green-500'  },
            { value: 'busy',      label: 'Busy',      dot: 'bg-yellow-500' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => update('availability', opt.value)}
              className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                (filters.availability || '') === opt.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Price range (₹/day)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.minPrice || ''}
            onChange={(e) => update('minPrice', e.target.value)}
            placeholder="Min"
            className="input text-sm"
          />
          <span className="text-gray-400 text-sm shrink-0">–</span>
          <input
            type="number"
            value={filters.maxPrice || ''}
            onChange={(e) => update('maxPrice', e.target.value)}
            placeholder="Max"
            className="input text-sm"
          />
        </div>
      </div>

      {/* Min rating */}
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Min rating
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: '',    label: 'Any'  },
            { value: '3',   label: '3★+'  },
            { value: '4',   label: '4★+'  },
            { value: '4.5', label: '4.5★' },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => update('minRating', r.value)}
              className={`py-2 rounded-xl border-2 text-xs font-bold transition-all duration-200 ${
                (filters.minRating || '') === r.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-gray-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Sort by
        </label>
        <div className="space-y-1.5">
          {[
            { value: 'rating',     label: 'Highest rated'       },
            { value: 'price_low',  label: 'Price: low to high'  },
            { value: 'price_high', label: 'Price: high to low'  },
            { value: 'experience', label: 'Most experienced'    },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => update('sort', s.value)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                (filters.sort || 'rating') === s.value
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              {s.label}
              {(filters.sort || 'rating') === s.value && (
                <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
