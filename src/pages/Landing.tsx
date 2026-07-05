import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Palette,
  Layers,
  Users,
  MessageSquare,
  History,
  ArrowRight,
  Monitor,
  MousePointer,
  Moon,
  Sun,
  Edit3,
  Image as ImageIcon,
  MousePointerClick,
  CheckCircle,
  Activity,
  Workflow,
  Sparkles,
  Zap,
  Globe,
  Lock,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../components/Logo';

export default function Landing() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const navLinks = [
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'architecture', label: 'Architecture', href: '#architecture' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      const featuresSection = document.getElementById('features');
      const architectureSection = document.getElementById('architecture');

      if (architectureSection && scrollPosition >= architectureSection.offsetTop) {
        setActiveSection('architecture');
      } else if (featuresSection && scrollPosition >= featuresSection.offsetTop) {
        setActiveSection('features');
      } else {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  const cardHoverVariants = {
    hover: {
      y: -8,
      scale: 1.015,
      boxShadow: '0 20px 40px rgba(124, 58, 237, 0.15)',
      borderColor: 'var(--color-primary)',
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  };

  const buttonHoverVariants = {
    hover: {
      scale: 1.03,
      boxShadow: '0 0 20px rgba(124, 58, 237, 0.45)',
      transition: { yoyo: Infinity, duration: 0.4 },
    },
    tap: { scale: 0.97 },
  };

  const features = [
    {
      icon: <Users className="w-5 h-5 text-brand-primary" />,
      title: 'Real-Time Sync Engine',
      desc: 'Collaborate with teammates globally. See active cursors, instant edits, and sync updates with ultra-low latency.',
      badge: 'SSE Broadcast',
      color: 'from-purple-500/10 to-indigo-500/10',
    },
    {
      icon: <Edit3 className="w-5 h-5 text-brand-secondary" />,
      title: 'Rich Vector Tools',
      desc: 'Freehand pencil, high-precision brush, geometric shapes, lines, custom connectors, and responsive brush controls.',
      badge: 'Full Suite',
      color: 'from-emerald-500/10 to-teal-500/10',
    },
    {
      icon: <Layers className="w-5 h-5 text-brand-highlight" />,
      title: 'Infinite Multi-Pages',
      desc: 'Organize complex system designs. Create, duplicate, rename, or order multiple canvas pages in one workspace.',
      badge: 'Multi-Page',
      color: 'from-pink-500/10 to-rose-500/10',
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-indigo-400" />,
      title: 'Integrated Team Chat',
      desc: 'Chat directly in the workspace with real-time indicators, customized user colors, and immediate unread notifications.',
      badge: 'Collaborative',
      color: 'from-blue-500/10 to-indigo-500/10',
    },
    {
      icon: <History className="w-5 h-5 text-amber-500" />,
      title: 'Version History',
      desc: 'Never lose a breakthrough. Browse previous checkpoints with timestamps, editor names, and instant restoration.',
      badge: 'Time-Travel',
      color: 'from-amber-500/10 to-orange-500/10',
    },
    {
      icon: <ImageIcon className="w-5 h-5 text-rose-400" />,
      title: 'Media & Rich Sticky Notes',
      desc: 'Drop in customizable sticky notes, editable text nodes, and upload custom images with full scale, rotate, and locking options.',
      badge: 'Interactive',
      color: 'from-rose-500/10 to-pink-500/10',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-brand-bg text-brand-text font-sans transition-colors duration-500">
      
      {/* Premium Ambient Light-Leaking Aurora Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full pointer-events-none opacity-40 dark:opacity-60 bg-gradient-to-tr from-indigo-500/10 via-emerald-500/5 to-cyan-500/10 blur-[130px]" />
      <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full pointer-events-none opacity-40 dark:opacity-50 bg-gradient-to-br from-amber-500/5 via-indigo-500/10 to-transparent blur-[120px]" />
      <div className="absolute top-[40%] left-[15%] w-[45vw] h-[45vw] rounded-full pointer-events-none opacity-30 dark:opacity-40 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-emerald-500/5 blur-[140px]" />

      {/* Grid Pattern Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Fixed Top Header (Non-floating) */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-brand-border bg-brand-bg-sec/55 backdrop-blur-md">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
          className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
        >
          <motion.div
            initial={{ scale: 0.9, filter: 'drop-shadow(0 0 0px rgba(99,102,241,0))' }}
            animate={{ 
              scale: [0.9, 1.08, 1],
              filter: [
                'drop-shadow(0 0 0px rgba(99,102,241,0))',
                'drop-shadow(0 0 25px rgba(99,102,241,0.65))',
                'drop-shadow(0 0 6px rgba(99,102,241,0.2))'
              ]
            }}
            transition={{
              duration: 1.6,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.35
            }}
            className="flex items-center"
          >
            <Logo variant="navbar" />
          </motion.div>

          <nav 
            className="hidden md:flex items-center gap-2 bg-brand-bg-sec/40 border border-brand-border/60 p-1 rounded-xl text-xs font-bold relative"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {navLinks.map((link, index) => (
              <div key={link.id} className="relative px-0.5 py-0.5">
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      layoutId="navbar-hover"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-primary/12 via-cyan-500/8 to-brand-secondary/12 border border-brand-primary/15 shadow-[0_0_12px_rgba(124,58,237,0.08)] z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    />
                  )}
                </AnimatePresence>
                
                {activeSection === link.id && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20 shadow-sm z-0"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}

                <motion.a 
                  href={link.href}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={`relative z-10 block px-4 py-1.5 rounded-lg transition-colors ${
                    activeSection === link.id 
                      ? 'text-brand-primary' 
                      : 'text-brand-text-sec hover:text-brand-primary'
                  }`}
                  whileHover={{ scale: 1.04, y: -1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {link.label}
                </motion.a>
              </div>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-brand-bg border border-brand-border/60 text-brand-text-sec hover:text-brand-primary hover:border-brand-primary/30 transition-all cursor-pointer shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-primary" />}
            </motion.button>

            {user ? (
              <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap="tap">
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-secondary text-white shadow-lg shadow-brand-primary/20 flex items-center gap-1.5"
                >
                  Enter Workspace
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-brand-text-sec hover:text-brand-primary transition-colors px-3 py-2.5 rounded-xl hover:bg-brand-bg-sec/30"
                >
                  Log In
                </Link>
                <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap="tap">
                  <Link
                    to="/signup"
                    className="h-10 px-5 text-xs font-bold rounded-full bg-gradient-to-r from-brand-primary via-indigo-500 to-brand-secondary text-white shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/30 border border-white/10 flex items-center justify-center transition-all hover:brightness-110"
                  >
                    Sign Up Free
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Navigation Trigger & Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-brand-bg border border-brand-border/60 text-brand-text-sec hover:text-brand-primary hover:border-brand-primary/30 transition-all cursor-pointer shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-primary" />}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl bg-brand-bg-sec border border-brand-border/60 text-brand-text-sec hover:text-brand-primary transition-all cursor-pointer shadow-sm flex items-center justify-center"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </motion.button>
          </div>
        </motion.div>
      </header>

      {/* Mobile Nav Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden fixed top-16 left-0 right-0 z-40 bg-brand-bg-sec/95 backdrop-blur-lg border-b border-brand-border shadow-xl overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4 text-left">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-bold py-2.5 border-b border-brand-border/30 transition-colors block ${
                    activeSection === link.id ? 'text-brand-primary' : 'text-brand-text-sec hover:text-brand-primary'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              
              <div className="pt-2 flex flex-col gap-3">
                {user ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center px-5 py-3 text-xs font-bold rounded-full bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-secondary text-white shadow-lg flex items-center justify-center gap-1.5"
                  >
                    Enter Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full text-center text-xs font-bold text-brand-text-sec hover:text-brand-primary py-2.5 rounded-xl hover:bg-brand-bg/50 transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full text-center h-10 text-xs font-bold rounded-full bg-gradient-to-r from-brand-primary via-indigo-500 to-brand-secondary text-white shadow-md flex items-center justify-center transition-all"
                    >
                      Sign Up Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-24 px-6 max-w-7xl mx-auto z-10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Premium Pitch Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 space-y-6 text-left flex flex-col items-start"
          >
            <motion.div variants={itemVariants} className="inline-block">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/8 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 border border-indigo-500/15 text-[11px] font-extrabold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Real-time • Collaborative • Lightning Fast
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-sora font-extrabold tracking-tight text-brand-text leading-[1.1]"
            >
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Draw</span> Ideas. <br />
              Build Together.
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed font-semibold"
            >
              CollaboDraw is your infinite canvas for real-time collaboration, brainstorming, and building next big ideas together.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4 w-full"
            >
              <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap="tap" className="w-full sm:w-auto">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-6 py-3.5 text-xs font-extrabold rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:brightness-110 text-white shadow-[0_4px_20px_rgba(99,102,241,0.3)] border border-indigo-400/20 flex items-center justify-center gap-2 group"
                >
                  Start Drawing
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <a
                  href="#features"
                  className="w-full sm:w-auto px-6 py-3.5 text-xs font-extrabold rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/80 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-pulse" />
                  Watch Demo
                </a>
              </motion.div>
            </motion.div>


          </motion.div>

          {/* Right Column: Interactive Collab Pitch Canvas Card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 60 }}
            className="lg:col-span-7 w-full relative"
          >
            <div className="relative w-full h-[530px] md:h-auto md:aspect-video rounded-3xl border border-slate-200/80 dark:border-slate-800/85 shadow-2xl overflow-hidden bg-[#090d16] group">
              
              {/* Mock UI Workspace Header */}
              <div className="absolute top-0 left-0 right-0 h-12 border-b border-slate-900/40 flex items-center px-4 justify-between bg-[#04060b] z-20">
                <div className="flex items-center gap-2">
                  <svg className="w-4.5 h-4.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="text-[12px] text-slate-300 font-medium font-mono tracking-wide">
                    collab_pitch_draft_v2.json
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full border border-slate-800/80 bg-slate-950/80 text-[#818cf8] text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                    SSE ACTIVE
                  </span>
                  <div className="flex -space-x-1.5">
                    <div className="w-6.5 h-6.5 rounded-full bg-[#4f46e5] text-white flex items-center justify-center text-[9px] font-extrabold border border-slate-950 shadow-md font-mono">SR</div>
                    <div className="w-6.5 h-6.5 rounded-full bg-[#0d9488] text-white flex items-center justify-center text-[9px] font-extrabold border border-slate-950 shadow-md font-mono">AR</div>
                    <div className="w-6.5 h-6.5 rounded-full bg-[#be185d] text-white flex items-center justify-center text-[9px] font-extrabold border border-slate-950 shadow-md font-mono">+4</div>
                  </div>
                </div>
              </div>

              {/* Dotted Canvas Grid Background */}
              <div 
                className="w-full h-full pt-12 relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#090d16] via-[#06080e] to-[#030407]"
                style={{ backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.08) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
              >
                {/* Ambient glows inside the window */}
                <div className="absolute top-1/4 left-1/3 w-48 h-48 rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-44 h-44 rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none" />

                {/* DEDICATED MOBILE COMPOSITION (Visible only on mobile/tablet) */}
                <div className="md:hidden flex flex-col gap-6 w-full max-w-sm px-5 py-6 relative z-10 self-center">
                  
                  {/* Connecting Vector Arrow with Gradient Glow for mobile */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="vector-arrow-grad-mobile" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                      <marker id="arrow-vector-svg-mobile" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#818cf8" />
                      </marker>
                    </defs>
                    <motion.path 
                      d="M 94,24 C 94,44 15,38 15,58" 
                      fill="none" 
                      stroke="url(#vector-arrow-grad-mobile)" 
                      strokeWidth="0.65" 
                      strokeDasharray="1.5 1.2"
                      markerEnd="url(#arrow-vector-svg-mobile)"
                      animate={{ strokeDashoffset: [-20, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                    />
                  </svg>

                  {/* Authentication Pipeline Node (Readable & Full Size) */}
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                    className="w-full rounded-3xl bg-white border border-slate-200/50 shadow-xl p-5 text-left flex flex-col justify-between relative z-10"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                            <Zap className="w-4.5 h-4.5 fill-indigo-500 text-indigo-600 animate-pulse" />
                          </span>
                          <span className="text-xs font-sora font-extrabold text-slate-900">Authentication Pipeline</span>
                        </div>
                        <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80">NODE A</span>
                      </div>
                      <div className="space-y-3">
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                          <motion.div 
                            initial={{ width: "20%" }}
                            animate={{ width: ["20%", "85%", "45%", "85%"] }}
                            transition={{ 
                              repeat: Infinity, 
                              repeatType: "reverse", 
                              duration: 5, 
                              ease: "easeInOut" 
                            }}
                            className="h-full bg-gradient-to-r from-indigo-500 via-[#818cf8] to-cyan-400 rounded-full relative overflow-hidden"
                          >
                            <motion.div
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            />
                          </motion.div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                          <motion.div 
                            initial={{ width: "15%" }}
                            animate={{ width: ["15%", "60%", "30%", "60%"] }}
                            transition={{ 
                              repeat: Infinity, 
                              repeatType: "reverse", 
                              duration: 4.5, 
                              ease: "easeInOut",
                              delay: 0.5
                            }}
                            className="h-full bg-gradient-to-r from-indigo-400 via-[#c084fc] to-cyan-300 rounded-full relative overflow-hidden"
                          >
                            <motion.div
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{ repeat: Infinity, duration: 1.8, ease: "linear", delay: 0.2 }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono font-bold pt-3.5 border-t border-slate-100 mt-4">
                      <span>COORD: X=124, Y=342</span>
                      <span className="text-indigo-600 flex items-center gap-1 font-extrabold">
                        ACTIVE <CheckCircle className="w-3.5 h-3.5 text-indigo-600 fill-indigo-100" />
                      </span>
                    </div>

                    {/* Small connection circle at the right edge */}
                    <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-3 border-indigo-500 bg-[#090d16] z-10 shadow-md" />
                  </motion.div>

                  {/* Intersecting live user cursors for mobile alignment */}
                  <div className="relative h-14 w-full pointer-events-none">
                    <motion.div 
                      animate={{ x: [0, 4, -1, 0], y: [0, -3, 2, 0] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                      className="absolute top-1 right-[22%] flex items-center gap-1 pointer-events-none z-10"
                    >
                      <MousePointer className="w-4.5 h-4.5 text-indigo-500 fill-indigo-500 drop-shadow-md rotate-[-15deg]" />
                      <span className="px-2 py-0.5 rounded bg-[#6366f1] text-[8.5px] text-white font-bold shadow-md border border-white/10 whitespace-nowrap">Sneha (Owner)</span>
                    </motion.div>

                    <motion.div 
                      animate={{ x: [0, -3, 4, 0], y: [0, 2, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                      className="absolute bottom-1 left-[18%] flex items-center gap-1 pointer-events-none z-10"
                    >
                      <MousePointer className="w-4.5 h-4.5 text-[#10b981] fill-[#10b981] drop-shadow-md rotate-[-15deg]" />
                      <span className="px-2 py-0.5 rounded bg-[#059669] text-[8.5px] text-white font-bold shadow-md border border-white/10 whitespace-nowrap">Alex Rivers</span>
                    </motion.div>
                  </div>

                  {/* Sticky Note (Fully Readable, beautifully styled yellow) */}
                  <motion.div
                    animate={{ rotate: [-0.5, 0.5, -0.5] }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                    className="w-full rounded-3xl bg-[#fef08a] text-slate-800 p-5 shadow-xl border border-yellow-300/40 flex flex-col justify-between relative overflow-hidden z-10"
                  >
                    {/* Paper Curl Fold at Top-Left */}
                    <div className="absolute top-0 left-0 w-4.5 h-4.5 bg-yellow-300 rounded-br-lg shadow-[1px_1px_3px_rgba(0,0,0,0.15)] pointer-events-none" 
                         style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />

                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] bg-slate-900/5 text-slate-800/80 border border-slate-900/10 px-2.5 py-1 rounded-full font-sans font-extrabold uppercase tracking-wider inline-block">POST-IT STICKY</span>
                        <span className="text-xs font-mono opacity-65">📌</span>
                      </div>
                      <p className="leading-relaxed text-[11px] font-bold tracking-tight">
                        Redesign the dashboard and canvas workflow with modern micro-animations, glassmorphism layout cards, and high-contrast colors!
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-[8.5px] font-mono opacity-70 pt-2.5 border-t border-slate-900/10 mt-5">
                      <span className="font-bold">AUTHOR: SNEHA</span>
                      <span className="font-bold">12 MINS AGO</span>
                    </div>
                  </motion.div>

                </div>

                {/* DESKTOP DESCRIPTIVE STAGE (Visible on desktop/tablet) */}
                <div className="hidden md:block absolute inset-0 w-full h-full">
                  
                  {/* Visual Vector Node Card (Authentication Pipeline) */}
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                    className="absolute top-[18%] left-[6%] w-[42%] h-[60%] rounded-3xl bg-white border border-slate-200/50 shadow-[0_15px_40px_rgba(0,0,0,0.25)] p-5 text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                            <Zap className="w-4.5 h-4.5 fill-indigo-500 text-indigo-600 animate-pulse" />
                          </span>
                          <span className="text-[12px] font-sora font-extrabold text-slate-900">Authentication Pipeline</span>
                        </div>
                        <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/80">NODE A</span>
                      </div>
                      <div className="space-y-3">
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                          <motion.div 
                            initial={{ width: "20%" }}
                            animate={{ width: ["20%", "85%", "45%", "85%"] }}
                            transition={{ 
                              repeat: Infinity, 
                              repeatType: "reverse", 
                              duration: 5, 
                              ease: "easeInOut" 
                            }}
                            className="h-full bg-gradient-to-r from-indigo-500 via-[#818cf8] to-cyan-400 rounded-full relative overflow-hidden"
                          >
                            <motion.div
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            />
                          </motion.div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                          <motion.div 
                            initial={{ width: "15%" }}
                            animate={{ width: ["15%", "60%", "30%", "60%"] }}
                            transition={{ 
                              repeat: Infinity, 
                              repeatType: "reverse", 
                              duration: 4.5, 
                              ease: "easeInOut",
                              delay: 0.5
                            }}
                            className="h-full bg-gradient-to-r from-indigo-400 via-[#c084fc] to-cyan-300 rounded-full relative overflow-hidden"
                          >
                            <motion.div
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{ repeat: Infinity, duration: 1.8, ease: "linear", delay: 0.2 }}
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono font-bold pt-3 border-t border-slate-100 mt-auto">
                      <span>COORD: X=124, Y=342</span>
                      <span className="text-indigo-600 flex items-center gap-1 font-extrabold">
                        ACTIVE <CheckCircle className="w-3.5 h-3.5 text-indigo-600 fill-indigo-100" />
                      </span>
                    </div>

                    {/* Connection circle on the right side of the card */}
                    <div className="absolute right-[-7px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-3 border-indigo-500 bg-[#090d16] z-20 shadow-md" />
                  </motion.div>

                  {/* Tangible Post-it Sticky Pad */}
                  <motion.div
                    animate={{ rotate: [1.5, 2.5, 1.5] }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                    className="absolute top-[14%] right-[6%] w-[38%] h-[72%] rounded-3xl bg-[#fef08a] text-slate-800 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] font-bold text-left rotate-2 border border-yellow-300/40 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Paper Curl Fold at Top-Left */}
                    <div className="absolute top-0 left-0 w-4.5 h-4.5 bg-yellow-300 rounded-br-lg shadow-[1px_1px_3px_rgba(0,0,0,0.15)] pointer-events-none" 
                         style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />

                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] bg-slate-900/5 text-slate-800/80 border border-slate-900/10 px-2.5 py-1 rounded-full font-sans font-extrabold uppercase tracking-wider inline-block">POST-IT STICKY</span>
                        <span className="text-xs font-mono opacity-65">📌</span>
                      </div>
                      <p className="leading-relaxed text-[11px] text-slate-800 font-bold tracking-tight">
                        Redesign the dashboard and canvas workflow with modern micro-animations, glassmorphism layout cards, and high-contrast colors!
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-[8.5px] font-mono opacity-70 pt-2 border-t border-slate-900/10 mt-auto">
                      <span>AUTHOR: SNEHA</span>
                      <span>12 MINS AGO</span>
                    </div>
                  </motion.div>

                  {/* Connecting Vector Arrow with Gradient Glow */}
                  <svg className="absolute w-full h-full top-0 left-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="vector-arrow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                      <marker id="arrow-vector-svg" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#818cf8" />
                      </marker>
                    </defs>
                    {/* Curve connecting card right node (approx x=48%, y=48%) to sticky left edge (approx x=56.5%, y=28%) */}
                    <motion.path 
                      d="M 48,48 C 52,48, 51.5,28, 56,28" 
                      fill="none" 
                      stroke="url(#vector-arrow-grad)" 
                      strokeWidth="0.45" 
                      strokeDasharray="1.5 1"
                      markerEnd="url(#arrow-vector-svg)"
                      animate={{ strokeDashoffset: [-20, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                    />
                  </svg>

                  {/* Floating Live Cursors perfectly matching positions in desktop image */}
                  {/* Sneha cursor: underneath the card */}
                  <motion.div 
                    animate={{ x: [0, 5, -2, 0], y: [0, -4, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                    className="absolute top-[63%] left-[20%] flex items-center gap-1.5 pointer-events-none z-10"
                  >
                    <MousePointer className="w-5 h-5 text-[#818cf8] fill-[#818cf8] drop-shadow-xl" />
                    <span className="px-2.5 py-1 rounded-xl bg-[#6366f1] text-[9px] text-white font-extrabold shadow-lg border border-white/20 whitespace-nowrap">Sneha (Owner)</span>
                  </motion.div>

                  {/* Alex Rivers cursor: underneath Sneha's cursor, slightly to the left */}
                  <motion.div 
                    animate={{ x: [0, -4, 6, 0], y: [0, 3, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                    className="absolute top-[75%] left-[29%] flex items-center gap-1.5 pointer-events-none z-10"
                  >
                    <MousePointer className="w-5 h-5 text-[#10b981] fill-[#10b981] drop-shadow-xl" />
                    <span className="px-2.5 py-1 rounded-xl bg-[#059669] text-[9px] text-white font-extrabold shadow-lg border border-white/20 whitespace-nowrap">Alex Rivers</span>
                  </motion.div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid Section */}
      <section id="features" className="scroll-mt-24 py-24 px-6 max-w-7xl mx-auto border-t border-brand-border/60">
        <div className="text-center space-y-4">
          <span className="text-xs uppercase tracking-wider font-extrabold text-brand-primary bg-brand-primary/8 px-4 py-1.5 rounded-full border border-brand-primary/15 inline-block">
            High-Performance Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-brand-text tracking-tight">
            Engineered For Hackathon Speed
          </h2>
          <p className="mt-2 text-sm sm:text-base text-brand-text-sec max-w-xl mx-auto font-semibold">
            Everything you need in a modern collaborative sketch sandbox, synced instantly with zero installation or manual lag.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              custom={index}
              className="p-6 rounded-3xl feature-card flex flex-col justify-between text-left relative group"
            >
              {/* Double-stage Premium Ambient Glow behind the card (Bleeds outside with a soft blur) */}
              <div className={`absolute inset-0 -z-20 bg-gradient-to-tr ${feat.color.replace(/\/10/g, '/20')} dark:${feat.color.replace(/\/10/g, '/30')} blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-115 pointer-events-none`} />
              <div className={`absolute inset-0 -z-10 bg-gradient-to-tr ${feat.color.replace(/\/10/g, '/30')} dark:${feat.color.replace(/\/10/g, '/45')} blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-105 pointer-events-none`} />

              {/* Subtle background colored gradient tint (contained inside the card) */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
                <div className={`absolute inset-0 bg-gradient-to-tr ${feat.color} opacity-0 group-hover:opacity-[0.12] dark:group-hover:opacity-[0.25] transition-opacity duration-500`} />
              </div>

              <div className="space-y-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-brand-bg-sec border border-brand-border flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:border-brand-primary/40 transition-all shadow-sm">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-brand-text flex items-center justify-between gap-2 font-display">
                    {feat.title}
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-brand-bg border border-brand-border/60 text-brand-text-sec rounded-md font-extrabold uppercase shrink-0">{feat.badge}</span>
                  </h3>
                  <p className="text-xs text-brand-text-sec leading-relaxed mt-2.5 font-semibold">{feat.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Technical Architecture Section */}
      <section id="architecture" className="scroll-mt-24 py-20 px-6 max-w-7xl mx-auto border-t border-brand-border/60 bg-brand-bg-sec/25 rounded-3xl border border-brand-border/50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-left space-y-6 p-2 sm:p-6"
          >
            <span className="text-xs font-bold text-brand-secondary bg-brand-secondary/8 px-4 py-1.5 rounded-full border border-brand-secondary/15 uppercase tracking-wider">
              Sync Backbone
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-brand-text tracking-tight leading-none">
              Real-Time Synchronization over SSE Sockets
            </h2>
            <p className="text-sm sm:text-base text-brand-text-sec leading-relaxed font-semibold">
              CollaboDraw utilizes an ultra-reliable Server-Sent Events (SSE) stream running over standard HTTP transport layers. When any user updates a drawing coordinate or element, the delta packet is instantly broadcast to all connected peer workspaces in less than 40 milliseconds.
            </p>

            <ul className="space-y-4">
              {[
                'Zero connection handshaking overhead compared to raw WebSockets.',
                'Native browser HTTP recovery with automatic client-side stream reconnection.',
                'Idempotent coordinate schemas guarantee state synchronization security.',
                'Lightweight Express server broadcast loops consume near-zero CPU.',
              ].map((item, idx) => (
                <motion.li
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-brand-text-sec font-semibold"
                >
                  <CheckCircle className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Graphical diagram representing the workflow */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-6 rounded-3xl glass border border-brand-border/80 bg-brand-bg-sec/50 flex flex-col gap-6 text-left shadow-xl"
          >
            <h3 className="text-[10px] font-mono font-extrabold text-brand-primary uppercase tracking-wider border-b border-brand-border/60 pb-3.5 flex items-center justify-between">
              <span>SYSTEM SIGNAL PIPELINE</span>
              <span className="flex items-center gap-1 bg-brand-success/10 px-2.5 py-1 rounded-lg border border-brand-success/20 text-brand-success text-[9px] font-mono font-extrabold tracking-wide"><Activity className="w-3.5 h-3.5 text-brand-success animate-pulse" /> LIVE CORE</span>
            </h3>

            <div className="flex flex-col gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/15 relative overflow-hidden group hover:border-brand-primary/30 transition-all">
                <div className="flex items-center justify-between font-bold text-brand-primary text-[11px]">
                  <span>1. USER COORDINATES DISPATCH</span>
                  <span className="px-2 py-0.5 bg-brand-primary/15 rounded text-[9px] font-extrabold">CLIENT</span>
                </div>
                <p className="text-[10px] text-brand-text-sec mt-2 font-sans font-semibold">Collaborator resizes or moves a vector box element on the canvas viewport.</p>
              </div>

              <div className="text-center text-brand-text-sec text-[10px] font-extrabold flex items-center justify-center gap-2">
                <Workflow className="w-4 h-4 text-brand-primary animate-pulse" />
                <span className="uppercase font-bold text-brand-text">HTTP PUT API DELTA STREAM</span>
              </div>

              <div className="p-4 rounded-2xl bg-brand-secondary/5 border border-brand-secondary/15 hover:border-brand-secondary/30 transition-all">
                <div className="flex items-center justify-between font-bold text-brand-secondary text-[11px]">
                  <span>2. PERSISTENCE PERSISTENCE</span>
                  <span className="px-2 py-0.5 bg-brand-secondary/15 rounded text-[9px] font-extrabold">SERVER</span>
                </div>
                <p className="text-[10px] text-brand-text-sec mt-2 font-sans font-semibold">Validates board payload schema, commits coordinate history logs in RAM, and pushes forward.</p>
              </div>

              <div className="text-center text-brand-text-sec text-[10px] font-extrabold flex items-center justify-center gap-2">
                <Workflow className="w-4 h-4 text-brand-secondary animate-pulse" />
                <span className="uppercase font-bold text-brand-text">SSE BROADCAST SOCKET MUTICAST</span>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center justify-between font-bold text-indigo-400 text-[11px]">
                  <span>3. IMMEDIATE SYNCHRONIZATION</span>
                  <span className="px-2 py-0.5 bg-indigo-500/15 rounded text-[9px] font-extrabold">PEERS</span>
                </div>
                <p className="text-[10px] text-brand-text-sec mt-2 font-sans font-semibold">Peer interfaces grab coordinate packets and paint updates locally with zero HMR lag.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive CTA Banner */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-8 sm:p-16 rounded-3xl bg-gradient-to-tr from-brand-bg-sec/80 via-brand-primary/10 to-brand-bg-sec/40 border border-brand-primary/20 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle decoration lines inside banner */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-secondary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 animate-bounce" /> INSTANT ENTRY
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-brand-text tracking-tight">
              Ready to Draw with Your Team?
            </h2>
            <p className="text-xs sm:text-base text-brand-text-sec font-semibold leading-relaxed">
              Ditch slow static wires. Create a canvas sandbox now, invite collaborators by sending a code, and design in real-time.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
              <motion.div variants={buttonHoverVariants} whileHover="hover" whileTap="tap" className="w-full sm:w-auto">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-8 py-4 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-primary to-indigo-600 text-white shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2"
                >
                  Create Your Free Account <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 text-xs font-bold rounded-xl bg-brand-bg border border-brand-border/80 hover:border-brand-primary/30 text-brand-text transition-all flex items-center justify-center shadow-sm"
              >
                Access Account Coordinates
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-border/60 py-12 px-6 bg-brand-bg-sec/20 text-center relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo variant="footer" />

          <p className="text-xs text-brand-text-sec font-semibold">
            &copy; 2026 CollaboDraw. Designed for modern design sprinters & creative hackathons.
          </p>

          <div className="flex gap-4">
            <span className="text-[10px] px-3.5 py-1.5 rounded-lg bg-brand-primary/5 border border-brand-primary/15 font-mono font-bold tracking-tight text-brand-primary">
              Build Version: 1.0.0 Stable
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
