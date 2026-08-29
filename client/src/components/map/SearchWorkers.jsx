import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import workerService from '../../services/worker.service';
import WorkerCard from '../../components/worker/WorkerCard';
import WorkerFilters from '../../components/worker/WorkerFilters';
import WorkerCardSkeleton from '../../components/common/Skeleton';
import Icon from '../../components/ui/Icon';

// Lazy load the map to avoid loading Leaflet CSS unless needed
const WorkerMap = lazy(() => import('../../components/map/WorkerMap'));

export default function SearchWorkers() {
  const [filters, setFilters] = useState({ sort: 'rating' });
  const [workers, setWorkers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#060d1a]">
      {/* Header */}
      <div className="bg-white dark:bg-[#0a1628] border-b border-gray-100 dark:border-white/5 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-gray-900 dark:text-white truncate">
              Find a worker
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {loading ? 'Searching...' : `${pagination.total || 0} workers available`}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile filter button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 relative"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary-600 text-white text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Grid / Map toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
                Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                </svg>
                Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0f1f35] rounded-t-3xl max-h-[85vh] overflow-y-auto animate-fade-up">
            <div className="sticky top-0 bg-white dark:bg-[#0f1f35] px-4 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-4">
              <WorkerFilters filters={filters} onChange={setFilters} />
              <button
                onClick={() => setShowMobileFilters(false)}
                className="btn-primary w-full mt-4"
              >
                Show {pagination.total || 0} results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6 items-start">

          {/* Sidebar filters — desktop only */}
          <div className="hidden md:block w-64 shrink-0">
            <WorkerFilters filters={filters} onChange={setFilters} />
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            {/* Map view */}
            {viewMode === 'map' && (
              <div className="h-[calc(100vh-220px)] min-h-[400px]">
                <Suspense fallback={
                  <div className="h-full rounded-2xl bg-gray-100 dark:bg-[#0f1f35] flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
                  </div>
                }>
                  {loading ? (
                    <div className="h-full rounded-2xl bg-gray-100 dark:bg-[#0f1f35] flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <WorkerCardSkeleton key={i} />
                    ))}
                  </div>
                ) : workers.length === 0 ? (
                  <div className="card p-16 text-center">
                    <p className="text-5xl mb-4">🔍</p>
                    <p className="font-bold text-gray-900 dark:text-white">No workers found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Try adjusting your filters or searching a different city.
                    </p>
                    <button
                      onClick={() => setFilters({ sort: 'rating' })}
                      className="btn-secondary text-sm mt-4 px-5 py-2"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {workers.map((w) => (
                        <WorkerCard key={w._id} worker={w} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => fetchWorkers(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="btn-secondary text-sm px-4 py-2 disabled:opacity-40"
                        >
                          ← Prev
                        </button>

                        {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => fetchWorkers(page)}
                              className={`h-9 w-9 rounded-xl text-sm font-semibold transition-all ${
                                pagination.page === page
                                  ? 'bg-primary-600 text-white shadow-glow'
                                  : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-primary-400'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => fetchWorkers(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className="btn-secondary text-sm px-4 py-2 disabled:opacity-40"
                        >
                          Next →
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
