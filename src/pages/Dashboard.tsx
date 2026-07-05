import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Palette,
  Layout,
  Plus,
  Compass,
  Star,
  Users,
  Search,
  Settings,
  User,
  LogOut,
  Trash2,
  Calendar,
  Check,
  ChevronRight,
  FolderOpen,
  FileText,
  Moon,
  Sun,
  X,
  Sparkles,
  Cloud,
  CheckCircle,
  Clock,
  LayoutGrid,
  Zap,
  TrendingUp,
  Activity,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  History,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Board } from '../types';
import Logo from '../components/Logo';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;

  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Dashboard Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen font-sans flex flex-col justify-center items-center text-brand-text bg-brand-bg p-6 text-center">
          <div className="max-w-md p-8 rounded-3xl glass border border-brand-border/60 bg-brand-bg-sec/45 shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
              <Activity className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-display font-extrabold text-brand-text">Workspace Rendering Failure</h2>
              <p className="text-xs text-brand-text-sec font-semibold">
                An unexpected component rendering error has occurred in your workspace.
              </p>
            </div>
            {this.state.error && (
              <pre className="text-left text-[10px] font-mono bg-brand-bg p-4 rounded-xl border border-brand-border/60 overflow-x-auto text-red-500/90 max-h-40 whitespace-pre-wrap leading-relaxed">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-md hover:opacity-95"
            >
              Reinitialize Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardComponent />
    </ErrorBoundary>
  );
}

function DashboardComponent() {
  const { user, logout, updateProfile, loading: authLoading } = useAuth();
  const { theme, preference, setTheme } = useTheme();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Synchronize profile states once user object loads
  useEffect(() => {
    if (user) {
      setProfileName(user.displayName || '');
      setProfileBio(user.bio || '');
      setProfilePhoto(user.photoURL || '');
    }
  }, [user]);

  const [activeTab, setActiveTab] = useState<'boards' | 'profile' | 'settings'>('boards');
  const [boards, setBoards] = useState<Board[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'mine' | 'shared' | 'starred'>('all');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Time tracker for visual premium telemetry
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [creatingBoard, setCreatingBoard] = useState(false);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinBoardId, setJoinBoardId] = useState('');
  const [joiningBoard, setJoiningBoard] = useState(false);

  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Profile Form States
  const [profileName, setProfileName] = useState(user?.displayName || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.photoURL || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Fetch boards for user
  const fetchBoards = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/boards?userId=${user.uid}&t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setBoards(data.boards);
      } else {
        throw new Error(data.error || 'Failed to fetch boards');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Server error loading boards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('deleted') === 'true') {
      setSuccessToast('This whiteboard was deleted by its owner.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Create board
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim() || !user) return;

    setCreatingBoard(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBoardName.trim(),
          ownerId: user.uid,
          ownerName: user.displayName,
          ownerEmail: user.email,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowCreateModal(false);
        setNewBoardName('');
        navigate(`/board/${data.board.id}`);
      } else {
        throw new Error(data.error || 'Failed to create board');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not connect to server');
    } finally {
      setCreatingBoard(false);
    }
  };

  // Join board
  const handleJoinBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinBoardId.trim() || !user) return;

    setJoiningBoard(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/boards/${joinBoardId.trim()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Whiteboard not found. Please verify the ID.');
      }

      const colRes = await fetch(`/api/boards/${joinBoardId.trim()}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          role: 'editor',
        }),
      });
      const colData = await colRes.json();
      if (colRes.ok || colData.error?.includes('already a collaborator')) {
        setShowJoinModal(false);
        setJoinBoardId('');
        navigate(`/board/${joinBoardId.trim()}`);
      } else {
        throw new Error(colData.error || 'Could not join board');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred joining the board');
    } finally {
      setJoiningBoard(false);
    }
  };

  // Delete board (Only owner)
  const handleDeleteBoard = async (boardId: string) => {
    if (!user) return;
    setIsDeleting(true);
    setErrorMsg(null);
    setSuccessToast(null);

    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      const data = await res.json();
      if (res.ok) {
        // Synchronously update UI immediately
        setBoards((prev) => prev.filter((b) => b.id !== boardId));
        setSuccessToast('Your whiteboard and all associated drawing data was deleted successfully.');
        setBoardToDelete(null);
        // Refresh from server in the background without showing full loading spinner
        fetch(`/api/boards?userId=${user.uid}&t=${Date.now()}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.boards) {
              setBoards(d.boards);
            }
          })
          .catch(console.error);
      } else {
        setErrorMsg(data.error || 'Only the board owner can delete this whiteboard.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Error connecting to the server to delete whiteboard.');
    } finally {
      setIsDeleting(false);
      setBoardToDelete(null);
    }
  };

  // Toggle favorite board
  const handleToggleFavorite = async (boardId: string, currentFav: boolean) => {
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentFav }),
      });
      if (res.ok) {
        setBoards((prev) =>
          prev.map((b) => (b.id === boardId ? { ...b, isFavorite: !currentFav } : b))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    setUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      await updateProfile(profileName, profileBio, profilePhoto);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Filtering Logic
  const filteredBoards = boards.filter((b) => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'mine') return b.ownerId === user?.uid;
    if (filter === 'shared') return b.ownerId !== user?.uid;
    if (filter === 'starred') return !!b.isFavorite;
    return true;
  });

  const ownedBoards = boards.filter((b) => b.ownerId === user?.uid);
  const sharedBoards = boards.filter((b) => b.ownerId !== user?.uid);
  const favoriteBoards = boards.filter((b) => b.isFavorite);

  // Layout motion animations
  const pageContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const widgetVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 14 },
    },
  };

  if (authLoading) {
    return (
      <div className="min-h-screen font-sans flex flex-col justify-center items-center text-brand-text bg-brand-bg relative overflow-hidden">
        {/* Background Aurora Orbs */}
        <div className="absolute top-[-15%] right-[-15%] w-[60vw] h-[60vw] rounded-full aurora-blur pointer-events-none opacity-50" />
        <div className="absolute bottom-[-15%] left-[-15%] w-[60vw] h-[60vw] rounded-full aurora-blur pointer-events-none opacity-50" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(124,58,237,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,58,237,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <Logo variant="horizontal" className="scale-110 mb-2" />
          <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
          <span className="text-xs text-brand-text-sec font-mono font-bold uppercase tracking-wider mt-2">Verifying credentials...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Derive human greeting based on real-time hours
  const hours = currentTime.getHours();
  const greetingText =
    hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen font-sans flex flex-col transition-colors duration-500 text-brand-text bg-brand-bg relative overflow-x-hidden">
      
      {/* Background Aurora Orbs */}
      <div className="absolute top-[-15%] right-[-15%] w-[60vw] h-[60vw] rounded-full aurora-blur pointer-events-none opacity-50" />
      <div className="absolute bottom-[-15%] left-[-15%] w-[60vw] h-[60vw] rounded-full aurora-blur pointer-events-none opacity-50" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(124,58,237,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(124,58,237,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-brand-border bg-brand-bg-sec/55 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Logo variant="footer" onClick={() => navigate('/')} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            {/* Quick Profile Widget */}
            <div className="flex items-center gap-3 pr-4 border-r border-brand-border/60">
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.displayName)}`}
                alt={user.displayName}
                className="w-9 h-9 rounded-full object-cover border border-brand-primary bg-brand-bg-sec shadow-sm cursor-pointer"
                referrerPolicy="no-referrer"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-brand-text leading-none flex items-center gap-1.5">
                  {user.displayName}
                  <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
                </div>
                <div className="text-[9px] text-brand-text-sec font-mono font-bold mt-1 uppercase tracking-wide">{user.email}</div>
              </div>
            </div>

            {/* Logout button */}
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-2.5 rounded-xl bg-brand-bg border border-brand-border/60 text-brand-text-sec hover:text-brand-error hover:border-brand-error/20 transition-all cursor-pointer shadow-sm"
              title="Sign Out Account"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Sidebar controllers */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          {/* Action trigger wizards */}
          <div className="flex flex-col gap-2.5">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-primary via-indigo-600 to-indigo-700 text-white font-extrabold shadow-lg shadow-brand-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider font-mono"
            >
              <Plus className="w-4.5 h-4.5" />
              New Whiteboard
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowJoinModal(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-bg-sec/80 border border-brand-border/80 text-brand-text hover:border-brand-primary/30 hover:bg-brand-bg-sec transition-all flex items-center justify-center gap-2 font-bold cursor-pointer shadow-sm text-xs"
            >
              <Users className="w-4 h-4 text-brand-primary" />
              Join Board by ID
            </motion.button>
          </div>

          {/* Premium Dashboard Navigation with sliding pill background */}
          <nav className="flex flex-col gap-1 text-left border-t border-b border-brand-border/60 py-4 relative">
            {[
              { id: 'boards', label: 'My Whiteboards', icon: <Layout className="w-4 h-4" /> },
              { id: 'profile', label: 'My Profile Card', icon: <User className="w-4 h-4" /> },
              { id: 'settings', label: 'Workspace Settings', icon: <Settings className="w-4 h-4" /> },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                    isActive ? 'text-brand-primary' : 'text-brand-text-sec hover:text-brand-text'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeDashboardTab"
                      className="absolute inset-0 bg-brand-primary/10 border border-brand-primary/25 rounded-xl z-0"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-brand-primary' : 'text-brand-text-sec'}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Real-Time Statistics telemetry widget */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-5 rounded-2xl glass border border-brand-border/75 text-left bg-brand-bg-sec/45 shadow-sm space-y-4"
          >
            <h3 className="text-[10px] font-mono font-extrabold text-brand-text-sec uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary animate-pulse" /> DRAFT COORDINATES
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-brand-bg/60 border border-brand-border/40 text-center shadow-sm">
                <span className="block text-xl font-bold font-display text-brand-primary">{ownedBoards.length}</span>
                <span className="text-[9px] text-brand-text-sec font-mono uppercase tracking-wider font-extrabold">Owned</span>
              </div>
              <div className="p-3.5 rounded-xl bg-brand-bg/60 border border-brand-border/40 text-center shadow-sm">
                <span className="block text-xl font-bold font-display text-brand-secondary">{sharedBoards.length}</span>
                <span className="text-[9px] text-brand-text-sec font-mono uppercase tracking-wider font-extrabold">Shared</span>
              </div>
            </div>

            <div className="pt-2.5 flex items-center justify-between text-[10px] text-brand-text-sec font-mono font-bold border-t border-brand-border/60">
              <span>FAVORITES:</span>
              <span className="font-extrabold text-brand-highlight flex items-center gap-1 bg-brand-highlight/10 px-2.5 py-0.5 rounded-lg border border-brand-highlight/20">
                <Star className="w-3 h-3 fill-brand-highlight text-brand-highlight" />
                {favoriteBoards.length}
              </span>
            </div>
          </motion.div>
        </aside>

        {/* RIGHT COLUMN: Content Panels based on tabs */}
        <main className="lg:col-span-9 flex flex-col gap-6 text-left">
          
          {/* TAB 1: BOARDS */}
          {activeTab === 'boards' && (
            <motion.div 
              variants={pageContainerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 animate-pulse" />
                    <span>{errorMsg}</span>
                  </div>
                  <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:opacity-85 text-sm font-mono font-bold cursor-pointer">×</button>
                </div>
              )}

              {successToast && (
                <div className="p-4 rounded-2xl bg-brand-success/10 border border-brand-success/20 text-brand-success text-xs font-bold flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-success" />
                    <span>{successToast}</span>
                  </div>
                  <button onClick={() => setSuccessToast(null)} className="text-brand-success hover:opacity-85 text-sm font-mono font-bold cursor-pointer">×</button>
                </div>
              )}

              {/* Premium Dashboard Hero Header Greeting */}
              <motion.div
                variants={widgetVariants}
                className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-brand-primary/25 bg-gradient-to-tr from-brand-bg-sec/80 via-brand-primary/10 to-brand-bg-sec/45 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                {/* Glowing design lines background */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-secondary/5 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-2 relative z-10 text-left">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-brand-primary/10 border border-brand-primary/15 text-[10px] font-mono font-extrabold text-brand-primary uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3 text-brand-primary" /> WORKSPACE LIVE
                    </span>
                    <span className="text-[10px] text-brand-text-sec font-mono font-bold">
                      {currentTime.toISOString().split('T')[0]}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-brand-text tracking-tight leading-none">
                    {greetingText}, {user.displayName || 'Architect'}
                  </h1>
                  <p className="text-xs text-brand-text-sec max-w-md font-semibold">
                    Manage sandbox mockups, orchestrate architecture nodes, and enter infinite vector drafting stages.
                  </p>
                </div>

                {/* Digital Clock widget */}
                <div className="px-4 py-2.5 rounded-xl bg-brand-bg/60 border border-brand-border/60 text-center font-mono shadow-sm flex items-center gap-2 relative z-10">
                  <Clock className="w-4 h-4 text-brand-primary" />
                  <span className="text-xs font-bold text-brand-text">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </motion.div>

              {/* Floating Widgets / Mini Action Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Infinite Vector Sandbox',
                    desc: 'Fully loaded design tools resembling Figma with full multi-page boards.',
                    icon: <Palette className="w-4.5 h-4.5 text-brand-primary" />,
                    action: () => setShowCreateModal(true),
                    badge: 'Vectors',
                  },
                  {
                    title: 'Synchronized Chat Rooms',
                    desc: 'Real-time collaborative chat directly embedded into coordinates.',
                    icon: <Users className="w-4.5 h-4.5 text-brand-secondary" />,
                    action: () => setShowJoinModal(true),
                    badge: 'SSE Chat',
                  },
                  {
                    title: 'Version Backups Logs',
                    desc: 'Rollback edits with chronological timestamp restore coordinates.',
                    icon: <History className="w-4.5 h-4.5 text-brand-highlight" />,
                    action: () => setActiveTab('settings'),
                    badge: 'Backups',
                  },
                ].map((wid, idx) => (
                  <motion.div
                    key={idx}
                    variants={widgetVariants}
                    whileHover={{ y: -4, borderColor: 'var(--color-primary)' }}
                    onClick={wid.action}
                    className="p-4 rounded-2xl glass border border-brand-border bg-brand-bg-sec/30 text-left space-y-3 cursor-pointer hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-brand-bg border border-brand-border group-hover:bg-brand-primary/5 group-hover:border-brand-primary/30 transition-colors">
                        {wid.icon}
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-brand-bg px-2 py-0.5 border border-brand-border rounded text-brand-text-sec uppercase">{wid.badge}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-brand-text flex items-center gap-1 group-hover:text-brand-primary transition-colors">
                        {wid.title} <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-[10px] text-brand-text-sec leading-relaxed font-semibold">{wid.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Filter controls and Search Bar */}
              <motion.div 
                variants={widgetVariants}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-bg-sec/30 p-4 rounded-2xl border border-brand-border/60"
              >
                {/* Filter list */}
                <div className="flex flex-wrap gap-1 bg-brand-bg border border-brand-border/60 p-1 rounded-xl text-[10px] font-bold">
                  {[
                    { id: 'all', label: 'All Boards' },
                    { id: 'mine', label: 'Owned Sandbox' },
                    { id: 'shared', label: 'Shared Coordinate' },
                    { id: 'starred', label: 'Starred' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                        filter === f.id
                          ? 'bg-brand-primary text-white shadow-sm'
                          : 'text-brand-text-sec hover:text-brand-text hover:bg-brand-bg-sec/50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Search Bar Row */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-sec" />
                  <input
                    type="text"
                    placeholder="Search files by coordinate coordinates name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-brand-bg-sec/40 border border-brand-border focus:border-brand-primary focus:outline-none transition-all font-semibold text-brand-text shadow-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-sec hover:text-brand-text">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Main Board List section */}
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 border border-brand-border/60 rounded-2xl glass bg-brand-bg-sec/25">
                  <RefreshCw className="w-7 h-7 text-brand-primary animate-spin" />
                  <span className="text-xs text-brand-text-sec font-mono font-bold uppercase tracking-wider">Synchronizing cloud files...</span>
                </div>
              ) : filteredBoards.length === 0 ? (
                /* Empty States */
                <motion.div 
                  variants={widgetVariants}
                  className="p-12 text-center rounded-2xl border border-brand-border/60 glass py-16 space-y-4 bg-brand-bg-sec/25 shadow-sm"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary/8 border border-brand-primary/15 flex items-center justify-center mx-auto text-brand-primary">
                    <FolderOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-text">No Coordinate Whiteboards</h3>
                    <p className="text-xs text-brand-text-sec max-w-xs mx-auto mt-1 font-semibold leading-relaxed">
                      {searchQuery
                        ? `No sandbox boards found matching your filter coordinate "${searchQuery}"`
                        : 'Create your first collaborative drawing page to start drafting architectural ideas with teammates.'}
                    </p>
                  </div>
                  {!searchQuery && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCreateModal(true)}
                      className="px-5 py-2.5 text-xs font-bold rounded-xl bg-brand-primary text-white flex items-center gap-1.5 mx-auto shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Create Sandbox Board
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                /* Beautiful boards list grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredBoards.map((board) => (
                    <motion.div
                      key={board.id}
                      variants={widgetVariants}
                      whileHover={{ y: -6, scale: 1.008, boxShadow: '0 15px 30px rgba(124, 58, 237, 0.1)' }}
                      className="rounded-2xl glass border border-brand-border shadow-sm overflow-hidden flex flex-col h-56 justify-between p-5 relative bg-brand-bg-sec/45 hover:border-brand-primary/40 transition-all group"
                    >
                      {/* Favorite Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(board.id, !!board.isFavorite);
                        }}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-brand-bg-sec/80 border border-brand-border hover:border-brand-primary/30 hover:bg-brand-bg-sec transition-all z-20 cursor-pointer shadow-sm active:scale-90"
                      >
                        <Star
                          className={`w-4 h-4 transition-all ${
                            board.isFavorite ? 'fill-brand-highlight text-brand-highlight' : 'text-brand-text-sec hover:text-brand-text'
                          }`}
                        />
                      </motion.button>

                      {/* Header metadata layout */}
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-brand-primary" />
                          <span className="text-[9px] text-brand-primary font-mono font-extrabold tracking-wider uppercase bg-brand-primary/8 px-2 py-0.5 rounded border border-brand-primary/10">
                            {board.ownerId === user.uid ? 'OWNED' : 'COLLABORATOR'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-brand-text pr-10 line-clamp-1 leading-tight font-display group-hover:text-brand-primary transition-colors">
                          {board.name}
                        </h3>
                      </div>

                      {/* Figma/Miro Style Mock Drawing Preview Graphic - HUGE VISUAL LEVEl-UP */}
                      <div className="h-16 w-full rounded-xl bg-brand-bg/60 border border-brand-border/50 p-2.5 flex items-center justify-between relative overflow-hidden select-none pointer-events-none">
                        <div className="absolute inset-0 canvas-grid opacity-20" />
                        
                        {/* Fake geometry vector shapes on grid */}
                        <div className="flex items-center gap-2.5 relative z-10">
                          <div className="w-8 h-8 rounded-lg bg-brand-primary/5 border border-brand-primary/25 flex items-center justify-center text-[10px] text-brand-primary font-bold shadow-sm">N1</div>
                          
                          <svg className="w-12 h-5 text-brand-primary/40 group-hover:text-brand-primary/70 transition-colors" viewBox="0 0 50 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M5 10 h40" strokeDasharray="4,3" />
                            <circle cx="45" cy="10" r="2.5" fill="currentColor" />
                          </svg>

                          <div className="w-14 h-7 rounded-lg bg-brand-secondary/5 border border-brand-secondary/25 flex items-center justify-center text-[8px] font-mono text-brand-secondary font-extrabold uppercase shadow-xs">SSE COORD</div>

                          <svg className="w-8 h-5 text-brand-text-sec/20" viewBox="0 0 50 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M5 10 h40" strokeDasharray="3,3" />
                          </svg>

                          <div className="w-8 h-8 rounded-full bg-brand-highlight/5 border border-brand-highlight/25 flex items-center justify-center text-[10px] text-brand-highlight font-bold shadow-sm">N2</div>
                        </div>

                        {/* Interactive cursor trace that shifts right on group hover */}
                        <motion.div 
                          animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                          className="absolute right-8 bottom-3 flex items-center gap-1 opacity-75 group-hover:translate-x-3 transition-transform duration-500"
                        >
                          <svg className="w-3.5 h-3.5 text-brand-primary fill-brand-primary" viewBox="0 0 24 24">
                            <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.99L21 3z" />
                          </svg>
                          <span className="text-[7px] bg-brand-primary text-white px-1.5 py-0.5 rounded-sm font-mono font-bold shadow-sm uppercase">SR</span>
                        </motion.div>
                      </div>

                      {/* Footer & Active Collaborators */}
                      <div className="flex items-center justify-between border-t border-brand-border/40 pt-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1.5">
                            {board.collaborators && board.collaborators.slice(0, 3).map((c, i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full border-2 border-brand-bg text-[8px] font-extrabold bg-brand-primary/10 text-brand-primary flex items-center justify-center uppercase shadow-sm font-mono"
                                title={`${c.name} (${c.role})`}
                              >
                                {c.name.substring(0, 2)}
                              </div>
                            ))}
                            {board.collaborators && board.collaborators.length > 3 && (
                              <div className="w-6 h-6 rounded-full border-2 border-brand-bg text-[8px] font-extrabold bg-brand-primary text-white flex items-center justify-center shadow-sm">
                                +{board.collaborators.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-brand-text-sec font-bold">
                            {board.collaborators ? board.collaborators.length : 0} Editor{(board.collaborators && board.collaborators.length > 1) ? 's' : ''} Connected
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          {board.ownerId === user.uid && (
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setBoardToDelete(board);
                              }}
                              className="p-1.5 rounded-xl border border-brand-border/60 text-brand-text-sec hover:text-brand-error hover:border-brand-error/20 transition-all cursor-pointer shadow-sm"
                              title="Delete Board permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => navigate(`/board/${board.id}`)}
                            className="px-4 py-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 hover:bg-brand-primary hover:text-white text-brand-primary text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                          >
                            Enter Room
                            <ChevronRight className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: PROFILE PROFILE CARD */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-2xl glass border border-brand-border bg-brand-bg-sec/45 shadow-sm space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-display font-extrabold text-brand-text flex items-center gap-1.5">
                  <User className="w-5 h-5 text-brand-primary" /> Collaborator Card Settings
                </h2>
                <p className="text-xs text-brand-text-sec font-semibold">Customize how your presence and identity appears to connected editors in real-time rooms.</p>
              </div>

              {profileSuccess && (
                <div className="p-3 text-xs font-bold rounded-xl bg-brand-success/10 text-brand-success border border-brand-success/20 text-center flex items-center justify-center gap-2 animate-bounce">
                  <Check className="w-4 h-4" />
                  Your profile coordinates have been synchronized successfully!
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-5 border-b border-brand-border/60">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={profilePhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.displayName)}`}
                    alt={user.displayName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-brand-primary bg-brand-bg shadow-sm cursor-pointer"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 text-left">
                    <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider font-mono">Dynamic Canvas Avatar</h3>
                    <p className="text-[11px] text-brand-text-sec font-semibold mt-0.5">Custom avatars can be specified via external photo URL coordinates.</p>
                    <input
                      type="text"
                      placeholder="Custom photo URL coordinate (https://...)"
                      value={profilePhoto}
                      onChange={(e) => setProfilePhoto(e.target.value)}
                      className="w-full mt-2.5 px-3 py-2 text-xs rounded-xl bg-brand-bg/50 border border-brand-border focus:border-brand-primary focus:outline-none transition-all font-mono text-brand-text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="block text-xs text-brand-text-sec font-bold mb-2">Display Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-bg/50 border border-brand-border focus:border-brand-primary focus:outline-none transition-all font-semibold text-brand-text shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-brand-text-sec font-bold mb-2">Email Address (Locked)</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-bg/30 border border-brand-border/40 focus:outline-none opacity-65 cursor-not-allowed font-mono text-brand-text-sec"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-xs text-brand-text-sec font-bold mb-2">Workspace Bio & Designation</label>
                  <textarea
                    rows={3}
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    placeholder="Tell your team members what you draw..."
                    className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-bg/50 border border-brand-border focus:border-brand-primary focus:outline-none transition-all font-semibold text-brand-text shadow-sm"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={updatingProfile}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-brand-primary hover:opacity-95 disabled:opacity-50 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-brand-primary/10"
                >
                  {updatingProfile ? 'Synchronizing...' : 'Update Collaborator Card'}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* TAB 3: SETTINGS WORKSPACE CONFIGURATIONS */}
          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 sm:p-8 rounded-2xl glass border border-brand-border bg-brand-bg-sec/45 shadow-sm space-y-6"
            >
              <div className="space-y-1 text-left">
                <h2 className="text-xl font-display font-extrabold text-brand-text flex items-center gap-1.5">
                  <Settings className="w-5 h-5 text-brand-primary" /> Workspace Settings
                </h2>
                <p className="text-xs text-brand-text-sec font-semibold mt-0.5">Configure global interface aesthetics, Server-Sent Events parameters, and local rendering systems.</p>
              </div>

              <div className="space-y-4 pt-2">
                
                {/* Theme options */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-brand-bg/40 border border-brand-border/60 gap-4">
                  <div className="text-left">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider font-mono text-brand-text">Active Theme Preset</h3>
                    <p className="text-[11px] text-brand-text-sec font-semibold mt-0.5">Toggle between gorgeous Botanical Sage (Light) and Spruce Obsidian (Dark).</p>
                  </div>
                  <div className="flex rounded-xl bg-brand-bg border border-brand-border/70 p-1 gap-1">
                    {(['light', 'dark', 'system'] as const).map((pref) => {
                      const isActive = preference === pref;
                      return (
                        <button
                          key={pref}
                          onClick={() => setTheme(pref)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer flex items-center gap-1 ${
                            isActive
                              ? 'bg-brand-primary text-white shadow-sm'
                              : 'text-brand-text-sec hover:text-brand-text hover:bg-brand-bg-sec/50'
                          }`}
                        >
                          {pref === 'light' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
                          {pref === 'dark' && <Moon className="w-3.5 h-3.5 text-brand-primary" />}
                          {pref === 'system' && <Cloud className="w-3.5 h-3.5 text-brand-secondary" />}
                          {pref}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Real-time sync engine health info */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-brand-bg/40 border border-brand-border/60">
                  <div className="text-left">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider font-mono text-brand-text">Real-Time Sync Sockets</h3>
                    <p className="text-[11px] text-brand-text-sec font-semibold mt-0.5">Status of the high-performance Server-Sent Events (SSE) broadcast broadcast.</p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-lg bg-brand-success/10 text-brand-success border border-brand-success/20 text-[10px] font-mono font-extrabold flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
                    SSE ACTIVE
                  </div>
                </div>

                {/* Database system */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-brand-bg/40 border border-brand-border/60">
                  <div className="text-left">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider font-mono text-brand-text">Local Cache Syncing</h3>
                    <p className="text-[11px] text-brand-text-sec font-semibold mt-0.5">Ensures board coordinate histories are synced continuously.</p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[10px] font-mono font-extrabold flex items-center gap-1.5 shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-primary" />
                    AUTOSAVE ENABLED
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* CREATE BOARD MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-md p-6 rounded-3xl glass border border-brand-border/80 shadow-2xl relative bg-brand-bg-sec"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-brand-bg text-brand-text-sec hover:text-brand-text transition-all cursor-pointer border border-transparent hover:border-brand-border/60"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-left">
                <span className="text-[10px] uppercase font-mono font-extrabold text-brand-primary bg-brand-primary/10 px-2.5 py-1 rounded border border-brand-primary/20 inline-block mb-3">NEW CANVAS COORDINATES</span>
                <h3 className="text-lg font-display font-bold text-brand-text">Initialize Sandbox Board</h3>
                <p className="text-xs text-brand-text-sec font-semibold mb-6">Create a fresh collaborative whiteboard to sync diagrams or vector shapes in real-time.</p>
              </div>

              <form onSubmit={handleCreateBoard} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-text-sec mb-2">
                    Whiteboard Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Microservices Architecture Diagram"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-primary focus:outline-none transition-all text-xs font-bold text-brand-text shadow-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 rounded-xl border border-brand-border text-xs font-bold text-brand-text hover:bg-brand-bg-sec transition-all cursor-pointer shadow-sm"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={creatingBoard}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-indigo-600 hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-brand-primary/20"
                  >
                    {creatingBoard ? 'Initializing...' : 'Create & Enter'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* JOIN BOARD MODAL */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-md p-6 rounded-3xl glass border border-brand-border/80 shadow-2xl relative bg-brand-bg-sec"
            >
              <button
                onClick={() => setShowJoinModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-brand-bg text-brand-text-sec hover:text-brand-text transition-all cursor-pointer border border-transparent hover:border-brand-border/60"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-left">
                <span className="text-[10px] uppercase font-mono font-extrabold text-brand-secondary bg-brand-secondary/10 px-2.5 py-1 rounded border border-brand-secondary/20 inline-block mb-3">COORDINATE PAIRING</span>
                <h3 className="text-lg font-display font-bold text-brand-text">Connect to Sandbox Room</h3>
                <p className="text-xs text-brand-text-sec font-semibold mb-6">Provide the shareable Board ID code to connect coordinates directly.</p>
              </div>

              <form onSubmit={handleJoinBoard} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-brand-text-sec mb-2">
                    Whiteboard Room ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., board_abc123xyz"
                    value={joinBoardId}
                    onChange={(e) => setJoinBoardId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-bg border border-brand-border focus:border-brand-primary focus:outline-none transition-all text-xs font-bold text-brand-text shadow-sm"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 py-3 rounded-xl border border-brand-border text-xs font-bold text-brand-text hover:bg-brand-bg-sec transition-all cursor-pointer shadow-sm"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={joiningBoard}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-indigo-600 hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-brand-primary/20"
                  >
                    {joiningBoard ? 'Connecting...' : 'Connect to Board'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {boardToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-md p-6 rounded-3xl glass border border-red-500/30 shadow-2xl relative bg-brand-bg-sec"
            >
              <button
                onClick={() => setBoardToDelete(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-brand-bg text-brand-text-sec hover:text-brand-text transition-all cursor-pointer border border-transparent hover:border-brand-border/60"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-left">
                <span className="text-[10px] uppercase font-mono font-extrabold text-red-500 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20 inline-block mb-3">
                  DESTRUCTIVE ACTION
                </span>
                <h3 className="text-lg font-display font-bold text-brand-text flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-500" /> Delete Whiteboard?
                </h3>
                <p className="text-xs text-brand-text-sec font-semibold mb-6">
                  Are you absolutely sure you want to delete <span className="text-brand-text font-bold">"{boardToDelete.name}"</span>? This action cannot be undone and will permanently wipe all associated pages, coordinate drawings, and chats.
                </p>
              </div>

              <div className="flex gap-3 pt-2 text-left">
                <button
                  type="button"
                  onClick={() => setBoardToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl border border-brand-border text-xs font-bold text-brand-text hover:bg-brand-bg-sec transition-all cursor-pointer shadow-sm text-center"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDeleteBoard(boardToDelete.id)}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-500/20"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
