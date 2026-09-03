import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api'; 

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'customer' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { register, verifyEmail } = useAuth(); 
  const navigate = useNavigate();

  const redirectBasedOnRole = (userData) => {
    const role = userData?.role?.toLowerCase();

    if (role === 'admin') {
      navigate('/admin/analytics', { replace: true });
    } 
    else if (role === 'customer') {
      navigate('/search', { replace: true });
    } 
    else if (role === 'worker') {
      navigate('/worker/onboarding', { replace: true });
    } 
    else {
      navigate('/search', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🚨 FIX: Frontend Password Validation (Before hitting API)
    if (formData.password.length < 8) {
      return toast.error('Password must be at least 8 characters long. 🔒');
    }
    
    // Check if password contains at least one number
    if (!/\d/.test(formData.password)) {
      return toast.error('Password must contain at least one number (0-9). 🔢');
    }

    setIsLoading(true);
    try {
      await register(formData);
      toast.success('Account created! Please check your email.');
      setShowOtpModal(true); 
    } catch (error) {
      // Backend se aane wale errors ko bhi clean dikhane ke liye
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return toast.error('OTP must be exactly 6 digits');
    
    setIsVerifying(true);
    try {
      const verifiedUser = await verifyEmail(formData.email, otpCode);
      
      toast.success('Email verified successfully! Welcome to WorkMitra 🎉');
      setShowOtpModal(false);
      
      redirectBasedOnRole(verifiedUser);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await api.post('/auth/resend-otp', { email: formData.email });
      toast.success('A new code has been sent to your email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
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
        <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border border-zinc-200/80 dark:border-white/10 rounded-[2rem] p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">Create Account</h1>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Join the network of verified professionals and customers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Animated Role Segmented Control */}
            <div className="relative flex p-1 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/5">
              {['customer', 'worker'].map((role) => (
                <button
                  key={role} type="button" onClick={() => setFormData({ ...formData, role })}
                  className="relative flex-1 py-2.5 text-sm font-bold z-10 transition-colors capitalize"
                  style={{ color: formData.role === role ? 'var(--text-active)' : 'var(--text-inactive)' }}
                >
                  {formData.role === role && (
                    <motion.div
                      layoutId="activeRole"
                      className="absolute inset-0 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-sm border border-zinc-200/50 dark:border-white/5 -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={formData.role === role ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-500"}>
                    {role === 'customer' ? 'Hire Workers' : 'Find Work'}
                  </span>
                </button>
              ))}
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <input
                  type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Enter Your Full Name"
                  className="w-full h-12 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/50 pl-11 pr-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* 🚨 CONDITIONAL RENDERING: Phone Input (ONLY FOR WORKERS) */}
            <AnimatePresence>
              {formData.role === 'worker' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest ml-1">Phone Number (Required for Workers)</label>
                  <div className="relative group">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <input
                      type="tel" 
                      required={formData.role === 'worker'} // Sirf worker ke liye required
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                      placeholder="10-digit WhatsApp number"
                      className="w-full h-12 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/50 pl-11 pr-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
        

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <input
                  type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="you@example.com"
                  className="w-full h-12 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/50 pl-11 pr-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <input
                  type={showPassword ? "text" : "password"} required minLength={6} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="••••••••"
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
              className="w-full h-12 mt-4 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-orange-500 hover:text-orange-400 transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* --- OTP MODAL --- */}
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

              <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">Check your email</h3>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-6">
                We sent a 6-digit code to <strong className="text-zinc-900 dark:text-white">{formData.email}</strong>
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

              <div className="mt-6">
                <button 
                  onClick={handleResendOtp} disabled={isResending}
                  className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest hover:text-orange-500 transition-colors disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}