import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {toast} from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api'; 

export default function Login() {
  // Standard Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  
  // OTP Modal States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  // Ban Appeal Modal States
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealMessage, setAppealMessage] = useState('');
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [bannedEmail, setBannedEmail] = useState(''); // <-- This was the missing piece!

  const { login,autoLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // MAGIC LINK CATCHER: Checks if they clicked the email button
  useEffect(() => {
    const isAppealing = searchParams.get('appeal');
    const appealEmail = searchParams.get('email');

    if (isAppealing === 'true') {
      if (appealEmail) {
        setBannedEmail(decodeURIComponent(appealEmail));
      }
      setShowAppealModal(true);
    }
  }, [searchParams]);


const redirectBasedOnRole = (userData) => {
    const role = userData?.role?.toLowerCase();

    if (role === 'admin') {
      navigate('/admin/analytics', { replace: true });
      return;
    } 
    
    if (role === 'customer') {
      navigate('/search', { replace: true });
      return;
    }

    if (role === 'worker') {
      // 🚨 FIX: Send ALL workers straight to their dashboard. 
      // The WorkerDashboard itself will check if their profile is 0% and bounce them to onboarding if needed!
      navigate('/worker/dashboard', { replace: true });
      return;
    }

    navigate('/search', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Catch the returned user object from your auth context
      const userData = await login(email.trim(), password.trim());
      toast.success('Welcome back!');

      redirectBasedOnRole(userData);
      
    
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid email or password.';
      
      if (error.response?.status === 403 && errorMessage.toLowerCase().includes('verify')) {
        setUnverifiedEmail(email.trim());
        setShowOtpModal(true);
        toast.error('You need to verify your email first.');
      } else if (error.response?.status === 403 && errorMessage.toLowerCase().includes('suspended')) {
        setBannedEmail(email.trim());
        setShowAppealModal(true);
        toast.error('Account suspended.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };
  

 const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return toast.error('OTP must be exactly 6 digits');
    
    setIsVerifying(true);
    try {
      // 1. Verify email and get token/user back from the backend
      const response = await api.post('/auth/verify-email', { email: unverifiedEmail, otpCode });
      const { user, accessToken } = response.data.data; 
      
      // 2. Log them in instantly via Context (Auto-Login)
      autoLogin(user, accessToken);
      
      toast.success('Email verified! Welcome aboard.');
      setShowOtpModal(false);
      setOtpCode('');

      // 3. FOOLPROOF ROLE & PROFILE ROUTING
      const role = user?.role?.toLowerCase();

      if (role === 'admin') {
        navigate('/admin/analytics', { replace: true });
      } 
      else if (role === 'customer') {
        navigate('/search', { replace: true });
      } 
      else if (role === 'worker') {
        // Check if they are a brand new worker or have an empty profile
        const hasProfession = user?.profession && user.profession !== 'Not specified' && user.profession !== '';
        const isProfileEmpty = user?.profileStrength === 0 || !hasProfession;

        if (isProfileEmpty) {
          navigate('/worker/onboarding', { replace: true }); // Brand new worker -> Setup flow!
        } else {
          navigate('/worker/dashboard', { replace: true });   // Experienced worker -> Straight to dashboard!
        }
      } 
      else {
        navigate('/search', { replace: true });
      }

    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await api.post('/auth/resend-otp', { email: unverifiedEmail });
      toast.success('A new code has been sent to your email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBanAppeal = async (e) => {
    e.preventDefault();
    if (appealMessage.trim().length < 10) {
      return toast.error('Please provide a bit more detail (minimum 10 characters).');
    }

    setIsSubmittingAppeal(true);
    try {
      await api.post('/auth/appeal-ban', { email: bannedEmail, message: appealMessage });
      toast.success('Appeal sent! The admin team will review it.');
      setShowAppealModal(false);
      setAppealMessage('');
      // Clean up the URL so the modal doesn't pop up again if they refresh
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit appeal.');
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword); 
    setShowDemo(false);
    toast.success('Demo credentials applied.');
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-zinc-50 dark:bg-[#030303] px-4 pt-32 pb-12 overflow-hidden selection:bg-orange-500/30">
      
      {/* ── PREMIUM AURORA BACKGROUND ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex justify-center items-center">
        <motion.div 
          animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute w-[800px] h-[800px] bg-gradient-to-tr from-orange-500/20 to-amber-300/10 dark:from-orange-500/10 dark:to-amber-500/5 blur-[120px] rounded-full opacity-70"
        />
        <motion.div 
          animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute w-[600px] h-[600px] bg-gradient-to-bl from-rose-400/20 to-orange-400/10 dark:from-rose-500/10 dark:to-orange-500/5 blur-[100px] rounded-full opacity-60 translate-x-1/4 -translate-y-1/4"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Main Glass Card */}
        <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border border-zinc-200/80 dark:border-white/10 rounded-[2rem] p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
          
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 items-center justify-center shadow-lg shadow-orange-500/20 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white"><path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"></path><path d="m18 15 4-4"></path><path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5"></path></svg>
            </div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">Welcome back</h1>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Enter your details to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full h-12 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/50 pl-11 pr-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors">Forgot?</Link>
              </div>
              <div className="relative group">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <input
                  type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full h-12 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/50 pl-11 pr-11 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full h-12 mt-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? <span className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-orange-500 hover:text-orange-400 transition-colors">Sign up free</Link>
            </p>
          </div>
        </div>

        {/* Integrated Demo Credentials */}
        <div className="mt-6">
          <button 
            onClick={() => setShowDemo(!showDemo)} 
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Demo Credentials
            <svg className={`w-3 h-3 transition-transform duration-300 ${showDemo ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          <AnimatePresence>
            {showDemo && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-2xl"
              >
                <div className="p-2 flex flex-col gap-1">
                  <button onClick={() => fillDemo('admin@workmitra.com', 'Admin@1234')} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-orange-500" /><span className="text-sm font-bold text-zinc-900 dark:text-white">Admin</span></div>
                    <span className="text-xs font-mono text-zinc-500">admin@workmitra.com</span>
                  </button>
                  <button onClick={() => fillDemo('ramesh.kumar@workmitra.com', 'Worker@1234')} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-sm font-bold text-zinc-900 dark:text-white">Worker</span></div>
                    <span className="text-xs font-mono text-zinc-500">ramesh.kumar@workmitra.com</span>
                  </button>
                  <button onClick={() => fillDemo('priya.sharma@gmail.com', 'Customer@1234')} className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-sm font-bold text-zinc-900 dark:text-white">Customer</span></div>
                    <span className="text-xs font-mono text-zinc-500">priya.sharma@gmail.com</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* --- 1. OTP MODAL (For Unverified Logins) --- */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">Verify your email</h3>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6">
                Enter the 6-digit code sent to <strong className="text-zinc-900 dark:text-white">{unverifiedEmail}</strong>
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input 
                  type="text" required maxLength={6} placeholder="123456"
                  value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                  className="w-full h-14 bg-zinc-50/50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl text-center text-2xl tracking-[0.5em] font-black text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all" 
                />
                <button 
                  type="submit" disabled={isVerifying || otpCode.length !== 6}
                  className="w-full h-12 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isVerifying ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Verify Email"}
                </button>
              </form>
              <div className="mt-6 flex flex-col gap-3">
                <button 
                  onClick={handleResendOtp} disabled={isResending}
                  className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest hover:text-orange-500 transition-colors disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend Code'}
                </button>
                <button 
                  onClick={() => { setShowOtpModal(false); setOtpCode(''); }}
                  className="text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 2. BAN APPEAL MODAL --- */}
      <AnimatePresence>
        {showAppealModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/10 rounded-[2rem] p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">Account Suspended</h3>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6">
                Your account (<strong className="text-zinc-900 dark:text-white">{bannedEmail}</strong>) has been restricted. You can submit an appeal below.
              </p>
              <form onSubmit={handleBanAppeal} className="space-y-4">
                <textarea 
                  required placeholder="Explain why you believe this is a mistake..." rows="4"
                  value={appealMessage} onChange={(e) => setAppealMessage(e.target.value)} 
                  className="w-full bg-zinc-50/50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl p-4 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none" 
                />
                <button 
                  type="submit" disabled={isSubmittingAppeal || appealMessage.length < 10}
                  className="w-full h-12 bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isSubmittingAppeal ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Submit Appeal"}
                </button>
              </form>
              <div className="mt-6">
                <button 
                  onClick={() => { 
                    setShowAppealModal(false); 
                    setAppealMessage(''); 
                    navigate('/login', { replace: true }); // Clears URL so it doesn't auto-open again
                  }}
                  className="text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  Cancel & Return to Login
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
