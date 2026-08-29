import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSocket } from '../../contexts/SocketContext';
import notificationService from '../../services/notification.service';

const MONO = "'IBM Plex Mono', monospace";
const DISPLAY = "'Oswald', sans-serif";

const T = {
  card: 'bg-[#FAF8F3] dark:bg-[#1E1B15]',
  ink: 'text-[#16140F] dark:text-[#F3F0E8]',
  inkBorder: 'border-[#16140F] dark:border-[#F3F0E8]',
  inkBg: 'bg-[#16140F] dark:bg-[#F3F0E8]',
  steel: 'text-[#16140F] dark:text-[#F3F0E8]/60',
  hairline: 'border-[#E4E0D5] dark:border-[#2C2820]',
  amber: 'text-[#FF6A1A]',
  amberBg: 'bg-[#FF6A1A]',
  amberTint: 'bg-[#FF6A1A]/10 border-[#FF6A1A]/30',
  red: 'text-[#B4232B] dark:text-[#E2707A]',
  redBg: 'bg-[#B4232B]/10 dark:bg-[#E2707A]/10',

};

const dashboardPathFor = (role) => {
  if (role === 'admin') return '/admin/analytics';
  if (role === 'worker') return '/worker/dashboard';
  return '/customer/dashboard';
};

// --- MAGNETIC PHYSICS WRAPPER ---
function Magnetic({ children, pull = 0.2, className = "" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 15, stiffness: 150, mass: 0.1 });
  const springY = useSpring(y, { damping: 15, stiffness: 150, mass: 0.1 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    x.set((clientX - (left + width / 2)) * pull);
    y.set((clientY - (top + height / 2)) * pull);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset} style={{ x: springX, y: springY }} className={`relative flex items-center justify-center ${className}`}>
      {children}
    </motion.div>
  );
}

// --- NOTIFICATION BELL ---
function NotificationBell() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    notificationService.getMyNotifications({ limit: 10 }).then((res) => {
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleNew = (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 10));
      setUnreadCount((prev) => prev + 1);
    };
    socket.on('notification:new', handleNew);
    return () => socket.off('notification:new', handleNew);
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (unreadCount > 0) {
      await notificationService.markAllAsRead().catch(() => {});
      setUnreadCount(0);
    }
  };

  

  return (
    <div className="relative" ref={ref}>
      <Magnetic pull={0.3}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleOpen}
          className={`relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${T.steel}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className={`absolute top-2 right-2 translate-x-1/4 -translate-y-1/4 h-4 w-4 text-[9px] text-white rounded-full flex items-center justify-center font-bold shadow-sm ${T.amberBg}`}
                style={{ fontFamily: MONO }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </Magnetic>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute right-0 mt-4 w-80 md:w-96 max-h-[450px] overflow-y-auto backdrop-blur-3xl border-2 rounded-2xl shadow-2xl z-50 overflow-hidden ${T.card} ${T.hairline}`}
          >
            <div className={`sticky top-0 backdrop-blur-xl px-6 py-4 border-b-2 border-dashed z-10 flex justify-between items-center bg-[#FAF8F3]/90 dark:bg-[#1E1B15]/90 ${T.hairline}`}>
              <p className={`font-semibold text-sm ${T.ink}`} style={{ fontFamily: DISPLAY }}>NOTIFICATIONS</p>
            </div>

            {notifications.length === 0 ? (
              <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
                <p className={`text-sm font-semibold ${T.ink}`} style={{ fontFamily: MONO }}>YOU'RE CAUGHT UP</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((n) => (
                  <Link key={n._id} to={n.link || '#'} onClick={() => setOpen(false)} className="block px-6 py-4 hover:bg-black/[0.03] dark:hover:bg-white/5 transition-colors">
                    <p className={`font-semibold text-sm ${T.ink}`}>{n.title}</p>
                    <p className={`text-xs mt-1 ${T.steel}`}>{n.body}</p>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- MAIN NAVBAR ---
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 40);

      if (currentScrollY > 150 && currentScrollY > lastScrollY.current) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/search', label: 'Find Workers' },
    { to: '/find-my-worker', label: '✨ AI Match' },
    { to: '/services', label: 'Services' },
    { to: '/about', label: 'About' },
  ];

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -150 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 inset-x-0 z-50 flex justify-center w-full pointer-events-none"
        style={{ fontFamily: "'Work Sans', sans-serif" }}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`pointer-events-auto flex items-center justify-between transition-colors duration-500 ${
            scrolled || !isHomePage || mobileOpen
              ? `mt-4 w-[95%] max-w-6xl rounded-2xl backdrop-blur-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border-2 px-4 py-2 bg-[#FAF8F3]/95 dark:bg-[#1E1B15]/90 ${T.hairline}`
              : 'w-full max-w-[100rem] rounded-none bg-transparent border-2 border-transparent px-6 py-5'
          }`}
        >

          {/* LOGO */}
          <Magnetic pull={0.1}>
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6A1A]/20 transition-transform group-hover:scale-105 ${T.amberBg}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white"><path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"></path><path d="m18 15 4-4"></path><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"></path></svg>
              </div>
              <span className={`text-2xl tracking-tight ${T.ink}`} style={{ fontFamily: DISPLAY }}>
                WORK<span className={T.amber}>MITRA</span>
              </span>
            </Link>
          </Magnetic>

          {/* DESKTOP NAV */}
          <nav className={`hidden md:flex items-center p-1.5 rounded-full backdrop-blur-md border-2 border-dashed bg-black/[0.02] dark:bg-white/5 ${T.hairline}`}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-5 py-2 text-xs font-semibold tracking-wide transition-colors rounded-full uppercase ${isActive ? T.amber : `${T.steel} hover:${T.ink}`}`}
                  style={{ fontFamily: MONO }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktop-nav-indicator"
                      className={`absolute inset-0 rounded-full shadow-sm border-2 ${T.card} ${T.hairline}`}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-1 sm:gap-2">

            <Magnetic pull={0.3}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${T.steel}`}
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                )}
              </motion.button>
            </Magnetic>

            {isAuthenticated && <NotificationBell />}

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2 ml-1">
                <Magnetic pull={0.2}>
                  <Link to="/chat" className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${T.steel}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </Link>
                </Magnetic>
                <Magnetic pull={0.1}>
                  <Link to={dashboardPathFor(user.role)} className={`flex items-center gap-3 pl-1.5 pr-5 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors group border-2 border-transparent hover:${T.hairline}`}>
                    <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center ${T.amberTint}`}>
                      <span className={`text-xs font-bold ${T.amber}`} style={{ fontFamily: MONO }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className={`text-sm font-semibold transition-colors group-hover:${T.amber} ${T.ink}`}>
                      {user.name?.split(' ')[0]}
                    </span>
                  </Link>
                </Magnetic>
                <Magnetic pull={0.2}>
                  <button onClick={handleLogout} className={`text-[10px] font-bold transition-colors uppercase tracking-widest px-2 py-2 ${T.steel} hover:text-[#B4232B] dark:hover:text-[#E2707A]`} style={{ fontFamily: MONO }}>
                    Logout
                  </button>
                </Magnetic>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3 ml-2">
                <Magnetic pull={0.2}>
                  <Link to="/login" className={`text-sm font-semibold px-3 py-2 transition-colors ${T.steel} hover:${T.ink}`}>Log in</Link>
                </Magnetic>
                <Magnetic pull={0.1}>
                  <Link to="/register" className={`px-6 py-2.5 rounded-full text-sm font-semibold shadow-md hover:scale-105 active:scale-95 transition-transform text-white ${T.amberBg}`}>
                    Sign up free
                  </Link>
                </Magnetic>
              </div>
            )}

            {/* MOBILE HAMBURGER */}
            <Magnetic pull={0.2} className="md:hidden ml-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${T.ink}`}
                aria-label="Toggle mobile menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </motion.button>
            </Magnetic>
          </div>
        </motion.div>
      </motion.header>

      {/* MOBILE DROPDOWN MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-0 top-[85px] z-40 px-4 md:hidden"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            <div className={`backdrop-blur-2xl border-2 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 ${T.card} ${T.hairline}`}>

              {/* Mobile Nav Links */}
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-5 py-3.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive ? `bg-[#FF6A1A]/10 border-2 border-dashed border-[#FF6A1A] ${T.amber}` : `${T.ink} hover:bg-black/[0.03] dark:hover:bg-white/5`
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Auth / Profile Links */}
              <div className={`pt-4 border-t-2 border-dashed flex flex-col gap-2 ${T.hairline}`}>
                {isAuthenticated ? (
                  <>
                    <Link to={dashboardPathFor(user.role)} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed ${T.hairline}`}>
                      <div className={`h-10 w-10 rounded-lg border-2 flex items-center justify-center ${T.amberTint}`}>
                        <span className={`text-sm font-bold ${T.amber}`} style={{ fontFamily: MONO }}>{user.name?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${T.ink}`}>{user.name}</p>
                        <p className={`text-xs font-medium ${T.steel}`} style={{ fontFamily: MONO }}>DASHBOARD</p>
                      </div>
                    </Link>
                    <Link to="/chat" className={`px-5 py-3.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${T.ink} hover:bg-black/[0.03] dark:hover:bg-white/5`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      Messages
                    </Link>
                    <button onClick={handleLogout} className={`px-5 py-3.5 text-left rounded-xl text-sm font-semibold transition-colors ${T.red} hover:${T.redBg}`}>
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <Link to="/login" className={`w-full py-3.5 rounded-xl border-2 font-semibold text-sm text-center transition-colors ${T.hairline} ${T.ink} hover:bg-black/[0.03] dark:hover:bg-white/5`}>
                      Log in
                    </Link>
                    <Link to="/register" className={`w-full py-3.5 rounded-xl text-white font-semibold text-sm text-center shadow-lg shadow-[#FF6A1A]/20 active:scale-95 transition-transform ${T.amberBg}`}>
                      Sign up
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
