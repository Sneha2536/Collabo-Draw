import React from 'react';
import { Link } from 'react-router-dom';
import { Home, HelpCircle, Palette } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-brand-bg text-brand-text font-sans relative overflow-hidden">
      <div className="absolute top-[25%] left-[25%] w-[30vw] h-[30vw] rounded-full aurora-blur pointer-events-none" />
      <div className="absolute bottom-[25%] right-[25%] w-[30vw] h-[30vw] rounded-full aurora-blur pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-10 rounded-2xl glass border border-brand-border shadow-2xl text-center space-y-6 bg-brand-bg-sec/45 relative z-10"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-error/10 text-brand-error border border-brand-error/20 text-xs font-bold uppercase tracking-wider">
          Error 404
        </span>

        <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight text-brand-text">
          Canvas Out of Bounds
        </h1>

        <p className="text-sm text-brand-text-sec leading-relaxed max-w-md mx-auto font-medium">
          The collaborative board or page you are searching for does not exist, has been deleted, or resides under a private coordinate. Let’s get you back on track!
        </p>

        {/* Small mockup card */}
        <div className="p-4 rounded-xl bg-brand-bg/50 border border-brand-border max-w-sm mx-auto flex items-center justify-between text-left font-mono text-[11px] text-brand-text-sec font-bold">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-brand-error" />
            <span>Path: {window.location.pathname}</span>
          </div>
          <span className="text-brand-error font-extrabold">DISCONNECTED</span>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-lg shadow-brand-primary/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-bg-sec border border-brand-border hover:bg-brand-bg-sec/80 text-brand-text text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            Sign In Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
