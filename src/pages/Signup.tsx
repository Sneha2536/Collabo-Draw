import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Palette, Mail, Lock, User, UserPlus, ArrowLeft, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from '../components/Logo';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Please complete all fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed. Email might already be taken.');
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
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-xs text-brand-text-sec hover:text-brand-text transition-colors group font-bold px-3 py-2 rounded-xl hover:bg-brand-primary/8 border border-transparent hover:border-brand-primary/15 shadow-sm bg-brand-bg-sec/50 backdrop-blur"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
        
        {/* Left Column: Benefits / Branding Panel (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 overflow-hidden border-r border-brand-border/60 bg-gradient-to-br from-brand-bg-sec/40 via-brand-bg/25 to-brand-bg-sec/10">
          <div className="absolute inset-0 bg-[radial-gradient(var(--border-color)_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

          {/* Brand header snippet */}
          <div className="relative z-10" onClick={() => navigate('/')}>
            <Logo variant="compact" />
          </div>

          {/* Feature List */}
          <div className="relative z-10 my-auto max-w-sm space-y-8 text-left">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" /> Instant Benefits
              </span>
              <h2 className="text-2xl font-display font-bold text-brand-text">Join Collaborative Teams Drawing Boards</h2>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Unlimited Collaborative Canvases', desc: 'Create infinite rooms with zero cap on shape edits.' },
                { title: 'Interactive Multi-Page Files', desc: 'Create as many separate pages per board as needed.' },
                { title: 'Secure Live SSE Broadcast', desc: 'Sync state changes across developers instantly.' },
                { title: 'Version Checkpoints Restoring', desc: 'Rollback board shapes to any previous moment.' },
              ].map((b, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-brand-text">{b.title}</h4>
                    <p className="text-[11px] text-brand-text-sec mt-0.5 leading-relaxed font-semibold">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer info tag */}
          <div className="relative z-10 text-[9px] text-brand-text-sec font-mono font-bold">
            SECURED CONNECTIONS ONLY • CLIENT VERIFIED
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
            {/* Header */}
            <div className="flex flex-col items-center gap-3.5 text-center mb-8">
              <div className="lg:hidden" onClick={() => navigate('/')}>
                <Logo variant="icon-only" />
              </div>
              <h1 className="text-2xl font-sora font-extrabold tracking-tight bg-gradient-to-r from-brand-primary via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Create Free Account
              </h1>
              <p className="text-xs text-brand-text-sec font-semibold">Connect and build with real-time vector tools</p>
            </div>

            {errorMsg && (
              <div className="p-3 mb-5 text-xs font-bold rounded-xl bg-brand-error/10 text-brand-error border border-brand-error/20 text-center animate-shake">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-text-sec mb-2">
                  Full Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-sec" />
                  <input
                    type="text"
                    required
                    placeholder="Sneha Rajak"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-bg-sec/50 border border-brand-border focus:border-brand-primary focus:outline-none transition-all text-xs font-bold text-brand-text shadow-sm"
                  />
                </div>
              </div>

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
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-text-sec mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-sec" />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Sign Up Collaborative Workspace
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-brand-text-sec font-semibold">
              Already have a workspace account?{' '}
              <Link to="/login" className="text-brand-primary hover:opacity-85 font-extrabold underline">
                Log In Here
              </Link>
            </p>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
