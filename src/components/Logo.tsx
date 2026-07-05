import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  variant?: 'horizontal' | 'icon-only' | 'navbar' | 'footer' | 'compact';
  className?: string;
  onClick?: () => void;
}

export default function Logo({ variant = 'horizontal', className = '', onClick }: LogoProps) {
  // Redesigned Brand Identity: CollaboDraw
  // Concept: A high-fidelity, interactive vector workspace.
  // Visuals: A stylized grid, glowing bezier handles, a fluid 3D-feeling infinity ribbon,
  // and multi-user cursors that animate on hover alongside vector anchor points.
  const renderIcon = () => {
    let sizeClass = 'w-10 h-10';
    if (variant === 'compact') sizeClass = 'w-8.5 h-8.5';
    if (variant === 'footer') sizeClass = 'w-10 h-10';
    if (variant === 'icon-only') sizeClass = 'w-13 h-13';

    return (
      <motion.div
        whileHover={{ scale: 1.06, rotate: -1.5 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={`${sizeClass} rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden transition-all duration-300 shadow-lg group-hover:shadow-[0_0_24px_rgba(99,102,241,0.35)] group-hover:border-indigo-500/50`}
      >
        {/* Tech Blueprint Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(129,140,248,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(129,140,248,0.2)_1px,transparent_1px)] [background-size:4px_4px] pointer-events-none" />
        
        {/* Floating Radial Ambient Light Sources */}
        <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-cyan-500/10 blur-md pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-pink-500/10 blur-md pointer-events-none" />
        
        {/* Dynamic Hover Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
        
        <svg
          className="w-[72%] h-[72%] text-white relative z-10"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Outer Target ring */}
          <circle
            cx="16"
            cy="16"
            r="14"
            className="stroke-slate-800/60 group-hover:stroke-indigo-500/30 transition-colors duration-300"
            strokeWidth="0.75"
            strokeDasharray="1 3"
          />

          {/* Core Whiteboard Canvas Boundary Box */}
          <rect
            x="4"
            y="4"
            width="24"
            height="24"
            rx="6"
            className="stroke-slate-800 group-hover:stroke-indigo-400/50 transition-colors duration-300"
            strokeWidth="1.5"
          />

          {/* Vector Blueprint Guide Lines */}
          <line x1="4" y1="16" x2="28" y2="16" className="stroke-slate-800/40" strokeWidth="0.75" strokeDasharray="3 3" />
          <line x1="16" y1="4" x2="16" y2="28" className="stroke-slate-800/40" strokeWidth="0.75" strokeDasharray="3 3" />

          {/* Vector Bezier Handles (The ultimate designer touch!) */}
          <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-400">
            {/* Left anchor control handle */}
            <line x1="8" y1="16" x2="8" y2="11" stroke="#38bdf8" strokeWidth="0.75" />
            <circle cx="8" cy="11" r="1.5" fill="#38bdf8" />
            
            {/* Right anchor control handle */}
            <line x1="24" y1="16" x2="24" y2="21" stroke="#f43f5e" strokeWidth="0.75" />
            <circle cx="24" cy="21" r="1.5" fill="#f43f5e" />
          </g>

          {/* Glow Shadow Behind the Infinity Curve */}
          <path
            d="M 8 16 C 8 10, 14 10, 16 16 C 18 22, 24 22, 24 16 C 24 10, 18 10, 16 16 C 14 22, 8 22, 8 16 Z"
            className="stroke-indigo-500/30 group-hover:stroke-fuchsia-500/50 transition-colors duration-400 blur-[1.5px]"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* The Glowing Infinity Path (Animated dash flow on hover) */}
          <motion.path
            d="M 8 16 C 8 10, 14 10, 16 16 C 18 22, 24 22, 24 16 C 24 10, 18 10, 16 16 C 14 22, 8 22, 8 16 Z"
            stroke="url(#logo-ultimate-gradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            animate={{
              strokeDasharray: ["6 4", "12 6", "6 4"],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "linear",
            }}
          />

          {/* Active Collaborator Cursor A (Indigo-Cyan) */}
          <motion.g
            animate={{
              x: [0, 1.5, -0.5, 0],
              y: [0, -1, 1.5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
            }}
            className="transition-transform duration-300"
          >
            <path
              d="M 23 11.5 L 27.5 13.5 L 25.3 14 L 26.3 16.5 L 25 17.2 L 24 14.8 L 22 16 Z"
              className="fill-cyan-400 stroke-slate-950"
              strokeWidth="0.8"
            />
          </motion.g>

          {/* Active Collaborator Cursor B (Neon Pink) */}
          <motion.g
            animate={{
              x: [0, -1.5, 0.8, 0],
              y: [0, 1.2, -1, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3.5,
              ease: "easeInOut",
            }}
            className="transition-transform duration-300"
          >
            <path
              d="M 9.5 19.5 L 5 17.5 L 7.2 17 L 6.2 14.5 L 7.5 13.8 L 8.5 16.2 L 10.5 15 Z"
              className="fill-fuchsia-400 stroke-slate-950"
              strokeWidth="0.8"
            />
          </motion.g>

          {/* Center Point - Interaction Hub */}
          <circle
            cx="16"
            cy="16"
            r="1.75"
            className="fill-white stroke-slate-950"
            strokeWidth="1"
          />
          <circle
            cx="16"
            cy="16"
            r="0.75"
            className="fill-indigo-500"
          />

          {/* Vector Anchor Points at extreme loops */}
          <rect x="7" y="15" width="2" height="2" className="fill-cyan-400 stroke-slate-950" strokeWidth="0.5" />
          <rect x="23" y="15" width="2" height="2" className="fill-fuchsia-400 stroke-slate-950" strokeWidth="0.5" />

          <defs>
            <linearGradient id="logo-ultimate-gradient" x1="6" y1="16" x2="26" y2="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6366F1" />      {/* Vivid Indigo */}
              <stop offset="45%" stopColor="#EC4899" />     {/* Hot Pink */}
              <stop offset="75%" stopColor="#F43F5E" />     {/* Rose Red */}
              <stop offset="100%" stopColor="#06B6D4" />    {/* Cyber Cyan */}
            </linearGradient>
          </defs>
        </svg>

        {/* Small sparkling star overlay on hover */}
        <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <motion.div
            animate={{ rotate: 360, scale: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="text-[8px] text-yellow-300"
          >
            ✦
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const renderWordmark = () => {
    let sizeClass = 'text-xl sm:text-2xl';
    let subtextClass = 'text-[8px]';
    if (variant === 'compact') {
      sizeClass = 'text-lg sm:text-xl';
      subtextClass = 'text-[7px]';
    }
    if (variant === 'footer') {
      sizeClass = 'text-lg';
      subtextClass = 'text-[7px]';
    }

    return (
      <div className="flex flex-col text-left justify-center select-none">
        <div className="relative flex items-center leading-none">
          {/* Soft backlighting / glow for the wordmark text */}
          <span className={`absolute inset-0 ${sizeClass} font-sora font-extrabold tracking-[-0.04em] bg-gradient-to-r from-indigo-500 via-pink-500 to-cyan-400 bg-[size:200%_auto] bg-clip-text text-transparent blur-[6px] opacity-40 dark:opacity-70 animate-wordmark-gradient`}>
            CollaboDraw
          </span>
          {/* High-definition foreground gradient text */}
          <span className={`relative ${sizeClass} font-sora font-extrabold tracking-[-0.04em] bg-gradient-to-r from-indigo-600 via-pink-500 to-cyan-500 dark:from-indigo-400 dark:via-fuchsia-400 dark:to-cyan-400 bg-[size:200%_auto] bg-clip-text text-transparent animate-wordmark-gradient flex items-center gap-1`}>
            CollaboDraw
            {/* Live pulsing collaboration node */}
            <span className="relative flex h-2 w-2 ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </span>
        </div>
        {variant !== 'footer' && (
          <span className={`${subtextClass} text-slate-500 dark:text-slate-400 font-mono tracking-[0.24em] font-extrabold uppercase mt-1 flex items-center gap-1.5`}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500/80" />
            Infinite Canvas
          </span>
        )}
        {variant === 'footer' && (
          <span className={`${subtextClass} text-slate-500 dark:text-slate-400 font-mono tracking-[0.2em] font-extrabold uppercase mt-1 flex items-center gap-1.5`}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-500/80 animate-pulse" />
            Active Cloud Hub
          </span>
        )}
      </div>
    );
  };

  if (variant === 'icon-only') {
    return (
      <div className={`inline-block group cursor-pointer ${className}`} onClick={onClick}>
        {renderIcon()}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 group cursor-pointer ${className}`} onClick={onClick}>
      {renderIcon()}
      {renderWordmark()}
    </div>
  );
}
