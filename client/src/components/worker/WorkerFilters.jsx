import { useState } from 'react';

const PROFESSIONS = [
  'Electrician', 'Plumber', 'Carpenter', 'Painter', 
  'Mason', 'Welder', 'AC Technician', 'Construction Worker'
];

export default function WorkerFilters({ filters, onChange }) {
  const handleChange = (field, value) => {
    onChange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      
      {/* Profession */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Profession</label>
        <select
          value={filters.profession || ''}
          onChange={(e) => handleChange('profession', e.target.value)}
          className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 px-4 text-sm text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-orange-500/50 transition-colors appearance-none"
        >
          <option value="">All professions</option>
          {PROFESSIONS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* City */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">City</label>
        <input
          type="text"
          placeholder="e.g. Delhi, Mumbai"
          value={filters.city || ''}
          onChange={(e) => handleChange('city', e.target.value)}
          className="w-full h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 px-4 text-sm text-zinc-900 dark:text-white font-medium placeholder:text-zinc-400 focus:outline-none focus:border-orange-500/50 transition-colors"
        />
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Availability</label>
        <div className="space-y-2">
          {[
            { value: '', label: 'Any', dot: 'bg-zinc-300 dark:bg-zinc-600' },
            { value: 'now', label: 'Available now', dot: 'bg-green-500' },
            { value: 'busy', label: 'Busy', dot: 'bg-amber-500' }
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-5 h-5">
                <input
                  type="radio"
                  name="availability"
                  value={opt.value}
                  checked={(filters.availability || '') === opt.value}
                  onChange={(e) => handleChange('availability', e.target.value)}
                  className="peer appearance-none w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-700 checked:border-orange-500 transition-colors"
                />
                <div className="absolute w-2.5 h-2.5 rounded-full bg-orange-500 scale-0 peer-checked:scale-100 transition-transform" />
              </div>
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Price Range (₹)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 px-3 text-sm text-zinc-900 dark:text-white font-medium placeholder:text-zinc-400 focus:outline-none focus:border-orange-500/50 transition-colors"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 px-3 text-sm text-zinc-900 dark:text-white font-medium placeholder:text-zinc-400 focus:outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}