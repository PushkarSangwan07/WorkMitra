import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';
import workerService from '../../services/worker.service';

const POPULAR = [
  { label: 'Electrician', icon: '⚡' },
  { label: 'Plumber', icon: '🔧' },
  { label: 'Carpenter', icon: '🪚' },
  { label: 'Painter', icon: '🎨' },
  { label: 'AC Technician', icon: '❄️' },
  { label: 'Mason', icon: '🧱' },
];

export default function SearchSuggestions({ className = '', placeholder }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);


  const displayPlaceholder = placeholder || 'Search electrician, plumber, carpenter...';

  // Calculate dropdown position based on input position
  const updateDropdownPosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 999999,
    });
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      const clickedInput =
        containerRef.current?.contains(e.target);

      const clickedDropdown =
        dropdownRef.current?.contains(e.target);

      if (clickedInput || clickedDropdown) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handler);

    return () =>
      document.removeEventListener("mousedown", handler);
  }, []);

  // Update position on scroll or resize
  useEffect(() => {
    if (!open) return;
    updateDropdownPosition();
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
    return () => {
      window.removeEventListener('scroll', updateDropdownPosition, true);
      window.removeEventListener('resize', updateDropdownPosition);
    };
  }, [open]);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    workerService
      .searchWorkers({ search: debouncedQuery, limit: 5 })
      .then((res) => setSuggestions(res.workers || []))
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleSearch = (term) => {
    setOpen(false);
    setQuery('');
    navigate(`/search?profession=${encodeURIComponent(term)}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) handleSearch(query.trim());
  };

  const handleFocus = () => {
    updateDropdownPosition();
    setOpen(true);
  };

  // The dropdown rendered via portal — attaches directly to document.body
  // so NO parent stacking context can ever clip or hide it
  const dropdown = open ? createPortal(
    <div
      style={{
        ...dropdownStyle,
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(10, 22, 40, 0.98)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {loading ? (
        <div className="px-4 py-4 text-sm text-gray-400 flex items-center gap-2">
          <svg className="animate-spin w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Searching...
        </div>

      ) : query && suggestions.length > 0 ? (
        <>
          <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Workers found
            </p>
          </div>
          {suggestions.map((w) => (
            <button
              key={w._id}
              onMouseDown={(e) => {
                e.preventDefault();
                navigate(`/workers/${w._id}`);
              }} style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <img
                src={w.user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.user?.name || 'W')}&background=16a34a&color=fff&size=64`}
                alt={w.user?.name}
                style={{ height: 36, width: 36, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {w.user?.name}
                </p>
                <p style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {w.profession} · {w.location?.city || 'India'}
                </p>
              </div>
              <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 700, flexShrink: 0 }}>
                ₹{w.rateAmount}/{w.rateType === 'hourly' ? 'hr' : 'day'}
              </span>
            </button>
          ))}
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              handleSearch(query);
            }} style={{
              width: '100%',
              padding: '10px 16px',
              background: 'transparent',
              border: 'none',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 13,
              color: '#4ade80',
              fontWeight: 600,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            See all results for "{query}" →
          </button>
        </>

      ) : (
        <>
          <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Popular searches
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, padding: 8 }}>
            {POPULAR.map((p) => (
              <button
                key={p.label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSearch(p.label);
                }} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 18 }}>{p.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#e5e7eb' }}>{p.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={handleFocus}
            placeholder={displayPlaceholder}
            className="w-full pl-12 pr-32 py-4 rounded-2xl border-2 border-transparent
              bg-white/10 dark:bg-white/5 backdrop-blur-md
              text-white placeholder-white/50
              focus:outline-none focus:border-primary-500/60 focus:bg-white/15
              transition-all duration-200 text-sm shadow-card"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary text-sm px-5 py-2"
          >
            Search
          </button>
        </div>
      </form>

      {dropdown}
    </div>
  );
}