import { Link } from 'react-router-dom';

const CHECKS = [
  { key: 'profession',  label: 'Profession set',        test: (p) => p?.profession && p.profession !== 'Not specified' },
  { key: 'bio',         label: 'About section filled',  test: (p) => !!p?.bio },
  { key: 'city',        label: 'City added',            test: (p) => !!p?.location?.city },
  { key: 'rate',        label: 'Rate set',              test: (p) => p?.rateAmount > 0 },
  { key: 'skills',      label: 'Skills added',          test: (p) => p?.skills?.length > 0 },
  { key: 'languages',   label: 'Languages added',       test: (p) => p?.languages?.length > 0 },
  { key: 'avatar',      label: 'Profile photo uploaded',test: (p) => !!p?.user?.avatar?.url },
  { key: 'workImages',  label: 'Work samples uploaded', test: (p) => p?.workImages?.length > 0 },
  { key: 'verified',    label: 'Verification submitted',test: (p) => ['pending','verified'].includes(p?.verification?.status) },
];

export default function ProfileCompletenessMeter({ profile }) {
  if (!profile) return null;

  const done = CHECKS.filter((c) => c.test(profile));
  const percent = Math.round((done.length / CHECKS.length) * 100);

  // 🚨 NEW: When 100% complete, show a Success Card instead of disappearing!
  if (percent === 100) {
    return (
      <div className="h-full rounded-2xl border-2 border-[#16140F] dark:border-[#f4f4f5] p-5 lg:p-6 bg-[#FAF8F3] dark:bg-[#121212] flex flex-col items-center justify-center text-center transition-colors duration-300 shadow-[4px_4px_0_0_#10b981] hover:-translate-y-1">
        <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center text-white mb-5 border-2 border-[#16140F] dark:border-[#f4f4f5]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-black text-[#16140F] dark:text-[#f4f4f5] font-['Oswald',sans-serif] uppercase tracking-wide">
          Profile Complete
        </h3>
        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-['IBM_Plex_Mono',monospace] mt-2 uppercase tracking-widest">
          Maximum Visibility Unlocked
        </p>
      </div>
    );
  }

  const color =
    percent >= 60   ? 'bg-[#FF6A1A]' :
    percent >= 30   ? 'bg-amber-500' :
                      'bg-rose-500';

  const label =
    percent >= 60   ? 'LOOKING GOOD' :
    percent >= 30   ? 'NEEDS WORK' :
                      'INCOMPLETE';

  return (
    <div className="h-full rounded-2xl border-2 border-[#16140F] dark:border-[#f4f4f5] p-5 lg:p-6 bg-[#FAF8F3] dark:bg-[#121212] flex flex-col hover:border-[#FF6A1A] transition-colors duration-300">
      
      <div className="flex items-end justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#16140F] dark:text-[#f4f4f5] font-['Oswald',sans-serif] tracking-wide uppercase">
            Profile Strength
          </h3>
          <p className="text-[10px] font-bold text-[#8B8577] dark:text-[#a1a1aa] font-['IBM_Plex_Mono',monospace] uppercase tracking-widest mt-1">
            {label}
          </p>
        </div>
        <span className="text-3xl font-semibold text-[#16140F] dark:text-[#f4f4f5] font-['Oswald',sans-serif]">
          {percent}%
        </span>
      </div>

      {/* Industrial Progress Bar */}
      <div className="h-3 w-full bg-[#EFEBE2] dark:bg-[#0a0a0a] rounded-full overflow-hidden mb-6 border-2 border-[#16140F]/10 dark:border-white/10">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 gap-3 flex-1">
        {CHECKS.map((c) => {
          const isComplete = c.test(profile);
          return (
            <div key={c.key} className={`flex items-center gap-3 text-xs sm:text-sm font-medium ${isComplete ? 'text-[#8B8577] dark:text-[#a1a1aa]' : 'text-[#16140F] dark:text-[#f4f4f5]'}`}>
              {isComplete ? (
                // Checked Box
                <div className="w-5 h-5 rounded border-2 border-[#8B8577] dark:border-[#a1a1aa] flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-[#8B8577] dark:text-[#a1a1aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                // Empty Dashed Box
                <div className="w-5 h-5 rounded border-2 border-[#16140F] dark:border-[#f4f4f5] border-dashed shrink-0" />
              )}
              <span className={isComplete ? 'line-through opacity-70' : ''}>{c.label}</span>
            </div>
          );
        })}
      </div>

      <Link to="/worker/profile" className="mt-6 w-full py-3 bg-[#16140F] dark:bg-[#f4f4f5] hover:bg-[#FF6A1A] dark:hover:bg-[#FF6A1A] text-white dark:text-[#0a0a0a] dark:hover:text-white font-bold text-sm rounded-lg transition-colors text-center uppercase tracking-wide border-2 border-transparent">
        Complete Profile →
      </Link>
    </div>
  );
}