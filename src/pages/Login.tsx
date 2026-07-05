import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Palette, Mail, Lock, LogIn, ArrowLeft, Loader2, Sparkles, Shield, Compass, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from '../components/Logo';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect credentials or user does not exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoUserLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await login('sneharajak2006@gmail.com', 'admin123');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg('Failed to log in as default demo user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex bg-brand-bg text-brand-text font-sans transition-colors duration-500 overflow-hidden">
      
      {/* Background Aurora Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full aurora-blur pointer-events-none opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full aurora-blur pointer-events-none opacity-60" />

      {/* Back to Home Link */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-xs text-brand-text-sec hover:text-brand-primary transition-colors group font-bold px-3 py-2 rounded-xl hover:bg-brand-primary/8 border border-transparent hover:border-brand-primary/15 shadow-sm bg-brand-bg-sec/50 backdrop-blur"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Home
      </Link>

      {/* Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
        
        {/* Left Column: Visual Teaser / Artwork Panel (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 overflow-hidden border-r border-brand-border/60 bg-gradient-to-br from-brand-bg-sec/40 via-brand-bg/25 to-brand-bg-sec/10">
          {/* Subtle Ambient Dot Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(var(--border-color)_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

          {/* Brand header snippet */}
          <div className="relative z-10" onClick={() => navigate('/')}>
            <Logo variant="compact" />
          </div>

          {/* Interactive Artwork Mockup illustration */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full max-w-sm rounded-2xl border border-brand-border/80 p-6 glass bg-brand-bg-sec/60 shadow-xl space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                <span className="text-[10px] text-brand-primary font-mono font-bold tracking-wider">COLLABORATION PREVIEW</span>
                <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
              </div>
              <div className="space-y-3 font-mono text-[11px] text-brand-text-sec font-bold">
                <div className="flex items-center gap-2 text-brand-text">
                  <Edit3 className="w-3.5 h-3.5 text-brand-primary" />
                  <span>Interactive Canvas initialized</span>
                </div>
                <div className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-brand-secondary" />
                  <span>Collaborators: 4 editors active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-brand-highlight" />
                  <span>Secure coordinate sockets: Connected</span>
                </div>
              </div>
              <div className="pt-2 border-t border-brand-border/60 flex -space-x-1.5">
                {['SR', 'AR', 'JM', 'TD'].map((initials, idx) => (
                  <div key={idx} className="w-7 h-7 rounded-full border-2 border-brand-bg-sec text-[8px] font-extrabold bg-brand-primary/10 text-brand-primary flex items-center justify-center uppercase shadow-sm">
                    {initials}
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="text-center space-y-2">
              <h2 className="text-lg font-display font-bold text-brand-text flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary" /> Redefining Drawing Boards
              </h2>
              <p className="text-xs text-brand-text-sec max-w-xs mx-auto leading-relaxed font-semibold">
                Build secure, responsive diagrams and collaborate on vector ideas in real-time with zero friction.
              </p>
            </div>
          </div>

          {/* Footer info tag */}
          <div className="relative z-10 text-[9px] text-brand-text-sec font-mono font-bold">
            BUILD 1.0.0 STABLE • SECURITY HIGHLY ENCRYPTED
          </div>
        </div>

        {/* Right Column: Form Panel */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 z-10 relative">
          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md p-8 rounded-3xl glass border border-brand-border/80 shadow-2xl bg-brand-bg-sec/45 relative"
          >
            {/* Form Header */}
            <div className="flex flex-col items-center gap-3.5 text-center mb-8">
              <div className="lg:hidden" onClick={() => navigate('/')}>
                <Logo variant="icon-only" />
              </div>
              <h1 className="text-2xl font-sora font-extrabold tracking-tight bg-gradient-to-r from-brand-primary via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Welcome to Collabo<span className="text-brand-primary font-bold">Draw</span>
              </h1>
              <p className="text-xs text-brand-text-sec font-semibold">Log in to enter your secure collaborative workspaces</p>
            </div>

            {errorMsg && (
              <div className="p-3 mb-5 text-xs font-bold rounded-xl bg-brand-error/10 text-brand-error border border-brand-error/20 text-center animate-shake">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-text-sec mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-sec" />
                  <input
                    type="email"
                    required
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-bg-sec/50 border border-brand-border focus:border-brand-primary focus:outline-none transition-all text-xs font-bold text-brand-text shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-text-sec">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] text-brand-primary hover:opacity-80 font-bold"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-sec" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-bg-sec/50 border border-brand-border focus:border-brand-primary focus:outline-none transition-all text-xs font-bold text-brand-text shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full mt-2 py-3 rounded-xl bg-brand-primary hover:opacity-95 disabled:opacity-50 text-white text-xs font-extrabold shadow-md shadow-brand-primary/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In with Credentials
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-border/60" />
              </div>
              <span className="relative px-3 bg-brand-bg-sec text-[8px] text-brand-text-sec uppercase tracking-wider font-mono font-bold">
                OR CONNECT WITH
              </span>
            </div>

            {/* Social & Shortcut Login buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="py-2.5 rounded-xl border border-brand-border bg-brand-bg-sec/50 hover:bg-brand-bg-sec hover:border-brand-primary/30 text-brand-text transition-all flex items-center justify-center gap-2 text-[11px] font-bold cursor-pointer shadow-sm active:scale-95"
              >
                {googleLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5.04c1.66 0 3.12.57 4.29 1.69l3.19-3.19C17.51 1.63 14.97 1 12 1 7.35 1 3.4 3.65 1.51 7.5l3.61 2.8C6.01 7.15 8.79 5.04 12 5.04z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.46c-.28 1.47-1.11 2.72-2.36 3.56l3.63 2.82c2.12-1.95 3.36-4.83 3.36-8.49z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.12 14.7a7.12 7.12 0 0 1 0-4.4L1.51 7.5a11.94 11.94 0 0 0 0 9l3.61-2.8z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.63-2.82c-1.1.74-2.5 1.18-4.3 1.18-3.21 0-5.99-2.11-6.96-5.26l-3.61 2.8C3.4 20.35 7.35 23 12 23z"
                      />
                    </svg>
                    Google
                  </>
                )}
              </button>

              <button
                onClick={handleDemoUserLogin}
                disabled={loading || googleLoading}
                className="py-2.5 rounded-xl border border-brand-primary/20 bg-brand-primary/6 hover:bg-brand-primary/10 text-brand-primary transition-all flex items-center justify-center gap-1 text-[11px] font-bold cursor-pointer shadow-sm active:scale-95"
                title="Instant access as demo user"
              >
                ⚡ Quick Demo Login
              </button>
            </div>

            <p className="mt-8 text-center text-xs text-brand-text-sec font-semibold">
              Don't have a team account yet?{' '}
              <Link to="/signup" className="text-brand-primary hover:opacity-85 font-extrabold underline">
                Sign Up Free
              </Link>
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
