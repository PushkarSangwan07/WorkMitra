import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import workerService from '../../services/worker.service';
import WorkerCard from '../../components/worker/WorkerCard';
import WorkerFilters from '../../components/worker/WorkerFilters';

const WorkerMap = lazy(() => import('../../components/map/WorkerMap'));

const MONO = "'IBM Plex Mono', monospace";
const DISPLAY = "'Oswald', sans-serif";

const T = {
  page: 'bg-[#EFEBE2] dark:bg-[#14120D]',
  card: 'bg-[#FAF8F3] dark:bg-[#1E1B15]',
  ink: 'text-[#16140F] dark:text-[#F3F0E8]',
  inkBorder: 'border-[#16140F] dark:border-[#F3F0E8]',
  inkBg: 'bg-[#16140F] dark:bg-[#F3F0E8]',
  steel: 'text-[#8B8577] dark:text-[#A39D8E]',
  hairline: 'border-[#E4E0D5] dark:border-[#2C2820]',
  hairlineBg: 'bg-[#E4E0D5] dark:bg-[#2C2820]',
  amber: 'text-[#FF6A1A]',
  amberBg: 'bg-[#FF6A1A]',
  amberBorder: 'border-[#FF6A1A]',
  denim: 'text-[#2C4257] dark:text-[#8FA9BE]',
  denimBorder: 'border-[#2C4257] dark:border-[#8FA9BE]',
  red: 'text-[#B4232B] dark:text-[#E2707A]',
  redBorder: 'border-[#B4232B] dark:border-[#E2707A]',
  redBg: 'bg-[#B4232B]/[0.06] dark:bg-[#E2707A]/10',
};

const SORT_OPTIONS = [
  { value: 'rating',      label: 'Top Rated'        },
  { value: 'price_low',   label: 'Lowest Price'     },
  { value: 'price_high',  label: 'Highest Price'    },
  { value: 'experience',  label: 'Most Experienced' },
];

function SkeletonCard() {
  return (
    <div className={`rounded-2xl overflow-hidden border-2 ${T.card} ${T.hairline}`}>
      <div className={`h-48 animate-pulse ${T.hairlineBg}`} />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="space-y-1.5">
            <div className={`h-4 w-28 animate-pulse rounded ${T.hairlineBg}`} />
            <div className={`h-3 w-16 animate-pulse rounded ${T.hairlineBg}`} />
          </div>
          <div className={`h-8 w-16 animate-pulse rounded ${T.hairlineBg}`} />
        </div>
        <div className="flex gap-2">
          <div className={`h-3 w-16 animate-pulse rounded ${T.hairlineBg}`} />
          <div className={`h-3 w-12 animate-pulse rounded ${T.hairlineBg}`} />
        </div>
        <div className="flex gap-1.5">
          <div className={`h-5 w-14 animate-pulse rounded-full ${T.hairlineBg}`} />
          <div className={`h-5 w-18 animate-pulse rounded-full ${T.hairlineBg}`} />
        </div>
      </div>
    </div>
  );
}

export default function SearchWorkers() {
  const [filters, setFilters] = useState({ sort: 'rating' });
  const [workers, setWorkers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fetchWorkers = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const cleanParams = Object.fromEntries(
        Object.entries({ ...filters, page, limit: 12 })
          .filter(([, v]) => v !== '' && v !== undefined && v !== 0)
      );
      const result = await workerService.searchWorkers(cleanParams);
      setWorkers(result.workers || []);
      setPagination(result.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch {
      setError('Could not load workers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchWorkers(1); }, [fetchWorkers]);

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'sort' && v !== '' && v !== undefined
  ).length;

  return (
    <div className={`min-h-screen pt-20 ${T.page}`} style={{ fontFamily: "'Work Sans', sans-serif" }}>

      <div className="max-w-6xl mx-auto mb-6 pt-10 px-4">
        {/* Top Bar */}
        <div className={`rounded-2xl border-2 px-4 md:px-6 shadow-sm ${T.card} ${T.inkBorder}`}>
          <div className={`flex items-center justify-between gap-4 py-4 border-b ${T.hairline}`}>

            <div>
              <p className={`text-[10px] font-semibold tracking-[0.2em] uppercase mb-1 ${T.denim}`} style={{ fontFamily: MONO }}>
                Search Order
              </p>
              {loading ? (
                <div className={`h-5 w-36 animate-pulse rounded ${T.hairlineBg}`} />
              ) : (
                <h1 className={`text-sm md:text-base font-semibold ${T.ink}`} style={{ fontFamily: DISPLAY }}>
                  <span className={T.amber} style={{ fontFamily: MONO }}>{pagination.total || 0}</span> WORKERS AVAILABLE
                  {filters.city && <span className={`font-normal ${T.steel}`}> in {filters.city}</span>}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => setShowMobileFilters(true)}
                className={`md:hidden relative flex items-center gap-1.5 px-3 py-2 rounded-full border-2 border-dashed text-xs font-semibold transition-colors ${T.hairline} ${T.ink}`}
                style={{ fontFamily: MONO }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
                FILTERS
                {activeFilterCount > 0 && (
                  <span className={`absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center ${T.amberBg}`}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className={`flex items-center rounded-full p-1 border-2 ${T.inkBorder} ${T.page}`}>
                {[
                  { mode: 'grid', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                    </svg>
                  )},
                  { mode: 'map', icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                    </svg>
                  )},
                ].map(({ mode, icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      viewMode === mode ? `${T.amberBg} text-white` : T.steel
                    }`}
                  >
                    {icon}
                    <span className="hidden sm:inline capitalize" style={{ fontFamily: MONO }}>{mode}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {viewMode === 'grid' && (
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
              <span className={`text-[10px] font-semibold shrink-0 uppercase tracking-widest mr-2 ${T.steel}`} style={{ fontFamily: MONO }}>
                Sort By
              </span>
              {SORT_OPTIONS.map((opt) => {
                const active = (filters.sort || 'rating') === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFilters((p) => ({ ...p, sort: opt.value }))}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border-2 ${
                      active
                        ? `${T.amberBg} text-white border-[#FF6A1A]`
                        : `border-dashed ${T.hairline} ${T.steel}`
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters({ sort: filters.sort || 'rating' })}
                  className={`shrink-0 ml-auto px-4 py-1.5 rounded-full text-xs font-semibold border-2 border-dashed transition-all ${T.red} ${T.redBorder}`}
                >
                  VOID FILTERS ×
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 backdrop-blur-sm bg-black/40 dark:bg-black/70" onClick={() => setShowMobileFilters(false)} />
          <div className={`absolute bottom-0 left-0 right-0 rounded-t-[2rem] max-h-[88vh] overflow-y-auto border-t-2 ${T.card} ${T.inkBorder}`}>
            <div className={`sticky top-0 backdrop-blur-md px-6 py-4 border-b flex items-center justify-between z-10 bg-[#FAF8F3]/90 dark:bg-[#1E1B15]/90 ${T.hairline}`}>
              <h2 className={`font-semibold text-lg ${T.ink}`} style={{ fontFamily: DISPLAY }}>FILTERS</h2>
              <button onClick={() => setShowMobileFilters(false)}
                className={`h-8 w-8 flex items-center justify-center rounded-full border-2 transition-colors ${T.inkBorder} ${T.ink}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-6">
              <WorkerFilters filters={filters} onChange={setFilters} />
              <button
                onClick={() => setShowMobileFilters(false)}
                className={`w-full mt-6 py-4 rounded-xl text-white font-semibold shadow-lg transition-all ${T.amberBg}`}
                style={{ fontFamily: MONO }}
              >
                SHOW {pagination.total || 0} RESULTS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-8 items-start">

          {/* Sidebar filters — desktop */}
          <div className="hidden md:block w-64 shrink-0">
            <div className={`rounded-2xl p-6 sticky top-32 shadow-sm border-2 border-dashed ${T.card} ${T.hairline}`}>
              <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${T.denim}`} style={{ fontFamily: MONO }}>
                Job Sheet
              </p>
              <h3 className={`text-lg font-semibold mb-6 ${T.ink}`} style={{ fontFamily: DISPLAY }}>FILTER RESULTS</h3>
              <WorkerFilters filters={filters} onChange={setFilters} />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className={`mb-6 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-semibold flex items-center gap-2 ${T.redBorder} ${T.red} ${T.redBg}`}>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[11px] ${T.redBorder}`}>!</span>
                {error}
              </div>
            )}

            {/* Map view */}
            {viewMode === 'map' && (
              <div className={`h-[calc(100vh-300px)] min-h-[500px] rounded-2xl overflow-hidden border-2 shadow-sm relative z-0 ${T.inkBorder}`}>
                <Suspense fallback={
                  <div className={`h-full w-full flex items-center justify-center ${T.card}`}>
                    <div className="animate-spin h-8 w-8 border-2 border-t-transparent rounded-full border-[#FF6A1A]" />
                  </div>
                }>
                  {loading ? (
                    <div className={`h-full w-full flex items-center justify-center ${T.card}`}>
                      <div className="animate-spin h-8 w-8 border-2 border-t-transparent rounded-full border-[#FF6A1A]" />
                    </div>
                  ) : (
                    <WorkerMap workers={workers} />
                  )}
                </Suspense>
              </div>
            )}

            {/* Grid view */}
            {viewMode === 'grid' && (
              <>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : workers.length === 0 ? (
                  <div className={`rounded-2xl p-16 text-center shadow-sm border-2 border-dashed ${T.card} ${T.hairline}`}>
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full border-[3px] border-dashed flex items-center justify-center rotate-[-8deg] ${T.denimBorder} ${T.denim}`}>
                      <span className="text-[10px] font-bold tracking-wider text-center leading-tight" style={{ fontFamily: MONO }}>
                        NOT<br />FOUND
                      </span>
                    </div>
                    <h3 className={`text-2xl font-semibold mb-2 ${T.ink}`} style={{ fontFamily: DISPLAY }}>NO WORKERS FOUND</h3>
                    <p className={`font-medium mb-8 max-w-sm mx-auto text-sm ${T.steel}`}>
                      We couldn't find any professionals matching your exact criteria. Try broadening your filters.
                    </p>
                    <button
                      onClick={() => setFilters({ sort: 'rating' })}
                      className={`text-sm font-semibold px-8 py-3.5 rounded-xl hover:-translate-y-0.5 transition-transform shadow-md text-white ${T.inkBg} !text-[#FAF8F3] dark:!text-[#16140F]`}
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {workers.map((w, i) => (
                        <div key={w._id} className="animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                          <WorkerCard worker={w} />
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="mt-10 flex items-center justify-center gap-2 flex-wrap mb-20">
                        <button
                          onClick={() => fetchWorkers(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className={`flex items-center gap-1 px-4 py-2 rounded-full border-2 text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm ${T.card} ${T.hairline} ${T.ink}`}
                          style={{ fontFamily: MONO }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
                          </svg>
                          PREV
                        </button>

                        {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => {
                          const page = i + 1;
                          const active = pagination.page === page;
                          return (
                            <button
                              key={page}
                              onClick={() => fetchWorkers(page)}
                              className={`h-9 w-9 rounded-full text-sm font-semibold transition-all shadow-sm border-2 ${
                                active
                                  ? `${T.amberBg} text-white border-[#FF6A1A]`
                                  : `${T.card} ${T.hairline} ${T.ink}`
                              }`}
                              style={{ fontFamily: MONO }}
                            >
                              {page}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => fetchWorkers(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className={`flex items-center gap-1 px-4 py-2 rounded-full border-2 text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm ${T.card} ${T.hairline} ${T.ink}`}
                          style={{ fontFamily: MONO }}
                        >
                          NEXT
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
