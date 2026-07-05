import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, Palette, Check, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from '../components/Logo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-brand-bg text-brand-text font-sans transition-colors duration-500 overflow-hidden">
      
      {/* Background Aurora Orbs */}
      <div className="absolute top-[15%] left-[15%] w-[45vw] h-[45vw] rounded-full aurora-blur pointer-events-none opacity-60" />
      <div className="absolute bottom-[15%] right-[15%] w-[45vw] h-[45vw] rounded-full aurora-blur pointer-events-none opacity-60" />

      {/* Back to Login */}
      <Link
        to="/login"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-xs text-brand-text-sec hover:text-brand-text transition-colors group font-bold px-3 py-2 rounded-xl hover:bg-brand-primary/8 border border-transparent hover:border-brand-primary/15 shadow-sm bg-brand-bg-sec/50 backdrop-blur"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Login
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-3xl glass border border-brand-border/80 shadow-2xl relative z-10 bg-brand-bg-sec/45"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <Link to="/">
            <Logo variant="icon-only" />
          </Link>
          <h1 className="text-2xl font-sora font-extrabold tracking-tight bg-gradient-to-r from-brand-primary via-indigo-400 to-cyan-400 bg-clip-text text-transparent mt-2">
            Reset Password
          </h1>
          <p className="text-xs text-brand-text-sec font-semibold">Get a recovery link to restore dashboard access</p>
        </div>

        {sent ? (
          <div className="text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-brand-success/10 border border-brand-success/20 flex items-center justify-center mx-auto text-brand-success animate-bounce">
              <Check className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-brand-text">Reset Link Dispatched</h3>
              <p className="text-xs text-brand-text-sec leading-relaxed font-semibold">
                An email containing password recovery guidelines has been sent to: <br />
                <span className="text-brand-primary font-mono text-xs font-bold block mt-2 p-1.5 rounded-lg bg-brand-primary/5 border border-brand-primary/10">{email}</span>
              </p>
            </div>
            <Link
              to="/login"
              className="w-full py-3 rounded-xl bg-brand-bg-sec border border-brand-border/80 hover:border-brand-primary/30 text-brand-text text-xs font-bold transition-all inline-block shadow-sm"
            >
              Return to Login Screen
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <p className="text-xs text-brand-text-sec leading-relaxed mb-4 font-semibold">
              Enter your registered email address below. We'll send you a coordinates reset link to verify ownership.
            </p>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-text-sec mb-2">
                Your Email Address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-indigo-600 hover:opacity-95 disabled:opacity-50 text-white text-xs font-extrabold shadow-md shadow-brand-primary/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Dispatching Reset Link...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Send Password Reset Link
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
