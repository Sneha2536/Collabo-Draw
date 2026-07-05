import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Palette,
  ArrowLeft,
  MousePointer,
  Hand,
  Edit3,
  Square,
  Circle,
  TrendingUp,
  Type,
  FileText,
  Image as ImageIcon,
  Eraser,
  Undo2,
  Redo2,
  Maximize,
  Grid,
  Download,
  Share2,
  Users,
  MessageSquare,
  History,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Send,
  Plus,
  MoreHorizontal,
  FolderPlus,
  Layers,
  X,
  FileDown,
  HelpCircle,
  Eye,
  Settings,
  Check,
  Sparkles,
  Scissors,
  Clipboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Board, BoardObject, BoardPage, ChatMessage, UserPresence, BoardHistory, ToolType } from '../types';
import Logo from '../components/Logo';

const getFillAndOpacity = (fillColor: string) => {
  if (!fillColor) return { fill: 'transparent', fillOpacity: 1 };
  if (fillColor === 'transparent') return { fill: 'transparent', fillOpacity: 1 };
  
  // Translate old washed-out soft tints to beautiful, rich, natural pastels
  let color = fillColor;
  const oldColors: Record<string, string> = {
    '#b91c1c4d': '#fca5a58c', // Red
    '#c2410c4d': '#fed7aa8c', // Orange
    '#a162074d': '#fef08a8c', // Yellow
    '#15803d4d': '#bbf7d08c', // Green
    '#1d4ed84d': '#bfdbfe8c', // Blue
    '#4338ca4d': '#c7d2fe8c', // Indigo
    '#1e293b59': '#cbd5e1a6', // Slate/Gray
  };
  if (oldColors[color]) {
    color = oldColors[color];
  }

  if (color.startsWith('#') && color.length === 9) {
    const baseColor = color.slice(0, 7);
    const alphaHex = color.slice(7, 9);
    const alpha = parseInt(alphaHex, 16) / 255;
    return { fill: baseColor, fillOpacity: alpha };
  }
  return { fill: color, fillOpacity: 1 };
};

export default function Workspace() {
  const { id: boardId } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Viewport/Canvas Coordinates State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);

  // Active board and page states
  const [board, setBoard] = useState<Board | null>(null);
  const [pages, setPages] = useState<BoardPage[]>([]);
  const [activePageId, setActivePageId] = useState<string>('');
  const [objects, setObjects] = useState<BoardObject[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time peer presences & live cursor coords
  const [presences, setPresences] = useState<Record<string, UserPresence>>({});
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<BoardHistory[]>([]);

  // Drawing State Configuration
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Styling Config Panel
  const [stroke, setStroke] = useState('#6366f1');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fill, setFill] = useState('#6366f133');
  const [opacity, setOpacity] = useState(1);
  const [dashed, setDashed] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [stickyColor, setStickyColor] = useState('#fef08a'); // yellow post-it default
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isPropertiesPanelDismissed, setIsPropertiesPanelDismissed] = useState(false);
  const [isPresenceOpen, setIsPresenceOpen] = useState(false);
  const presenceRef = useRef<HTMLDivElement | null>(null);

  // Shape manipulation dragging states
  const [dragAction, setDragAction] = useState<{
    type: 'move' | 'resize' | 'rotate';
    handle?: 'tl' | 'tc' | 'tr' | 'ml' | 'mr' | 'bl' | 'bc' | 'br';
    startCoords: { x: number; y: number };
    initialObj: BoardObject;
  } | null>(null);

  const copiedObjectRef = useRef<BoardObject | null>(null);
  const lastSyncTime = useRef(0);

  const throttledSyncShapesToServer = (shapesList: BoardObject[]) => {
    const now = Date.now();
    if (now - lastSyncTime.current > 40) {
      lastSyncTime.current = now;
      syncShapesToServer(shapesList);
    }
  };

  const updateSelectedObject = (updates: Partial<BoardObject>) => {
    if (!selectedId) return;
    const prevObjects = [...objects];
    const nextObjects = objects.map((obj) => {
      if (obj.id === selectedId) {
        return {
          ...obj,
          ...updates,
          lastModified: Date.now(),
        };
      }
      return obj;
    });
    setObjects(nextObjects);
    setUndoStack((prev) => [...prev, prevObjects]);
    setRedoStack([]);
    syncShapesToServer(nextObjects);
  };

  const dismissPanelAfterSelection = () => {
    if (selectedId) {
      setIsPropertiesPanelDismissed(true);
    } else {
      setIsColorPickerOpen(false);
    }
  };

  const handleStrokeChange = (newStroke: string) => {
    setStroke(newStroke);
    if (selectedId) {
      updateSelectedObject({ stroke: newStroke });
    }
    dismissPanelAfterSelection();
  };

  const handleFillChange = (newFill: string) => {
    setFill(newFill);
    if (selectedId) {
      updateSelectedObject({ fill: newFill });
    }
    dismissPanelAfterSelection();
  };

  const handleStrokeWidthChange = (newWidth: number) => {
    setStrokeWidth(newWidth);
    if (selectedId) {
      updateSelectedObject({ strokeWidth: newWidth });
    }
  };

  const handleOpacityChange = (newOpacity: number) => {
    setOpacity(newOpacity);
    if (selectedId) {
      updateSelectedObject({ opacity: newOpacity });
    }
  };

  const handleDashedChange = (newDashed: boolean) => {
    setDashed(newDashed);
    if (selectedId) {
      updateSelectedObject({ dashed: newDashed });
    }
  };

  const handleStickyColorChange = (newColor: string) => {
    setStickyColor(newColor);
    if (selectedId) {
      updateSelectedObject({ stickyColor: newColor });
    }
    dismissPanelAfterSelection();
  };

  // Temporary local drawing properties
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [currentPoints, setCurrentPoints] = useState<[number, number][]>([]);
  const [tempRect, setTempRect] = useState<BoardObject | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textInputValue, setTextInputValue] = useState('');

  // Undo/Redo Stacks
  const [undoStack, setUndoStack] = useState<BoardObject[][]>([]);
  const [redoStack, setRedoStack] = useState<BoardObject[][]>([]);

  // Laser dots overlay
  const [laserPoint, setLaserPoint] = useState<{ x: number; y: number } | null>(null);

  // Side drawers
  const [activeRightDrawer, setActiveRightDrawer] = useState<'chat' | 'history' | 'share' | 'pages' | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [saveCheckpointDesc, setSaveCheckpointDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Confirmation states for destructive actions
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [pageToDeleteId, setPageToDeleteId] = useState<string | null>(null);
  const [versionToRestore, setVersionToRestore] = useState<BoardHistory | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Auto-clear toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Auto-clear copyFeedback after 3 seconds
  useEffect(() => {
    if (copyFeedback) {
      const timer = setTimeout(() => {
        setCopyFeedback(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [copyFeedback]);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn("navigator.clipboard.writeText failed, trying fallback:", err);
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) return true;
    } catch (err) {
      console.error("Fallback clipboard copy failed:", err);
    }
    return false;
  };

  const handleCopy = async (text: string, isLink: boolean) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopyFeedback({
        message: isLink ? "Board link copied to clipboard!" : "Board ID copied to clipboard!",
        type: 'success'
      });
    } else {
      setCopyFeedback({
        message: "Failed to copy to clipboard.",
        type: 'error'
      });
    }
  };

  // Page Drawer management
  const [newPageName, setNewPageName] = useState('');

  // References
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const spacePressed = useRef(false);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const lastCursorEmit = useRef<number>(0);
  const initialTouchDistance = useRef<number | null>(null);
  const initialZoom = useRef<number>(1);

  // User Permission level
  const userRole = board?.collaborators.find((c) => c.userId === user?.uid)?.role || 'viewer';
  const isViewer = userRole === 'viewer';

  // 1. Fetch initial board and configuration details
  const loadBoardData = async () => {
    if (!boardId) return;
    try {
      // Fetch Board Meta
      const bRes = await fetch(`/api/boards/${boardId}`);
      const bData = await bRes.json();
      if (!bRes.ok) throw new Error(bData.error || 'Board not found');
      setBoard(bData.board);
      setActivePageId(bData.board.activePageId);

      // Fetch Board Pages
      const pRes = await fetch(`/api/boards/${boardId}/pages`);
      const pData = await pRes.json();
      if (pRes.ok) {
        setPages(pData.pages);
        const activePage = pData.pages.find((p: BoardPage) => p.id === bData.board.activePageId);
        if (activePage) {
          setObjects(activePage.objects);
          setTimeout(() => {
            fitToScreen(activePage.objects);
          }, 150);
        }
      }

      // Fetch Chats & Version History
      const cRes = await fetch(`/api/boards/${boardId}/chats`);
      const cData = await cRes.json();
      if (cRes.ok) setChats(cData.chats);

      const hRes = await fetch(`/api/boards/${boardId}/history`);
      const hData = await hRes.json();
      if (hRes.ok) setHistory(hData.history);

    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const activePageIdRef = useRef(activePageId);
  const activeRightDrawerRef = useRef(activeRightDrawer);

  useEffect(() => {
    activePageIdRef.current = activePageId;
  }, [activePageId]);

  useEffect(() => {
    activeRightDrawerRef.current = activeRightDrawer;
  }, [activeRightDrawer]);

  // Load pages list on demand
  const loadBoardPagesOnly = useCallback(async () => {
    if (!boardId) return;
    try {
      const pRes = await fetch(`/api/boards/${boardId}/pages`);
      const pData = await pRes.json();
      if (pRes.ok) {
        setPages(pData.pages);
        const activePage = pData.pages.find((p: BoardPage) => p.id === activePageIdRef.current);
        if (activePage) {
          setObjects(activePage.objects);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [boardId]);

  useEffect(() => {
    loadBoardData();
  }, [boardId]);

  // 2. Establish Server-Sent Events real-time listeners
  useEffect(() => {
    if (!boardId || !user) return;

    // Connect to SSE live endpoint
    const sse = new EventSource(
      `/api/boards/${boardId}/live?userId=${user.uid}&name=${encodeURIComponent(user.displayName)}&email=${encodeURIComponent(user.email)}`
    );
    sseRef.current = sse;

    sse.addEventListener('connected', (e: any) => {
      console.log('SSE Sync Tunnel successfully established!');
    });

    sse.addEventListener('canvas:updated', (e: any) => {
      const payload = JSON.parse(e.data);
      if (payload.pageId === activePageIdRef.current) {
        setObjects(payload.objects);
      }
    });

    sse.addEventListener('board:updated', (e: any) => {
      const updatedBoard = JSON.parse(e.data);
      setBoard(updatedBoard);
    });

    sse.addEventListener('board:deleted', () => {
      navigate('/dashboard?deleted=true');
    });

    sse.addEventListener('page:created', (e: any) => {
      const payload = JSON.parse(e.data);
      // Reload pages
      loadBoardPagesOnly();
      if (payload.activePageId) {
        setActivePageId(payload.activePageId);
      }
    });

    sse.addEventListener('page:deleted', (e: any) => {
      const payload = JSON.parse(e.data);
      loadBoardPagesOnly();
      if (payload.activePageId) {
        setActivePageId(payload.activePageId);
      }
    });

    sse.addEventListener('cursor', (e: any) => {
      const data = JSON.parse(e.data) as UserPresence;
      if (data.userId !== user.uid) {
        setPresences((prev) => ({
          ...prev,
          [data.userId]: {
            ...data,
            lastSeen: Date.now(),
          },
        }));
      }
    });

    sse.addEventListener('presence:joined', (e: any) => {
      const data = JSON.parse(e.data) as UserPresence;
      if (data.userId !== user.uid) {
        setPresences((prev) => ({
          ...prev,
          [data.userId]: {
            ...data,
            lastSeen: Date.now(),
          },
        }));
      }
    });

    sse.addEventListener('presence:init', (e: any) => {
      const data = JSON.parse(e.data);
      setPresences((prev) => {
        const next = { ...prev };
        data.forEach((p: any) => {
          if (p.userId !== user.uid && !next[p.userId]) {
            next[p.userId] = {
              userId: p.userId,
              name: p.name || 'Active Collaborator',
              email: p.email || '',
              cursorX: -1000,
              cursorY: -1000,
              color: p.color || '#6366f1',
              lastSeen: Date.now(),
              pageId: '',
            };
          }
        });
        return next;
      });
    });

    sse.addEventListener('presence:left', (e: any) => {
      const data = JSON.parse(e.data);
      setPresences((prev) => {
        const copy = { ...prev };
        delete copy[data.userId];
        return copy;
      });
    });

    sse.addEventListener('chat:message', (e: any) => {
      const message = JSON.parse(e.data) as ChatMessage;
      setChats((prev) => [...prev, message]);
      if (activeRightDrawerRef.current !== 'chat') {
        setUnreadChatCount((c) => c + 1);
      }
    });

    sse.addEventListener('history:created', (e: any) => {
      const version = JSON.parse(e.data) as BoardHistory;
      setHistory((prev) => [...prev, version]);
    });

    sse.onerror = (err) => {
      console.error('SSE Connection Error:', err);
    };

    return () => {
      sse.close();
    };
  }, [boardId, user, loadBoardPagesOnly]);

  // Periodic active presence heartbeat ping to keep peer status updated even when mouse is still
  useEffect(() => {
    if (!boardId || !user) return;

    const sendHeartbeat = () => {
      fetch(`/api/boards/${boardId}/cursor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          name: user.displayName,
          email: user.email,
          cursorX: -1000,
          cursorY: -1000,
          pageId: activePageId,
          isDrawing: false,
          lastSeen: Date.now(),
        }),
      }).catch(() => {});
    };

    // Trigger immediately and then once every 4 seconds
    sendHeartbeat();
    const heartbeatTimer = setInterval(sendHeartbeat, 4000);

    return () => {
      clearInterval(heartbeatTimer);
    };
  }, [boardId, user, activePageId]);

  // Periodic stale presence cleaner
  useEffect(() => {
    const cleanerTimer = setInterval(() => {
      setPresences((prev) => {
        const now = Date.now();
        const next = { ...prev };
        let hasDeletedStale = false;
        
        for (const [uid, presence] of Object.entries(next) as [string, UserPresence][]) {
          // If collaborator has gone silent for more than 10 seconds, remove them
          if (!presence.lastSeen || now - presence.lastSeen > 10000) {
            delete next[uid];
            hasDeletedStale = true;
          }
        }
        
        return hasDeletedStale ? next : prev;
      });
    }, 2000);

    return () => {
      clearInterval(cleanerTimer);
    };
  }, []);

  // Explicit leave/return announcements on browser visibility changes (e.g. tab suspension or background changes)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!boardId || !user) return;
      
      if (document.visibilityState === 'hidden') {
        // Broadcast leave event immediately to cleanly remove us from other users' lists
        fetch(`/api/boards/${boardId}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.uid }),
        }).catch(() => {});
      } else {
        // Re-announce presence immediately upon return
        fetch(`/api/boards/${boardId}/cursor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            name: user.displayName,
            email: user.email,
            cursorX: -1000,
            cursorY: -1000,
            pageId: activePageId,
            isDrawing: false,
            lastSeen: Date.now(),
          }),
        }).catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [boardId, user, activePageId]);

  // Click & touch outside handlers to dismiss interactive presence popover automatically
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (presenceRef.current && !presenceRef.current.contains(event.target as Node)) {
        setIsPresenceOpen(false);
      }
    };

    if (isPresenceOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isPresenceOpen]);

  // Sync active page shapes when activePageId changes
  useEffect(() => {
    const activePage = pages.find((p) => p.id === activePageId);
    if (activePage) {
      setObjects(activePage.objects);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePageId]);

  // Reset unread count when chat opens
  useEffect(() => {
    if (activeRightDrawer === 'chat') {
      setUnreadChatCount(0);
    }
  }, [activeRightDrawer]);

  // 3. Coordinate Transformation Utilities
  const getMouseCoords = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    // Convert client screen coords to zoomed & panned coordinates
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    return {
      x: snapToGrid ? Math.round(x / 40) * 40 : x,
      y: snapToGrid ? Math.round(y / 40) * 40 : y,
    };
  };

  // Broadcast cursor movements (throttled to 40ms)
  const handleMouseMoveForCursor = (
    e: React.MouseEvent<SVGSVGElement>,
    options?: {
      overrideDrawingPoints?: [number, number][];
      overrideTempRect?: any;
      overrideIsDrawing?: boolean;
    }
  ) => {
    if (!boardId || !user) return;
    const now = Date.now();
    const isNowDrawing = options?.overrideIsDrawing !== undefined ? options.overrideIsDrawing : isDrawing;
    if (!isNowDrawing && now - lastCursorEmit.current < 45) return;
    lastCursorEmit.current = now;

    // Convert cursor coords to world coords
    const coords = getMouseCoords(e);

    const drawingPts = options?.overrideDrawingPoints || currentPoints;
    const tr = options?.overrideTempRect || tempRect;

    fetch(`/api/boards/${boardId}/cursor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.uid,
        name: user.displayName,
        email: user.email,
        cursorX: coords.x,
        cursorY: coords.y,
        pageId: activePageId,
        isTyping: chatMessage.length > 0,
        isDrawing: isNowDrawing,
        drawingTool: activeTool,
        drawingPoints: drawingPts,
        tempRect: tr,
        stroke,
        strokeWidth,
        opacity,
      }),
    }).catch(() => {});
  };

  // 4. Keyboard Shortcuts Setup (Undo, Redo, Delete, Copy, Paste, Pan with Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip shortcuts if currently writing text inputs
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      // Single-key shortcuts for active tool selection (if no modifier key pressed)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 's') {
          setActiveTool('select');
        } else if (key === 'e') {
          setActiveTool('eraser');
        } else if (key === 'p') {
          setActiveTool('pencil');
        } else if (key === 'r') {
          setActiveTool('rect');
        } else if (key === 'c') {
          setActiveTool('circle');
        } else if (key === 'l') {
          setActiveTool('line');
        } else if (key === 't') {
          setActiveTool('text');
        } else if (key === 'n') {
          setActiveTool('sticky');
        }
      }

      if (e.code === 'Space') {
        e.preventDefault();
        spacePressed.current = true;
        if (activeTool !== 'hand') {
          setActiveTool('hand');
        }
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl+Y
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }

      // Delete key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedId) {
          handleDeleteObject(selectedId);
        }
      }

      // Duplicate / Copy-Paste combo via Ctrl+D or manual button
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (selectedId) {
          handleDuplicateObject(selectedId);
        }
      }

      // Copy: Ctrl+C
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedId) {
          e.preventDefault();
          handleCopyObject(selectedId);
        }
      }

      // Cut: Ctrl+X
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        if (selectedId) {
          e.preventDefault();
          handleCutObject(selectedId);
        }
      }

      // Paste: Ctrl+V
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePasteObject();
      }

      // Arrow keys to move
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedId) {
          e.preventDefault();
          const offset = e.shiftKey ? 10 : 1;
          let dx = 0;
          let dy = 0;
          if (e.key === 'ArrowUp') dy = -offset;
          if (e.key === 'ArrowDown') dy = offset;
          if (e.key === 'ArrowLeft') dx = -offset;
          if (e.key === 'ArrowRight') dx = offset;

          const prev = [...objects];
          const next = objects.map((obj) => {
            if (obj.id === selectedId && !obj.locked) {
              const updatedPoints = obj.points?.map(([px, py]) => [px + dx, py + dy]) as [number, number][];
              return {
                ...obj,
                x: obj.x + dx,
                y: obj.y + dy,
                points: updatedPoints,
                lastModified: Date.now(),
              };
            }
            return obj;
          });
          setObjects(next);
          setUndoStack((u) => [...u, prev]);
          syncShapesToServer(next);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressed.current = false;
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeTool, selectedId, objects, undoStack, redoStack]);

  // Reset properties panel dismissed state when selectedId changes to show the panel for the newly selected shape
  useEffect(() => {
    if (selectedId) {
      setIsPropertiesPanelDismissed(false);
    }
  }, [selectedId]);

  // Synchronize styling settings with the selected object
  useEffect(() => {
    if (selectedId) {
      const selectedObj = objects.find((o) => o.id === selectedId);
      if (selectedObj) {
        setStroke(selectedObj.stroke);
        setStrokeWidth(selectedObj.strokeWidth);
        setFill(selectedObj.fill);
        setOpacity(selectedObj.opacity);
        setDashed(selectedObj.dashed);
        if (selectedObj.stickyColor) {
          setStickyColor(selectedObj.stickyColor);
        }
      }
    }
  }, [selectedId, objects]);

  // Touch Event simulation for Mobile Support
  const handleTouchStart = (e: any) => {
    if (isViewer) return;
    if (!e.touches || e.touches.length === 0) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    // Pinch-to-zoom logic
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialTouchDistance.current = Math.hypot(dx, dy);
      initialZoom.current = zoom;
      return;
    }

    const touch = e.touches[0];
    const simulatedEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
    } as unknown as React.MouseEvent<SVGSVGElement>;

    handleMouseDown(simulatedEvent);
  };

  const handleTouchMove = (e: any) => {
    if (isViewer) return;
    if (!e.touches || e.touches.length === 0) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    // Pinch-to-zoom logic
    if (e.touches.length === 2 && initialTouchDistance.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);
      if (currentDistance > 0) {
        const factor = currentDistance / initialTouchDistance.current;
        const nextZoom = Math.min(Math.max(initialZoom.current * factor, 0.15), 4);
        setZoom(nextZoom);
      }
      return;
    }

    const touch = e.touches[0];
    const simulatedEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
    } as unknown as React.MouseEvent<SVGSVGElement>;

    handleMouseMove(simulatedEvent);
  };

  const handleTouchEnd = (e: any) => {
    if (isViewer) return;

    if (e.cancelable) {
      e.preventDefault();
    }

    if (!e.touches || e.touches.length < 2) {
      initialTouchDistance.current = null;
    }

    const touch = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]);
    if (!touch) return;

    const simulatedEvent = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      preventDefault: () => {},
    } as unknown as React.MouseEvent<SVGSVGElement>;

    handleMouseUp(simulatedEvent);
  };

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    svgEl.addEventListener('touchstart', handleTouchStart, { passive: false });
    svgEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    svgEl.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      svgEl.removeEventListener('touchstart', handleTouchStart);
      svgEl.removeEventListener('touchmove', handleTouchMove);
      svgEl.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // 5. Drawing handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isViewer) return; // Viewers can't modify canvas

    if (activeTool === 'hand' || spacePressed.current) {
      isPanning.current = true;
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    const coords = getMouseCoords(e);
    setIsDrawing(true);
    setDrawStart(coords);

    if (activeTool === 'eraser') {
      const clicked = [...objects].reverse().find((obj) => {
        return (
          coords.x >= obj.x &&
          coords.x <= obj.x + obj.width &&
          coords.y >= obj.y &&
          coords.y <= obj.y + obj.height
        );
      });
      if (clicked) {
        handleDeleteObject(clicked.id);
      }
    } else if (activeTool === 'pencil' || activeTool === 'brush') {
      setCurrentPoints([[coords.x, coords.y]]);
    } else if (activeTool === 'select') {
      // Find object clicked (reverse order to find topmost)
      const clicked = [...objects].reverse().find((obj) => {
        // Simple bounding box hit-test
        return (
          coords.x >= obj.x &&
          coords.x <= obj.x + obj.width &&
          coords.y >= obj.y &&
          coords.y <= obj.y + obj.height
        );
      });
      if (clicked) {
        setSelectedId(clicked.id);
        setDragAction({
          type: 'move',
          startCoords: coords,
          initialObj: { ...clicked },
        });
      } else {
        setSelectedId(null);
        setDragAction(null);
      }
    } else {
      // Rect, circle, etc. pre-configure a temporary rect
      setTempRect({
        id: 'temp',
        type: activeTool === 'laser' ? 'laser' : (activeTool as any),
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0,
        stroke,
        strokeWidth: activeTool === 'brush' ? 8 : strokeWidth,
        fill: activeTool === 'sticky' ? stickyColor : fill,
        opacity,
        dashed,
        rotation: 0,
        creatorId: user?.uid || '',
        creatorName: user?.displayName || '',
        lastModified: Date.now(),
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning.current) {
      handleMouseMoveForCursor(e);
      setPan({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
      return;
    }

    if (dragAction) {
      const coords = getMouseCoords(e);
      const dx = coords.x - dragAction.startCoords.x;
      const dy = coords.y - dragAction.startCoords.y;

      if (dragAction.type === 'move') {
        const updatedPoints = dragAction.initialObj.points?.map(([px, py]) => [
          px + dx,
          py + dy,
        ]) as [number, number][];

        const updatedObj = {
          ...dragAction.initialObj,
          x: dragAction.initialObj.x + dx,
          y: dragAction.initialObj.y + dy,
          points: updatedPoints,
          lastModified: Date.now(),
        };

        const nextObjects = objects.map((o) => (o.id === dragAction.initialObj.id ? updatedObj : o));
        setObjects(nextObjects);
        throttledSyncShapesToServer(nextObjects);
        handleMouseMoveForCursor(e);
      } else if (dragAction.type === 'resize' && dragAction.handle) {
        const angleRad = ((dragAction.initialObj.rotation || 0) * Math.PI) / 180;
        const cos = Math.cos(-angleRad);
        const sin = Math.sin(-angleRad);
        const localDx = dx * cos - dy * sin;
        const localDy = dx * sin + dy * cos;

        let newWidth = dragAction.initialObj.width;
        let newHeight = dragAction.initialObj.height;
        let localXShift = 0;
        let localYShift = 0;

        const handle = dragAction.handle;
        if (handle === 'br') {
          newWidth = dragAction.initialObj.width + localDx;
          newHeight = dragAction.initialObj.height + localDy;
        } else if (handle === 'mr') {
          newWidth = dragAction.initialObj.width + localDx;
        } else if (handle === 'tr') {
          newWidth = dragAction.initialObj.width + localDx;
          newHeight = dragAction.initialObj.height - localDy;
          localYShift = localDy;
        } else if (handle === 'tc') {
          newHeight = dragAction.initialObj.height - localDy;
          localYShift = localDy;
        } else if (handle === 'tl') {
          newWidth = dragAction.initialObj.width - localDx;
          newHeight = dragAction.initialObj.height - localDy;
          localXShift = localDx;
          localYShift = localDy;
        } else if (handle === 'ml') {
          newWidth = dragAction.initialObj.width - localDx;
          localXShift = localDx;
        } else if (handle === 'bl') {
          newWidth = dragAction.initialObj.width - localDx;
          newHeight = dragAction.initialObj.height + localDy;
          localXShift = localDx;
        } else if (handle === 'bc') {
          newHeight = dragAction.initialObj.height + localDy;
        }

        if (e.shiftKey) {
          const ratio = dragAction.initialObj.width / (dragAction.initialObj.height || 1);
          if (handle === 'mr' || handle === 'ml') {
            newHeight = newWidth / ratio;
          } else if (handle === 'tc' || handle === 'bc') {
            newWidth = newHeight * ratio;
          } else {
            const ratioWidth = Math.abs(newWidth / dragAction.initialObj.width);
            const ratioHeight = Math.abs(newHeight / dragAction.initialObj.height);
            const maxRatio = Math.max(ratioWidth, ratioHeight);
            newWidth = dragAction.initialObj.width * maxRatio * Math.sign(newWidth || 1);
            newHeight = dragAction.initialObj.height * maxRatio * Math.sign(newHeight || 1);
            
            if (handle === 'tl') {
              localXShift = dragAction.initialObj.width - newWidth;
              localYShift = dragAction.initialObj.height - newHeight;
            } else if (handle === 'tr') {
              localYShift = dragAction.initialObj.height - newHeight;
            } else if (handle === 'bl') {
              localXShift = dragAction.initialObj.width - newWidth;
            }
          }
        }

        if (newWidth < 5) {
          if (handle === 'tl' || handle === 'ml' || handle === 'bl') {
            localXShift += (newWidth - 5);
          }
          newWidth = 5;
        }
        if (newHeight < 5) {
          if (handle === 'tl' || handle === 'tc' || handle === 'tr') {
            localYShift += (newHeight - 5);
          }
          newHeight = 5;
        }

        const shiftRad = ((dragAction.initialObj.rotation || 0) * Math.PI) / 180;
        const shiftCos = Math.cos(shiftRad);
        const shiftSin = Math.sin(shiftRad);
        const globalXShift = localXShift * shiftCos - localYShift * shiftSin;
        const globalYShift = localXShift * shiftSin + localYShift * shiftCos;

        const newX = dragAction.initialObj.x + globalXShift;
        const newY = dragAction.initialObj.y + globalYShift;

        const updatedPoints = dragAction.initialObj.points?.map(([px, py]) => {
          const localPx = px - dragAction.initialObj.x;
          const localPy = py - dragAction.initialObj.y;
          const scaleX = newWidth / (dragAction.initialObj.width || 1);
          const scaleY = newHeight / (dragAction.initialObj.height || 1);
          return [
            newX + localPx * scaleX,
            newY + localPy * scaleY,
          ];
        }) as [number, number][];

        const updatedObj = {
          ...dragAction.initialObj,
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          points: updatedPoints,
          lastModified: Date.now(),
        };

        const nextObjects = objects.map((o) => (o.id === dragAction.initialObj.id ? updatedObj : o));
        setObjects(nextObjects);
        throttledSyncShapesToServer(nextObjects);
        handleMouseMoveForCursor(e);
      } else if (dragAction.type === 'rotate') {
        const centerX = dragAction.initialObj.x + dragAction.initialObj.width / 2;
        const centerY = dragAction.initialObj.y + dragAction.initialObj.height / 2;
        const angleRad = Math.atan2(coords.y - centerY, coords.x - centerX);
        let angleDegrees = (angleRad * 180) / Math.PI + 90;
        angleDegrees = (angleDegrees + 360) % 360;

        const updatedObj = {
          ...dragAction.initialObj,
          rotation: angleDegrees,
          lastModified: Date.now(),
        };

        const nextObjects = objects.map((o) => (o.id === dragAction.initialObj.id ? updatedObj : o));
        setObjects(nextObjects);
        throttledSyncShapesToServer(nextObjects);
        handleMouseMoveForCursor(e);
      }
      return;
    }

    if (!isDrawing) {
      handleMouseMoveForCursor(e);
      return;
    }
    const coords = getMouseCoords(e);

    if (activeTool === 'eraser') {
      handleMouseMoveForCursor(e);
      const clicked = [...objects].reverse().find((obj) => {
        return (
          coords.x >= obj.x &&
          coords.x <= obj.x + obj.width &&
          coords.y >= obj.y &&
          coords.y <= obj.y + obj.height
        );
      });
      if (clicked) {
        handleDeleteObject(clicked.id);
      }
    } else if (activeTool === 'pencil' || activeTool === 'brush') {
      const nextPoints: [number, number][] = [...currentPoints, [coords.x, coords.y]];
      setCurrentPoints(nextPoints);
      handleMouseMoveForCursor(e, { overrideDrawingPoints: nextPoints, overrideIsDrawing: true });
    } else if (activeTool === 'move' && selectedId) {
      // Relocate selected shape
      const dx = coords.x - drawStart.x;
      const dy = coords.y - drawStart.y;
      setObjects((prev) =>
        prev.map((obj) => {
          if (obj.id === selectedId && !obj.locked) {
            return {
              ...obj,
              x: obj.x + dx,
              y: obj.y + dy,
              lastModified: Date.now(),
            };
          }
          return obj;
        })
      );
      setDrawStart(coords);
      handleMouseMoveForCursor(e);
    } else if (tempRect) {
      // Drawing vector boundaries
      const width = coords.x - drawStart.x;
      const height = coords.y - drawStart.y;
      const nextRect = {
        ...tempRect,
        x: width < 0 ? coords.x : drawStart.x,
        y: height < 0 ? coords.y : drawStart.y,
        width: Math.abs(width),
        height: Math.abs(height),
      };
      setTempRect(nextRect);
      handleMouseMoveForCursor(e, { overrideTempRect: nextRect, overrideIsDrawing: true });
    } else {
      handleMouseMoveForCursor(e);
    }
  };

  const handleMouseUp = async (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning.current) {
      isPanning.current = false;
      return;
    }

    if (dragAction) {
      setDragAction(null);
      setIsDrawing(false);
      const prevObjects = objects.map((obj) =>
        obj.id === dragAction.initialObj.id ? dragAction.initialObj : obj
      );
      setUndoStack((prev) => [...prev, prevObjects]);
      setRedoStack([]);
      syncShapesToServer(objects);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if (isViewer) return;

    // Track state backup for Undo stack
    const prevObjects = [...objects];

    let newObject: BoardObject | null = null;
    const coords = getMouseCoords(e);

    if ((activeTool === 'pencil' || activeTool === 'brush') && currentPoints.length > 1) {
      // Calculate bounding box for pencil paths
      const xs = currentPoints.map(([x]) => x);
      const ys = currentPoints.map(([, y]) => y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      newObject = {
        id: 'obj_' + Math.random().toString(36).substr(2, 9),
        type: activeTool,
        x: minX,
        y: minY,
        width: maxX - minX || 2,
        height: maxY - minY || 2,
        points: currentPoints,
        stroke,
        strokeWidth: activeTool === 'brush' ? 8 : strokeWidth,
        fill: 'transparent',
        opacity,
        dashed: false,
        rotation: 0,
        creatorId: user?.uid || '',
        creatorName: user?.displayName || '',
        lastModified: Date.now(),
      };
    } else if (tempRect && tempRect.width > 2 && tempRect.height > 2) {
      const generatedId = 'obj_' + Math.random().toString(36).substr(2, 9);
      newObject = {
        ...tempRect,
        id: generatedId,
        lastModified: Date.now(),
      };

      if (activeTool === 'text') {
        newObject.text = 'Double click to edit text';
        newObject.fill = 'transparent';
        newObject.stroke = 'transparent';
        newObject.fontSize = fontSize;
        newObject.fontFamily = fontFamily;
      } else if (activeTool === 'sticky') {
        newObject.text = 'Write note here';
        newObject.stickyColor = stickyColor;
        newObject.fontSize = 14;
        newObject.fontFamily = 'Inter';
      }
    }

    let finalObjects = [...objects];

    if (newObject) {
      finalObjects.push(newObject);
      setObjects(finalObjects);
      setUndoStack((prev) => [...prev, prevObjects]);
      setRedoStack([]); // Clear redo on fresh action
    } else if (activeTool === 'move' && selectedId) {
      // Just pushed move actions, record undo checkpoint
      setUndoStack((prev) => [...prev, prevObjects]);
      setRedoStack([]);
    }

    setTempRect(null);
    setCurrentPoints([]);

    // Clear remote drawing preview
    if (boardId && user) {
      fetch(`/api/boards/${boardId}/cursor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          name: user.displayName,
          email: user.email,
          cursorX: coords.x,
          cursorY: coords.y,
          pageId: activePageId,
          isTyping: chatMessage.length > 0,
          isDrawing: false,
        }),
      }).catch(() => {});
    }

    // Sync state delta with server
    if (newObject || activeTool === 'move') {
      syncShapesToServer(finalObjects);
    }
  };

  // 6. Direct manipulation REST updates
  const syncShapesToServer = async (shapesList: BoardObject[]) => {
    if (!boardId || !activePageId) return;
    try {
      await fetch(`/api/boards/${boardId}/pages/${activePageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objects: shapesList }),
      });
    } catch (e) {
      console.error('Error syncing shapes back to SSE backend server:', e);
    }
  };

  const handleDeleteObject = (id: string) => {
    const prev = [...objects];
    const filtered = objects.filter((o) => o.id !== id);
    setObjects(filtered);
    setSelectedId(null);
    setIsColorPickerOpen(false);
    setUndoStack((u) => [...u, prev]);
    syncShapesToServer(filtered);
  };

  const handleDuplicateObject = (id: string) => {
    const target = objects.find((o) => o.id === id);
    if (!target) return;

    const prev = [...objects];
    const duplicate: BoardObject = {
      ...target,
      id: 'obj_' + Math.random().toString(36).substr(2, 9),
      x: target.x + 30, // Offset duplicate
      y: target.y + 30,
      lastModified: Date.now(),
    };

    const next = [...objects, duplicate];
    setObjects(next);
    setSelectedId(duplicate.id);
    setUndoStack((u) => [...u, prev]);
    syncShapesToServer(next);
  };

  const handleCopyObject = (id: string) => {
    const target = objects.find((o) => o.id === id);
    if (target) {
      copiedObjectRef.current = target;
    }
  };

  const handleCutObject = (id: string) => {
    const target = objects.find((o) => o.id === id);
    if (target) {
      copiedObjectRef.current = target;
      handleDeleteObject(id);
    }
  };

  const handlePasteObject = () => {
    if (copiedObjectRef.current) {
      const target = copiedObjectRef.current;
      const prev = [...objects];
      const pasted: BoardObject = {
        ...target,
        id: 'obj_' + Math.random().toString(36).substr(2, 9),
        x: target.x + 30,
        y: target.y + 30,
        points: target.points?.map(([px, py]) => [px + 30, py + 30]),
        lastModified: Date.now(),
      };
      const next = [...objects, pasted];
      setObjects(next);
      setSelectedId(pasted.id);
      setUndoStack((u) => [...u, prev]);
      syncShapesToServer(next);
    }
  };

  const handleToggleLock = (id: string) => {
    const next = objects.map((obj) => {
      if (obj.id === id) {
        return { ...obj, locked: !obj.locked };
      }
      return obj;
    });
    setObjects(next);
    syncShapesToServer(next);
  };

  const handleLayerShift = (id: string, direction: 'up' | 'down') => {
    const index = objects.findIndex((o) => o.id === id);
    if (index === -1) return;

    const next = [...objects];
    if (direction === 'up' && index < next.length - 1) {
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
    } else if (direction === 'down' && index > 0) {
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
    }
    setObjects(next);
    syncShapesToServer(next);
  };

  // Undo/Redo Triggers
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, objects]);
    setObjects(previous);
    syncShapesToServer(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, objects]);
    setObjects(next);
    syncShapesToServer(next);
  };

  const handleClearCanvas = () => {
    setShowClearConfirm(true);
  };

  const performClearCanvas = () => {
    const prev = [...objects];
    setObjects([]);
    setSelectedId(null);
    setUndoStack((u) => [...u, prev]);
    syncShapesToServer([]);
    setShowClearConfirm(false);
    setToast({ message: 'Whiteboard canvas completely wiped out.', type: 'success' });
  };

  // Double click text box to trigger textarea modal
  const handleTextDoubleClick = (obj: BoardObject) => {
    if (isViewer) return;
    setEditingTextId(obj.id);
    setTextInputValue(obj.text || '');
  };

  const handleSaveTextEdit = () => {
    if (!editingTextId) return;
    const next = objects.map((obj) => {
      if (obj.id === editingTextId) {
        return { ...obj, text: textInputValue, lastModified: Date.now() };
      }
      return obj;
    });
    setObjects(next);
    setEditingTextId(null);
    syncShapesToServer(next);
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isViewer) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            base64,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          const generatedId = 'obj_' + Math.random().toString(36).substr(2, 9);
          const imgObj: BoardObject = {
            id: generatedId,
            type: 'image',
            x: 200,
            y: 200,
            width: 250,
            height: 200,
            stroke: 'transparent',
            strokeWidth: 0,
            fill: 'transparent',
            opacity: 1,
            dashed: false,
            imageUrl: data.url,
            rotation: 0,
            creatorId: user?.uid || '',
            creatorName: user?.displayName || '',
            lastModified: Date.now(),
          };
          const next = [...objects, imgObj];
          setObjects(next);
          syncShapesToServer(next);
        }
      } catch (err) {
        alert('Image upload simulation error');
      }
    };
    reader.readAsDataURL(file);
  };

  // 7. Dynamic shape path calculator
  const getSvgPathFromPoints = (pointsList?: [number, number][]) => {
    if (!pointsList || pointsList.length === 0) return '';
    const d = pointsList.reduce((acc, [x, y], i) => {
      if (i === 0) return `M ${x} ${y}`;
      return `${acc} L ${x} ${y}`;
    }, '');
    return d;
  };

  // Zoom Controllers
  function fitToScreen(targetObjects = objects) {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth || window.innerWidth;
    const containerHeight = containerRef.current.clientHeight || (window.innerHeight - 56);

    if (!targetObjects || targetObjects.length === 0) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    targetObjects.forEach((obj) => {
      if (obj.points && obj.points.length > 0) {
        obj.points.forEach(([px, py]) => {
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        });
      } else {
        const x2 = obj.x + (obj.width || 0);
        const y2 = obj.y + (obj.height || 0);
        if (obj.x < minX) minX = obj.x;
        if (x2 > maxX) maxX = x2;
        if (obj.y < minY) minY = obj.y;
        if (y2 > maxY) maxY = y2;
      }
    });

    if (minX === Infinity || maxX === -Infinity || minY === Infinity || maxY === -Infinity) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const padding = 60;
    const contentWidth = (maxX - minX) + padding * 2;
    const contentHeight = (maxY - minY) + padding * 2;

    const zoomX = containerWidth / contentWidth;
    const zoomY = containerHeight / contentHeight;
    const newZoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.25), 1.25);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const newPanX = containerWidth / 2 - centerX * newZoom;
    const newPanY = containerHeight / 2 - centerY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.45));
  const handleResetZoom = () => {
    fitToScreen();
  };

  // Save checkpoint versions
  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveCheckpointDesc.trim() || !user || !boardId) return;

    try {
      const res = await fetch(`/api/boards/${boardId}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          editorName: user.displayName,
          description: saveCheckpointDesc.trim(),
          objectsSnapshot: objects,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveCheckpointDesc('');
        setToast({ message: 'Drawing version snapshot saved successfully!', type: 'success' });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to save version snapshot.', type: 'error' });
    }
  };

  // Restore previous drawing version
  const handleRestoreVersion = (version: BoardHistory) => {
    if (isViewer) return;
    setVersionToRestore(version);
  };

  const performRestoreVersion = async () => {
    if (!versionToRestore || isViewer) return;

    try {
      const res = await fetch(`/api/boards/${boardId}/history/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: versionToRestore.timestamp,
          pageId: activePageId,
        }),
      });
      if (res.ok) {
        setObjects(versionToRestore.objectsSnapshot);
        setToast({ message: 'Whiteboard layout restored successfully!', type: 'success' });
      } else {
        setToast({ message: 'Failed to restore whiteboard layout.', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      setToast({ message: 'Error restoring whiteboard layout.', type: 'error' });
    } finally {
      setVersionToRestore(null);
    }
  };

  // Invite Collaborator
  const handleInviteCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !boardId) return;

    setInviteError(null);
    setInviteSuccess(false);

    try {
      const res = await fetch(`/api/boards/${boardId}/collaborators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: 'editor',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteSuccess(true);
        setInviteEmail('');
        // Refresh board metadata to show new collaborators list
        const bRes = await fetch(`/api/boards/${boardId}`);
        const bData = await bRes.json();
        if (bRes.ok) setBoard(bData.board);
      } else {
        setInviteError(data.error || 'Failed to send workspace invitation');
      }
    } catch (err) {
      setInviteError('Connection to server failed');
    }
  };

  // Chat Submission
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !user || !boardId) return;

    const hash = Array.from(user.uid).reduce<number>((acc, char) => acc + (char as string).charCodeAt(0), 0);
    const userColorPalette = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];
    const assignedColor = userColorPalette[hash % userColorPalette.length];

    try {
      await fetch(`/api/boards/${boardId}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userName: user.displayName,
          userColor: assignedColor,
          text: chatMessage.trim(),
        }),
      });
      setChatMessage('');
    } catch (e) {
      console.error(e);
    }
  };

  // Pages management
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim() || !boardId) return;

    try {
      const res = await fetch(`/api/boards/${boardId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPageName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewPageName('');
        // Triggered SSE page:created handler will catch and update
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicatePage = async (pId: string, pName: string) => {
    if (!boardId) return;
    try {
      await fetch(`/api/boards/${boardId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${pName} (Copy)`, copyFromPageId: pId }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePage = (pId: string) => {
    if (!boardId) return;
    if (pages.length <= 1) {
      setToast({ message: 'You cannot delete the final whiteboard page.', type: 'error' });
      return;
    }
    setPageToDeleteId(pId);
  };

  const performDeletePage = async () => {
    if (!boardId || !pageToDeleteId) return;
    try {
      const res = await fetch(`/api/boards/${boardId}/pages/${pageToDeleteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setToast({ message: 'Whiteboard page deleted successfully.', type: 'success' });
      } else {
        const data = await res.json();
        setToast({ message: data.error || 'Failed to delete whiteboard page.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error deleting whiteboard page.', type: 'error' });
    } finally {
      setPageToDeleteId(null);
    }
  };

  // 8. Download/Export functionality
  const handleExportBoard = (format: 'png' | 'svg' | 'json') => {
    if (!svgRef.current) return;

    if (format === 'svg') {
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgRef.current);
      if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `${board?.name || 'whiteboard'}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else if (format === 'png') {
      // Draw SVG element to HTML Canvas
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgRef.current);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = window.URL.createObjectURL(svgBlob);
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = svgRef.current?.clientWidth || 1200;
        canvas.height = svgRef.current?.clientHeight || 800;
        const context = canvas.getContext('2d');
        if (context) {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0);
          const png = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = png;
          downloadLink.download = `${board?.name || 'whiteboard'}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      image.src = blobURL;
    } else if (format === 'json') {
      // Export vector metadata schema directly
      const jsonStr = JSON.stringify({ board, pages, objects }, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = `${board?.name || 'whiteboard'}.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg text-brand-text gap-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center gap-6">
          <Logo variant="horizontal" className="scale-110 mb-2" />
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <div className="space-y-1 text-center">
            <h2 className="text-sm font-sora font-extrabold tracking-tight">Verifying credentials...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg text-brand-text gap-6 relative overflow-hidden">
        <div className="absolute top-[30%] left-[30%] w-[35vw] h-[35vw] rounded-full aurora-blur pointer-events-none" />
        <div className="absolute bottom-[30%] right-[30%] w-[35vw] h-[35vw] rounded-full aurora-blur pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <Logo variant="horizontal" className="scale-110 mb-2" />
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <div className="space-y-1 text-center">
            <h2 className="text-sm font-sora font-extrabold tracking-tight">Syncing Collaborative Drawing Room...</h2>
            <p className="text-[10px] text-brand-text-sec font-mono font-bold tracking-wider uppercase">SSE CONNECTION ACTIVE</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden bg-brand-bg text-brand-text transition-colors duration-500 relative">
      {/* Workspace Top Action Ribbon */}
      <header className="h-14 glass border-b border-brand-border/85 bg-brand-bg-sec/55 px-4 flex items-center justify-between z-30 transition-all shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-brand-bg hover:bg-brand-bg-sec border border-brand-border/60 text-brand-text-sec hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="text-left">
            <h1 className="text-xs sm:text-sm font-bold text-brand-text flex items-center gap-2">
              <span className="bg-gradient-to-r from-brand-primary to-indigo-400 bg-clip-text text-transparent truncate max-w-[100px] sm:max-w-[200px] inline-block align-bottom">{board?.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/15 text-[8px] text-brand-primary font-mono font-extrabold uppercase tracking-wider">
                SSE Sync
              </span>
            </h1>
            <p className="text-[9px] text-brand-text-sec font-mono font-bold mt-0.5 uppercase tracking-wide">
              Role: <span className="text-brand-primary">{userRole}</span>
            </p>
          </div>
        </div>

        {/* Real-time peer presences indicators list */}
        <div className="flex items-center gap-3">
          <div className="relative pr-3 border-r border-brand-border/60 flex items-center">
            {/* Interactive Presence Button/Trigger */}
            <button
              onClick={() => setIsPresenceOpen(!isPresenceOpen)}
              className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-brand-bg hover:bg-brand-bg-sec border border-brand-border hover:border-brand-primary/40 transition-all cursor-pointer shadow-sm active:scale-95"
              title="View active collaborators"
            >
              {/* Desktop view: Avatar Group Stack */}
              <div className="hidden sm:flex items-center -space-x-1.5">
                {/* User themselves */}
                <div
                  className="w-7 h-7 rounded-full bg-brand-primary border-2 border-brand-bg text-white text-[8px] font-extrabold flex items-center justify-center uppercase shadow-md shadow-brand-primary/15 font-mono"
                  title={`${user?.displayName} (You - ${userRole})`}
                >
                  Me
                </div>
                {/* Real connected collaborators via SSE */}
                {(Object.values(presences) as UserPresence[]).slice(0, 3).map((p) => (
                  <div
                    key={p.userId}
                    className="w-7 h-7 rounded-full border-2 border-brand-bg text-white text-[8px] font-extrabold flex items-center justify-center uppercase shadow-sm relative font-mono"
                    style={{ backgroundColor: p.color }}
                    title={`${p.name} (${p.email})`}
                  >
                    {p.name.substring(0, 2)}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-brand-success border-2 border-brand-bg animate-pulse" />
                  </div>
                ))}
                {Object.values(presences).length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-brand-bg border-2 border-brand-border text-brand-text-sec text-[8px] font-extrabold flex items-center justify-center font-mono">
                    +{Object.values(presences).length - 3}
                  </div>
                )}
              </div>

              {/* Mobile view: Compact Presence Icon & Badge */}
              <div className="flex sm:hidden items-center gap-1">
                <Users className="w-3.5 h-3.5 text-brand-primary" />
                <span className="text-[10px] font-bold text-brand-text">
                  {Object.values(presences).length + 1}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
              </div>

              <ChevronDown className="w-3 h-3 text-brand-text-sec hidden sm:inline" />
            </button>

            {/* Clickable Presence Popover Dropdown (Responsive: absolute on desktop, fixed bottom sheet on mobile) */}
            <AnimatePresence>
              {isPresenceOpen && (
                <motion.div
                  ref={presenceRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-72 bg-brand-bg-sec/95 backdrop-blur-md border border-brand-border rounded-2xl p-4 shadow-xl z-50 text-left
                    sm:right-0 sm:left-auto
                    max-sm:fixed max-sm:bottom-4 max-sm:right-4 max-sm:left-4 max-sm:top-auto max-sm:w-auto max-sm:mx-0 max-sm:shadow-2xl"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-brand-border/60">
                    <div className="flex items-center gap-2 text-brand-text font-bold text-xs sm:text-sm">
                      <span className="text-base">👥</span>
                      <span>{Object.values(presences).length + 1} Collaborators</span>
                    </div>
                    <button
                      onClick={() => setIsPresenceOpen(false)}
                      className="p-1 rounded-lg hover:bg-brand-bg/60 text-brand-text-sec hover:text-brand-text transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
                    {/* Current User */}
                    <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-brand-bg/40 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-2.5 h-2.5 rounded-full bg-brand-success" />
                          <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-brand-success animate-ping opacity-60" />
                        </div>
                        <div className="w-7 h-7 rounded-full bg-brand-primary border border-brand-primary/20 text-white text-[10px] font-extrabold flex items-center justify-center uppercase font-mono shadow-sm">
                          {user?.displayName?.substring(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-brand-text flex items-center gap-1.5">
                            {user?.displayName} <span className="text-[10px] text-brand-primary font-medium px-1.5 py-0.2 rounded bg-brand-primary/10 border border-brand-primary/15">(You)</span>
                          </span>
                          <span className="text-[9px] text-brand-text-sec">{user?.email}</span>
                        </div>
                      </div>
                      {user?.uid === board?.ownerId && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-500 font-bold uppercase tracking-wider">
                          👑 Owner
                        </span>
                      )}
                    </div>

                    {/* Other Active Collaborators */}
                    {Object.values(presences).map((p: any) => {
                      const isOwner = p.userId === board?.ownerId;
                      return (
                        <div key={p.userId} className="flex items-center justify-between p-1.5 rounded-xl hover:bg-brand-bg/40 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <div className="w-2.5 h-2.5 rounded-full bg-brand-success" />
                              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-brand-success animate-ping opacity-60" />
                            </div>
                            <div
                              className="w-7 h-7 rounded-full border border-brand-border text-white text-[10px] font-extrabold flex items-center justify-center uppercase font-mono shadow-sm"
                              style={{ backgroundColor: p.color }}
                            >
                              {p.name.substring(0, 2)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-brand-text">
                                {p.name}
                              </span>
                              <span className="text-[9px] text-brand-text-sec">{p.email || 'Active Collaborator'}</span>
                            </div>
                          </div>
                          {isOwner && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-500 font-bold uppercase tracking-wider">
                              👑 Owner
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveRightDrawer(activeRightDrawer === 'pages' ? null : 'pages')}
              className={`px-2 py-1.5 sm:px-3 rounded-xl text-[9px] sm:text-[10px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-sm ${
                activeRightDrawer === 'pages'
                  ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/15'
                  : 'bg-brand-bg border-brand-border/70 text-brand-text-sec hover:text-brand-text hover:border-brand-primary/20'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline uppercase tracking-wide">Pages ({pages.length})</span>
            </button>

            <button
              onClick={() => setActiveRightDrawer(activeRightDrawer === 'chat' ? null : 'chat')}
              className={`px-2 py-1.5 sm:px-3 rounded-xl text-[9px] sm:text-[10px] font-bold flex items-center gap-1.5 border transition-all relative cursor-pointer shadow-sm ${
                activeRightDrawer === 'chat'
                  ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/15'
                  : 'bg-brand-bg border-brand-border/70 text-brand-text-sec hover:text-brand-text hover:border-brand-primary/20'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden md:inline uppercase tracking-wide">Chat</span>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-brand-error text-white text-[8px] font-extrabold rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {unreadChatCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveRightDrawer(activeRightDrawer === 'history' ? null : 'history')}
              className={`px-2 py-1.5 sm:px-3 rounded-xl text-[9px] sm:text-[10px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-sm ${
                activeRightDrawer === 'history'
                  ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/15'
                  : 'bg-brand-bg border-brand-border/70 text-brand-text-sec hover:text-brand-text hover:border-brand-primary/20'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden md:inline uppercase tracking-wide">Snapshots</span>
            </button>

            <button
              onClick={() => setActiveRightDrawer(activeRightDrawer === 'share' ? null : 'share')}
              className={`px-2 py-1.5 sm:px-3 rounded-xl text-[9px] sm:text-[10px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer shadow-sm ${
                activeRightDrawer === 'share'
                  ? 'bg-brand-primary text-white border-brand-primary shadow-md shadow-brand-primary/15'
                  : 'bg-brand-bg border-brand-border/70 text-brand-text-sec hover:text-brand-text hover:border-brand-primary/20'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline uppercase tracking-wide">Invite</span>
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Inner stage layout */}
      <div className="flex-1 min-h-0 w-full flex flex-col xl:flex-row relative overflow-hidden">
        
        {/* Left floating Drawing Tools Sidebar */}
        <motion.aside
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.1 }}
          className="whiteboard-sidebar z-20 flex gap-1 md:gap-1.5 p-1.5 glass border-brand-border/85 bg-brand-bg-sec/55 scrollbar-none"
        >
          {/* Pointer Tool (S) */}
          <motion.button
            whileHover={{ scale: 1.12, rotate: 2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setActiveTool('select');
              setSelectedId(null);
              setIsColorPickerOpen(false);
            }}
            className={`p-2.5 rounded-xl transition-all cursor-pointer border flex items-center justify-center flex-shrink-0 ${
              activeTool === 'select'
                ? 'bg-gradient-to-tr from-brand-primary to-indigo-600 text-white border-brand-primary shadow-md shadow-brand-primary/20 scale-[1.04]'
                : 'text-brand-text-sec hover:text-brand-text border-transparent hover:border-brand-border/30 hover:bg-brand-bg-sec'
            }`}
            title="Pointer Tool (S)"
          >
            <MousePointer className="w-4 h-4" />
          </motion.button>

          {/* Undo */}
          <motion.button
            whileHover={undoStack.length > 0 ? { scale: 1.12, rotate: -2 } : {}}
            whileTap={undoStack.length > 0 ? { scale: 0.92 } : {}}
            onClick={() => handleUndo()}
            disabled={undoStack.length === 0}
            className={`p-2.5 rounded-xl transition-all border flex items-center justify-center flex-shrink-0 ${
              undoStack.length === 0
                ? 'opacity-40 border-transparent text-brand-text-sec cursor-not-allowed'
                : 'text-brand-text-sec hover:text-brand-text border-transparent hover:border-brand-border/30 hover:bg-brand-bg-sec cursor-pointer'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4 text-brand-primary" />
          </motion.button>

          {/* Redo */}
          <motion.button
            whileHover={redoStack.length > 0 ? { scale: 1.12, rotate: 2 } : {}}
            whileTap={redoStack.length > 0 ? { scale: 0.92 } : {}}
            onClick={() => handleRedo()}
            disabled={redoStack.length === 0}
            className={`p-2.5 rounded-xl transition-all border flex items-center justify-center flex-shrink-0 ${
              redoStack.length === 0
                ? 'opacity-40 border-transparent text-brand-text-sec cursor-not-allowed'
                : 'text-brand-text-sec hover:text-brand-text border-transparent hover:border-brand-border/30 hover:bg-brand-bg-sec cursor-pointer'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4 text-brand-primary" />
          </motion.button>

          {[
            { id: 'hand', label: 'Pan Tool (Space)', icon: <Hand className="w-4 h-4" /> },
            { id: 'eraser', label: 'Eraser (E)', icon: <Eraser className="w-4 h-4" /> },
            { id: 'pencil', label: 'Freehand Pencil (P)', icon: <Edit3 className="w-4 h-4" /> },
            { id: 'rect', label: 'Rectangle (R)', icon: <Square className="w-4 h-4" /> },
            { id: 'circle', label: 'Circle (C)', icon: <Circle className="w-4 h-4" /> },
            { id: 'line', label: 'Straight Line (L)', icon: <TrendingUp className="w-4 h-4 rotate-45" /> },
            { id: 'text', label: 'Text Block (T)', icon: <Type className="w-4 h-4" /> },
            { id: 'sticky', label: 'Sticky Note (N)', icon: <FileText className="w-4 h-4" /> },
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.12, rotate: 2 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setActiveTool(item.id as any);
                if (item.id !== 'select') {
                  setSelectedId(null);
                  if (item.id !== 'hand' && item.id !== 'eraser') {
                    setIsColorPickerOpen(true);
                  } else {
                    setIsColorPickerOpen(false);
                  }
                } else {
                  setIsColorPickerOpen(false);
                }
              }}
              className={`p-2.5 rounded-xl transition-all cursor-pointer border flex items-center justify-center flex-shrink-0 ${
                activeTool === item.id
                  ? 'bg-gradient-to-tr from-brand-primary to-indigo-600 text-white border-brand-primary shadow-md shadow-brand-primary/20 scale-[1.04]'
                  : 'text-brand-text-sec hover:text-brand-text border-transparent hover:border-brand-border/30 hover:bg-brand-bg-sec'
              }`}
              title={item.label}
              disabled={isViewer && item.id !== 'select' && item.id !== 'hand'}
            >
              {item.icon}
            </motion.button>
          ))}

          {/* Active Tool Styling/Color Palette Trigger */}
          {activeTool !== 'select' && activeTool !== 'hand' && !isViewer && (
            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer border flex items-center justify-center flex-shrink-0 relative ${
                isColorPickerOpen
                  ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/40 shadow-sm shadow-brand-primary/5'
                  : 'text-brand-text-sec hover:text-brand-text border-transparent hover:border-brand-border/30 hover:bg-brand-bg-sec'
              }`}
              title="Style & Colors"
            >
              <div 
                className="w-4 h-4 rounded-full border border-black/15 shadow-sm flex items-center justify-center relative"
                style={{ backgroundColor: activeTool === 'sticky' ? stickyColor : stroke }}
              >
                <Palette className="w-2.5 h-2.5 text-white mix-blend-difference" />
              </div>
            </motion.button>
          )}

          {/* Image Uploader Anchor */}
          {!isViewer && (
            <motion.label 
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              className="p-2.5 rounded-xl text-brand-text-sec hover:text-brand-text hover:bg-brand-bg-sec border border-transparent hover:border-brand-border/30 cursor-pointer transition-all flex items-center justify-center active:scale-95 flex-shrink-0" 
              title="Upload Image"
            >
              <ImageIcon className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </motion.label>
          )}

          {/* Quick Clear Trash Trigger */}
          {!isViewer && (
            <motion.button
              whileHover={{ scale: 1.12, backgroundColor: 'rgba(239,68,68,0.1)' }}
              whileTap={{ scale: 0.92 }}
              onClick={handleClearCanvas}
              className="p-2.5 rounded-xl text-brand-error hover:bg-brand-error/10 border border-transparent hover:border-brand-error/20 transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </motion.aside>

        {/* Center Canvas drawing workspace */}
        <div
          ref={containerRef}
          className="flex-1 h-full overflow-hidden relative canvas-grid whiteboard-canvas-container"
          onDragOver={(e) => e.preventDefault()}
        >
          {/* Main SVG drawing element viewport */}
          <svg
            ref={svgRef}
            className={`w-full h-full select-none ${activeTool === 'hand' ? 'cursor-grab active:cursor-grabbing' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Outer G layer handles viewport transforms for zoom & panning */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              
              {/* Render board object shapes list */}
              {objects.map((obj) => {
                const isSelected = obj.id === selectedId;
                const centerX = obj.x + obj.width / 2;
                const centerY = obj.y + obj.height / 2;
                const transformStr = `rotate(${obj.rotation || 0}, ${centerX}, ${centerY})`;

                return (
                  <g key={obj.id} onDoubleClick={() => handleTextDoubleClick(obj)} transform={transformStr}>
                    {/* Render specific shape type */}
                    {obj.type === 'rect' && (() => {
                      const { fill, fillOpacity } = getFillAndOpacity(obj.fill);
                      return (
                        <rect
                          x={obj.x}
                          y={obj.y}
                          width={obj.width}
                          height={obj.height}
                          stroke={obj.stroke}
                          strokeWidth={obj.strokeWidth}
                          fill={fill}
                          fillOpacity={fillOpacity}
                          opacity={obj.opacity}
                          strokeDasharray={obj.dashed ? '6,6' : 'none'}
                          rx={8}
                          ry={8}
                        />
                      );
                    })()}

                    {obj.type === 'circle' && (() => {
                      const { fill, fillOpacity } = getFillAndOpacity(obj.fill);
                      return (
                        <circle
                          cx={obj.x + obj.width / 2}
                          cy={obj.y + obj.height / 2}
                          r={Math.min(obj.width, obj.height) / 2}
                          stroke={obj.stroke}
                          strokeWidth={obj.strokeWidth}
                          fill={fill}
                          fillOpacity={fillOpacity}
                          opacity={obj.opacity}
                          strokeDasharray={obj.dashed ? '6,6' : 'none'}
                        />
                      );
                    })()}

                    {obj.type === 'line' && (
                      <line
                        x1={obj.x}
                        y1={obj.y}
                        x2={obj.x + obj.width}
                        y2={obj.y + obj.height}
                        stroke={obj.stroke}
                        strokeWidth={obj.strokeWidth}
                        opacity={obj.opacity}
                        strokeDasharray={obj.dashed ? '6,6' : 'none'}
                      />
                    )}

                    {(obj.type === 'pencil' || obj.type === 'brush') && (
                      <path
                        d={getSvgPathFromPoints(obj.points)}
                        stroke={obj.stroke}
                        strokeWidth={obj.strokeWidth}
                        fill="none"
                        opacity={obj.opacity}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {obj.type === 'sticky' && (
                      <g>
                        <rect
                          x={obj.x}
                          y={obj.y}
                          width={obj.width || 150}
                          height={obj.height || 150}
                          fill={obj.stickyColor || '#fef08a'}
                          stroke="#eab308"
                          strokeWidth={1}
                          opacity={0.95}
                          rx={4}
                          className="shadow-md"
                        />
                        <text
                          x={obj.x + 12}
                          y={obj.y + 24}
                          width={(obj.width || 150) - 24}
                          fill="#1e293b"
                          fontSize={obj.fontSize || 12}
                          fontFamily="sans-serif"
                          className="select-none font-medium text-left"
                        >
                          {obj.text}
                        </text>
                      </g>
                    )}

                    {obj.type === 'text' && (
                      <text
                        x={obj.x}
                        y={obj.y + 20}
                        fill={obj.stroke === 'transparent' ? '#0f172a' : obj.stroke}
                        fontSize={obj.fontSize || 16}
                        fontFamily={obj.fontFamily || 'Inter'}
                        fontWeight={obj.bold ? 'bold' : 'normal'}
                        fontStyle={obj.italic ? 'italic' : 'normal'}
                        textDecoration={obj.underline ? 'underline' : 'none'}
                        className="select-none text-left"
                      >
                        {obj.text}
                      </text>
                    )}

                    {obj.type === 'image' && (
                      <image
                        href={obj.imageUrl}
                        x={obj.x}
                        y={obj.y}
                        width={obj.width}
                        height={obj.height}
                        opacity={obj.opacity}
                        preserveAspectRatio="none"
                      />
                    )}

                    {/* Selection highlights overlay box */}
                    {isSelected && !isViewer && (
                      <g>
                        {/* Bounding box outline */}
                        <rect
                          x={obj.x - 4}
                          y={obj.y - 4}
                          width={obj.width + 8}
                          height={obj.height + 8}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth={1.5}
                          strokeDasharray="4,4"
                          pointerEvents="none"
                        />

                        {/* Rotation connector line */}
                        <line
                          x1={obj.x + obj.width / 2}
                          y1={obj.y - 4}
                          x2={obj.x + obj.width / 2}
                          y2={obj.y - 24}
                          stroke="#6366f1"
                          strokeWidth={1.5}
                          strokeDasharray="2,2"
                          pointerEvents="none"
                        />

                        {/* Rotation handle */}
                        <circle
                          cx={obj.x + obj.width / 2}
                          cy={obj.y - 24}
                          r={6}
                          fill="#ffffff"
                          stroke="#6366f1"
                          strokeWidth={2}
                          style={{ cursor: 'alias' }}
                          className="hover:scale-125 transition-transform"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setDragAction({
                              type: 'rotate',
                              startCoords: getMouseCoords(e),
                              initialObj: { ...obj },
                            });
                            setIsDrawing(true);
                          }}
                        />

                        {/* 8 Resize handles */}
                        {[
                          { id: 'tl', cx: obj.x - 4, cy: obj.y - 4, cursor: 'nwse-resize' },
                          { id: 'tc', cx: obj.x + obj.width / 2, cy: obj.y - 4, cursor: 'ns-resize' },
                          { id: 'tr', cx: obj.x + obj.width + 4, cy: obj.y - 4, cursor: 'nesw-resize' },
                          { id: 'ml', cx: obj.x - 4, cy: obj.y + obj.height / 2, cursor: 'ew-resize' },
                          { id: 'mr', cx: obj.x + obj.width + 4, cy: obj.y + obj.height / 2, cursor: 'ew-resize' },
                          { id: 'bl', cx: obj.x - 4, cy: obj.y + obj.height + 4, cursor: 'nesw-resize' },
                          { id: 'bc', cx: obj.x + obj.width / 2, cy: obj.y + obj.height + 4, cursor: 'ns-resize' },
                          { id: 'br', cx: obj.x + obj.width + 4, cy: obj.y + obj.height + 4, cursor: 'nwse-resize' },
                        ].map((h) => (
                          <rect
                            key={h.id}
                            x={h.cx - 5}
                            y={h.cy - 5}
                            width={10}
                            height={10}
                            fill="#ffffff"
                            stroke="#6366f1"
                            strokeWidth={1.5}
                            style={{ cursor: h.cursor }}
                            className="hover:scale-125 transition-transform"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setDragAction({
                                type: 'resize',
                                handle: h.id as any,
                                startCoords: getMouseCoords(e),
                                initialObj: { ...obj },
                              });
                              setIsDrawing(true);
                            }}
                          />
                        ))}
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Render dynamic temporary drawing outline preview */}
              {tempRect && (
                <g>
                  {tempRect.type === 'rect' && (() => {
                    const { fill, fillOpacity } = getFillAndOpacity(tempRect.fill);
                    return (
                      <rect
                        x={tempRect.x}
                        y={tempRect.y}
                        width={tempRect.width}
                        height={tempRect.height}
                        stroke={tempRect.stroke}
                        strokeWidth={tempRect.strokeWidth}
                        fill={fill}
                        fillOpacity={fillOpacity}
                        opacity={0.5}
                        rx={8}
                      />
                    );
                  })()}
                  {tempRect.type === 'circle' && (() => {
                    const { fill, fillOpacity } = getFillAndOpacity(tempRect.fill);
                    return (
                      <circle
                        cx={tempRect.x + tempRect.width / 2}
                        cy={tempRect.y + tempRect.height / 2}
                        r={Math.min(tempRect.width, tempRect.height) / 2}
                        stroke={tempRect.stroke}
                        strokeWidth={tempRect.strokeWidth}
                        fill={fill}
                        fillOpacity={fillOpacity}
                        opacity={0.5}
                      />
                    );
                  })()}
                  {tempRect.type === 'line' && (
                    <line
                      x1={tempRect.x}
                      y1={tempRect.y}
                      x2={tempRect.x + tempRect.width}
                      y2={tempRect.y + tempRect.height}
                      stroke={tempRect.stroke}
                      strokeWidth={tempRect.strokeWidth}
                      opacity={0.5}
                    />
                  )}
                </g>
              )}

              {/* Active pencil/brush coordinates path preview */}
              {(activeTool === 'pencil' || activeTool === 'brush') && isDrawing && (
                <path
                  d={getSvgPathFromPoints(currentPoints)}
                  stroke={stroke}
                  strokeWidth={activeTool === 'brush' ? 8 : strokeWidth}
                  fill="none"
                  opacity={0.5}
                />
              )}

              {/* Real-time remote active drawings */}
              {(Object.values(presences) as any[]).map((p) => {
                if (p.pageId !== activePageId) return null;
                const isUserDrawing = p.isDrawing;
                if (!isUserDrawing) return null;

                return (
                  <g key={`draw_${p.userId}`} opacity={p.opacity || 0.5}>
                    {(p.drawingTool === 'pencil' || p.drawingTool === 'brush') && p.drawingPoints && p.drawingPoints.length > 0 && (
                      <path
                        d={getSvgPathFromPoints(p.drawingPoints)}
                        stroke={p.stroke || '#000000'}
                        strokeWidth={p.drawingTool === 'brush' ? 8 : (p.strokeWidth || 2)}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {p.tempRect && (
                      <g>
                        {p.tempRect.type === 'rect' && (() => {
                          const { fill, fillOpacity } = getFillAndOpacity(p.tempRect.fill);
                          return (
                            <rect
                              x={p.tempRect.x}
                              y={p.tempRect.y}
                              width={p.tempRect.width}
                              height={p.tempRect.height}
                              stroke={p.tempRect.stroke}
                              strokeWidth={p.tempRect.strokeWidth}
                              fill={fill}
                              fillOpacity={fillOpacity}
                              rx={8}
                            />
                          );
                        })()}
                        {p.tempRect.type === 'circle' && (() => {
                          const { fill, fillOpacity } = getFillAndOpacity(p.tempRect.fill);
                          return (
                            <circle
                              cx={p.tempRect.x + p.tempRect.width / 2}
                              cy={p.tempRect.y + p.tempRect.height / 2}
                              r={Math.min(p.tempRect.width, p.tempRect.height) / 2}
                              stroke={p.tempRect.stroke}
                              strokeWidth={p.tempRect.strokeWidth}
                              fill={fill}
                              fillOpacity={fillOpacity}
                            />
                          );
                        })()}
                        {p.tempRect.type === 'line' && (
                          <line
                            x1={p.tempRect.x}
                            y1={p.tempRect.y}
                            x2={p.tempRect.x + p.tempRect.width}
                            y2={p.tempRect.y + p.tempRect.height}
                            stroke={p.tempRect.stroke}
                            strokeWidth={p.tempRect.strokeWidth}
                          />
                        )}
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Real-time remote cursors rendering overlay */}
              {(Object.values(presences) as UserPresence[]).map((p) => {
                if (p.pageId !== activePageId) return null;
                return (
                  <g key={p.userId} style={{ transform: `translate(${p.cursorX}px, ${p.cursorY}px)` }} className="transition-all duration-75">
                    <MousePointer className="w-5 h-5 drop-shadow-md" style={{ color: p.color, fill: p.color }} />
                    <text x={14} y={15} fill={p.color} fontSize={10} fontWeight="bold" className="font-sans select-none drop-shadow">
                      {p.name} {p.isTyping ? '💬' : ''}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Floating Workspace Action Bar (Duplicate, Rotate, Delete, Locking options) */}
          <AnimatePresence>
            {selectedId && !isViewer && (
              <motion.div
                initial={{ opacity: 0, y: 50, x: '-50%', scale: 0.95 }}
                animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
                exit={{ opacity: 0, y: 50, x: '-50%', scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                className="absolute bottom-20 md:bottom-6 left-1/2 z-20 flex items-center gap-1.5 p-1.5 md:gap-2 md:p-2 rounded-xl glass border border-brand-primary/30 bg-brand-bg-sec/90 shadow-xl shadow-brand-primary/10"
              >
              {/* Lock Toggle */}
              {(() => {
                const target = objects.find((o) => o.id === selectedId);
                const isLocked = !!target?.locked;
                return (
                  <button
                    onClick={() => handleToggleLock(selectedId)}
                    className="p-2 rounded-lg bg-brand-bg hover:bg-brand-bg-sec text-brand-text-sec hover:text-brand-text border border-brand-border/40 hover:border-brand-border transition-all"
                    title={isLocked ? 'Unlock Shape' : 'Lock Shape'}
                  >
                    {isLocked ? <Lock className="w-4 h-4 text-brand-error" /> : <Unlock className="w-4 h-4" />}
                  </button>
                );
              })()}

              {/* Copy Duplicate */}
              <button
                onClick={() => handleDuplicateObject(selectedId)}
                className="p-2 rounded-lg bg-brand-bg hover:bg-brand-bg-sec text-brand-text-sec hover:text-brand-text border border-brand-border/40 hover:border-brand-border transition-all"
                title="Duplicate (Ctrl+D)"
              >
                <Copy className="w-4 h-4" />
              </button>

              {/* Trash Delete */}
              <button
                onClick={() => handleDeleteObject(selectedId)}
                className="p-2 rounded-lg bg-brand-error/10 hover:bg-brand-error/20 text-brand-error border border-brand-error/20 transition-all"
                title="Delete Object"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Canvas Viewport controllers bottom right */}
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20 flex items-center gap-0.5 p-0.5 md:gap-1 md:p-1 rounded-xl glass border border-brand-border/85 bg-brand-bg-sec/75 shadow-xl">
            <button onClick={handleZoomOut} className="p-1.5 md:p-2 rounded-lg text-brand-text-sec hover:text-brand-text hover:bg-brand-bg/60 border border-transparent hover:border-brand-border/30 transition-all active:scale-90" title="Zoom Out">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-mono font-extrabold w-11 text-center text-brand-text">
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={handleZoomIn} className="p-1.5 md:p-2 rounded-lg text-brand-text-sec hover:text-brand-text hover:bg-brand-bg/60 border border-transparent hover:border-brand-border/30 transition-all active:scale-90" title="Zoom In">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={handleResetZoom} className="p-1.5 md:p-2 rounded-lg text-brand-text-sec hover:text-brand-text hover:bg-brand-bg/60 border border-transparent hover:border-brand-border/30 transition-all active:scale-90" title="Reset Canvas Zoom">
              <Maximize className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridEnabled(!gridEnabled)}
              className={`p-1.5 md:p-2 rounded-lg transition-all border ${gridEnabled ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/25 font-bold' : 'text-brand-text-sec border-transparent hover:text-brand-text hover:bg-brand-bg/60'}`}
              title="Toggle Grid system"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Styling settings sidebar (Responsive popover relative to toolbar/sidebar, visible if color picker toggled or an object is selected) */}
        <AnimatePresence>
          {((isColorPickerOpen && activeTool !== 'hand') || (selectedId && activeTool === 'select' && !isPropertiesPanelDismissed)) && !isViewer && (
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: -10 }}
              transition={{ type: 'spring', stiffness: 260, damping: 25 }}
              className="absolute top-16 left-4 right-4 sm:left-6 sm:right-auto sm:w-64 xl:left-[76px] xl:top-1/2 xl:-translate-y-1/2 xl:right-auto z-25 w-auto sm:w-64 p-4 md:p-5 rounded-2xl glass border border-brand-border/80 bg-brand-bg-sec/95 text-left space-y-3 md:space-y-4 shadow-xl shadow-brand-primary/5 max-h-[65vh] xl:max-h-[80vh] overflow-y-auto scrollbar-none"
            >
            <div className="flex items-center justify-between border-b border-brand-border/50 pb-2">
              <h3 className="text-[10px] font-mono font-extrabold text-brand-text-sec uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" /> {selectedId ? 'EDIT PROPERTIES' : 'DRAWING OPTIONS'}
              </h3>
              <button 
                onClick={() => {
                  setIsColorPickerOpen(false);
                  if (selectedId) {
                    setIsPropertiesPanelDismissed(true);
                  }
                }}
                className="p-1 rounded-md text-brand-text-sec hover:text-brand-text hover:bg-brand-bg/50 transition-colors cursor-pointer"
                title="Close styling panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
 
            {/* Stroke Color Palette picker */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-sec">Stroke / Border Color</label>
              <div className="flex flex-wrap gap-2">
                {['#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6', '#6366f1', '#a855f7', '#0f172a', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      handleStrokeChange(c);
                    }}
                    className="w-5.5 h-5.5 rounded-full border border-brand-border transition-all cursor-pointer shadow-sm hover:scale-110 relative flex items-center justify-center active:scale-90"
                    style={{ backgroundColor: c }}
                  >
                    {stroke === c && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                    )}
                  </button>
                ))}
              </div>
            </div>
 
            {/* Fill options */}
            {(() => {
              const selectedObj = selectedId ? objects.find((o) => o.id === selectedId) : null;
              const currentType = selectedObj ? selectedObj.type : activeTool;
              const hasFill = currentType !== 'pencil' && currentType !== 'brush' && currentType !== 'line' && currentType !== 'text' && currentType !== 'sticky';
              if (!hasFill) return null;

              const mappedFill = (() => {
                const oldColors: Record<string, string> = {
                  '#b91c1c4d': '#fca5a58c',
                  '#c2410c4d': '#fed7aa8c',
                  '#a162074d': '#fef08a8c',
                  '#15803d4d': '#bbf7d08c',
                  '#1d4ed84d': '#bfdbfe8c',
                  '#4338ca4d': '#c7d2fe8c',
                  '#1e293b59': '#cbd5e1a6',
                };
                return oldColors[fill] || fill;
              })();

              return (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-sec">Solid Fill</label>
                    <div className="flex flex-wrap gap-2">
                      {['transparent', '#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6', '#6366f1', '#0f172a'].map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            handleFillChange(c);
                          }}
                          className="w-5.5 h-5.5 rounded-full border border-brand-border transition-all cursor-pointer shadow-sm hover:scale-110 flex items-center justify-center active:scale-90"
                          style={{ backgroundColor: c === 'transparent' ? 'transparent' : c }}
                          title={c === 'transparent' ? 'No Fill' : 'Solid Color'}
                        >
                          {fill === c && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white mix-blend-difference" />
                          )}
                          {c === 'transparent' && fill === 'transparent' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-sec">Soft Tint Fill</label>
                    <div className="flex flex-wrap gap-2">
                      {['#fca5a58c', '#fed7aa8c', '#fef08a8c', '#bbf7d08c', '#bfdbfe8c', '#c7d2fe8c', '#cbd5e1a6'].map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            handleFillChange(c);
                          }}
                          className="color-option-soft-tint w-5.5 h-5.5 rounded-full border border-brand-border transition-all cursor-pointer shadow-sm hover:scale-110 flex items-center justify-center active:scale-90"
                          style={{ backgroundColor: c }}
                          title="Soft Tint"
                        >
                          {mappedFill === c && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
 
            {/* Sticky specific colors list */}
            {(() => {
              const selectedObj = selectedId ? objects.find((o) => o.id === selectedId) : null;
              const currentType = selectedObj ? selectedObj.type : activeTool;
              if (currentType !== 'sticky') return null;

              return (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-sec">Post-It background</label>
                  <div className="flex gap-2">
                    {['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa'].map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          handleStickyColorChange(c);
                        }}
                        className="w-5.5 h-5.5 rounded-full border border-brand-border/70 shadow-sm hover:scale-110 transition-all flex items-center justify-center active:scale-90"
                        style={{ backgroundColor: c }}
                      >
                        {stickyColor === c && (
                          <span className="w-1.5 h-1.5 rounded-full bg-black/60" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
 
            {/* Stroke Width Slider */}
            {(() => {
              const selectedObj = selectedId ? objects.find((o) => o.id === selectedId) : null;
              const currentType = selectedObj ? selectedObj.type : activeTool;
              if (currentType === 'text') return null;

              return (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-brand-text-sec">
                    <span>Stroke Width</span>
                    <span className="font-mono text-brand-primary font-bold">{strokeWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={strokeWidth}
                    onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
                    onMouseUp={() => dismissPanelAfterSelection()}
                    onTouchEnd={() => dismissPanelAfterSelection()}
                    className="w-full h-1 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-primary"
                  />
                </div>
              );
            })()}
 
            {/* Opacity slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-brand-text-sec">
                <span>Opacity</span>
                <span className="font-mono text-brand-primary font-bold">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                onMouseUp={() => dismissPanelAfterSelection()}
                onTouchEnd={() => dismissPanelAfterSelection()}
                className="w-full h-1 bg-brand-bg rounded-lg appearance-none cursor-pointer accent-brand-primary"
              />
            </div>
 
            {/* Border dashes */}
            {(() => {
              const selectedObj = selectedId ? objects.find((o) => o.id === selectedId) : null;
              const currentType = selectedObj ? selectedObj.type : activeTool;
              const canDash = currentType !== 'pencil' && currentType !== 'brush' && currentType !== 'text';
              if (!canDash) return null;

              return (
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-brand-text-sec">
                  <span>Dashed Border</span>
                  <input
                    type="checkbox"
                    checked={dashed}
                    onChange={(e) => {
                      handleDashedChange(e.target.checked);
                      dismissPanelAfterSelection();
                    }}
                    className="w-4 h-4 rounded accent-brand-primary cursor-pointer border-brand-border"
                  />
                </div>
              );
            })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* RIGHT DRAWERS STAGES (Chat / Version History / Share / Pages) */}
        <AnimatePresence mode="wait">
          {activeRightDrawer && (
            <motion.aside
              key={activeRightDrawer}
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="absolute right-0 top-0 bottom-0 md:relative w-full sm:w-80 h-full border-l border-brand-border bg-brand-bg-sec/90 backdrop-blur-xl z-40 flex flex-col shadow-2xl"
            >
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-brand-border flex items-center justify-between text-left">
              <h2 className="text-xs font-mono font-extrabold text-brand-text uppercase tracking-wider flex items-center gap-2">
                {activeRightDrawer === 'chat' && 'Live Team Chat'}
                {activeRightDrawer === 'history' && 'Snapshot Checkpoints'}
                {activeRightDrawer === 'share' && 'Invite Teammate'}
                {activeRightDrawer === 'pages' && 'Whiteboard Pages'}
              </h2>
              <button
                onClick={() => setActiveRightDrawer(null)}
                className="p-1 rounded-lg bg-brand-bg hover:bg-brand-bg-sec border border-brand-border text-brand-text-sec hover:text-brand-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer body scroll container */}
            <div className="flex-1 overflow-y-auto p-4 text-left">
              
              {/* CHAT TAB SCREEN */}
              {activeRightDrawer === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-4 overflow-y-auto pr-1 pb-4">
                    {chats.map((msg) => (
                      <div key={msg.id} className="text-xs">
                        <div className="flex items-center gap-1.5 font-bold mb-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: msg.userColor }} />
                          <span style={{ color: msg.userColor }}>{msg.userName}</span>
                          <span className="text-[9px] text-brand-text-sec font-mono font-bold">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="p-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text-sec font-semibold leading-relaxed word-break shadow-sm">
                          {msg.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Message Input form */}
                  <form onSubmit={handleSendChat} className="pt-3 border-t border-brand-border flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a team message..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-text-sec/60 focus:outline-none focus:border-brand-primary transition-colors"
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-xl bg-brand-primary text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center shadow-md shadow-brand-primary/10"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

              {/* VERSION HISTORY SCREEN */}
              {activeRightDrawer === 'history' && (
                <div className="space-y-6">
                  {/* Save current snapshot form */}
                  {!isViewer && (
                    <form onSubmit={handleSaveVersion} className="p-4 rounded-2xl bg-brand-bg/50 border border-brand-border space-y-3">
                      <h3 className="text-xs font-bold text-brand-primary uppercase font-mono tracking-wider">Save Canvas Version</h3>
                      <input
                        type="text"
                        required
                        placeholder="Checkpoint label (e.g. Added auth diagrams)"
                        value={saveCheckpointDesc}
                        onChange={(e) => setSaveCheckpointDesc(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-text-sec/60 focus:outline-none focus:border-brand-primary"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 bg-brand-primary hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-brand-primary/15"
                      >
                        Create Checkpoint
                      </button>
                    </form>
                  )}

                  {/* List of existing checkpoints */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-extrabold text-brand-text-sec uppercase tracking-wider">CHECKPOINT CHRONOLOGY</h3>
                    {history.map((ver, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-brand-border bg-brand-bg/50 flex flex-col justify-between gap-2.5 hover:border-brand-primary/40 hover:bg-brand-bg-sec/50 transition-all text-xs"
                      >
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-brand-text">{ver.description}</h4>
                          <p className="text-[10px] text-brand-text-sec font-mono font-bold">
                            By {ver.editorName} • {new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!isViewer && (
                          <button
                            onClick={() => handleRestoreVersion(ver)}
                            className="w-full py-1.5 rounded-xl bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 transition-all text-[11px] font-bold cursor-pointer"
                          >
                            Restore Version
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* INVITE COLLABORATORS SCREEN */}
              {activeRightDrawer === 'share' && (
                <div className="space-y-6">
                  {/* Shareable whiteboard URL card */}
                  <div className="p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/15 space-y-3">
                    <h3 className="text-xs font-mono font-extrabold text-brand-primary uppercase tracking-wider">Share Board Coordinates</h3>
                    <p className="text-[11px] text-brand-text-sec font-medium leading-relaxed">Teammates can enter via Dashboard or access this coordinates link directly.</p>
                    
                    {copyFeedback && (
                      <div className={`p-2.5 text-xs rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                        copyFeedback.type === 'success' 
                          ? 'bg-brand-success/10 text-brand-success border border-brand-success/20' 
                          : 'bg-brand-error/10 text-brand-error border border-brand-error/20'
                      }`}>
                        {copyFeedback.type === 'success' ? <Check className="w-3.5 h-3.5" /> : null}
                        {copyFeedback.message}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={window.location.href}
                        className="flex-1 px-2.5 py-1.5 text-[10px] font-mono rounded-lg bg-brand-bg border border-brand-border text-brand-text-sec outline-none select-all font-bold"
                      />
                      <button
                        onClick={() => handleCopy(window.location.href, true)}
                        className="px-3 py-1.5 rounded-lg bg-brand-primary text-white text-[10px] font-bold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[10px] text-brand-text-sec font-mono font-bold border-t border-brand-border/40 mt-3 pt-3">
                      <div>
                        <span>Room ID: </span>
                        <span className="font-extrabold text-brand-text select-all">{boardId}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(boardId || '', false)}
                        className="px-2 py-1 rounded bg-brand-bg border border-brand-border text-brand-text-sec hover:text-brand-text hover:border-brand-primary/20 transition-all text-[9px] font-bold cursor-pointer"
                      >
                        Copy ID
                      </button>
                    </div>
                  </div>

                  {/* Add collaborator email invitation */}
                  {!isViewer && (
                    <form onSubmit={handleInviteCollaborator} className="space-y-3.5 text-left border-t border-brand-border pt-5">
                      <div>
                        <h3 className="text-xs font-mono font-extrabold text-brand-text uppercase tracking-wider">Add Workspace Editor</h3>
                        <p className="text-[11px] text-brand-text-sec font-medium mt-1">Provide collaborator email to add them to this whiteboard workspace.</p>
                      </div>

                      {inviteError && (
                        <div className="p-2.5 text-xs rounded-xl bg-brand-error/10 text-brand-error border border-brand-error/20 font-bold">
                          {inviteError}
                        </div>
                      )}

                      {inviteSuccess && (
                        <div className="p-2.5 text-xs rounded-xl bg-brand-success/10 text-brand-success border border-brand-success/20 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Added collaborator successfully!
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono font-bold text-brand-text-sec">COLLABORATOR EMAIL</label>
                        <input
                          type="email"
                          required
                          placeholder="partner@college.edu"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-text-sec/60 focus:outline-none focus:border-brand-primary transition-colors"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-brand-success hover:opacity-95 text-white text-xs font-bold cursor-pointer shadow-md shadow-brand-success/15"
                      >
                        Add Collaborator
                      </button>
                    </form>
                  )}

                  {/* Export and download local vectors */}
                  <div className="border-t border-brand-border pt-5 space-y-3.5">
                    <div>
                      <h3 className="text-xs font-mono font-extrabold text-brand-text uppercase tracking-wider">Export Coordinates</h3>
                      <p className="text-[11px] text-brand-text-sec font-medium mt-1">Backup vector graphics or download standard imaging prints.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <button
                        onClick={() => handleExportBoard('png')}
                        className="py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text hover:text-brand-primary hover:border-brand-primary/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold shadow-sm"
                      >
                        <FileDown className="w-3.5 h-3.5 text-brand-primary" />
                        PNG Image
                      </button>
                      <button
                        onClick={() => handleExportBoard('svg')}
                        className="py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text hover:text-brand-primary hover:border-brand-primary/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold shadow-sm"
                      >
                        <FileDown className="w-3.5 h-3.5 text-brand-primary" />
                        SVG Vector
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGES WORKSPACE DRAWER */}
              {activeRightDrawer === 'pages' && (
                <div className="space-y-6">
                  {/* Create New Page */}
                  {!isViewer && (
                    <form onSubmit={handleCreatePage} className="p-4 rounded-2xl bg-brand-bg/50 border border-brand-border space-y-3">
                      <h3 className="text-xs font-bold text-brand-primary uppercase font-mono tracking-wider">Initialize New Page</h3>
                      <input
                        type="text"
                        required
                        placeholder="Page Name (e.g., Wireframe layout)"
                        value={newPageName}
                        onChange={(e) => setNewPageName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-text-sec/60 focus:outline-none focus:border-brand-primary transition-colors"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 bg-brand-primary hover:opacity-90 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-brand-primary/15"
                      >
                        <FolderPlus className="w-4 h-4" />
                        Create Page
                      </button>
                    </form>
                  )}

                  {/* List of existing pages */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono font-extrabold text-brand-text-sec uppercase tracking-wider">CATALOG CHRONOLOGY</h3>
                    {pages.map((p) => {
                      const isActive = p.id === activePageId;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setActivePageId(p.id);
                            // Push page active index back to the backend meta
                            fetch(`/api/boards/${boardId}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ activePageId: p.id }),
                            }).catch(() => {});
                          }}
                          className={`p-3.5 rounded-xl border flex items-center justify-between transition-all text-xs cursor-pointer ${
                            isActive
                              ? 'bg-brand-primary/10 border-brand-primary text-brand-primary font-bold shadow-sm shadow-brand-primary/5'
                              : 'bg-brand-bg/45 border-brand-border text-brand-text-sec hover:border-brand-primary/35 hover:text-brand-text hover:bg-brand-bg-sec/50'
                          }`}
                        >
                          <span className="font-bold line-clamp-1">{p.name}</span>
                          
                          <div className="flex items-center gap-1.5">
                            {!isViewer && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicatePage(p.id, p.name);
                                }}
                                className="p-1 rounded-lg bg-brand-bg/80 border border-brand-border text-brand-text-sec hover:text-brand-text hover:border-brand-primary/20 transition-all"
                                title="Duplicate Page"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {!isViewer && pages.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePage(p.id);
                                }}
                                className="p-1 rounded-lg bg-brand-bg/80 border border-brand-border text-brand-text-sec hover:text-brand-error hover:border-brand-error/20 transition-all"
                                title="Delete Page"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      </div>

      {/* RENDER DYNAMIC TEXT EDIT MODAL OVERLAY */}
      {editingTextId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-bg/85 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl glass border border-brand-border bg-brand-bg-sec/95 text-left space-y-4 shadow-2xl relative z-55">
            <h3 className="text-xs font-mono font-extrabold text-brand-text uppercase tracking-wider">Edit Vector Text Node</h3>
            <textarea
              rows={4}
              value={textInputValue}
              onChange={(e) => setTextInputValue(e.target.value)}
              className="w-full p-3 text-sm rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-text-sec/60 focus:outline-none focus:border-brand-primary transition-all font-semibold"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setEditingTextId(null)}
                className="flex-1 py-2 text-xs font-bold rounded-xl border border-brand-border bg-brand-bg hover:bg-brand-bg-sec text-brand-text-sec transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTextEdit}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-brand-primary hover:opacity-95 text-white cursor-pointer transition-all shadow-md shadow-brand-primary/15"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR CANVAS CONFIRM OVERLAY */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-6 rounded-2xl border border-brand-border bg-brand-bg-sec text-left space-y-4 shadow-2xl relative"
          >
            <h3 className="text-xs font-mono font-extrabold text-brand-error uppercase tracking-wider flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-brand-error" />
              Wipe Drawing Layer?
            </h3>
            <p className="text-xs text-brand-text-sec leading-relaxed">
              Are you sure you want to completely wipe out all vectors and shapes on this page? This action can be undone via Ctrl+Z, but will clear current visual layers for all editors.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 text-xs font-bold rounded-xl border border-brand-border bg-brand-bg hover:bg-brand-bg-sec text-brand-text-sec transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={performClearCanvas}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-brand-error hover:opacity-95 text-white cursor-pointer transition-all shadow-md shadow-brand-error/15"
              >
                Clear Layer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* DELETE PAGE CONFIRM OVERLAY */}
      {pageToDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-6 rounded-2xl border border-brand-border bg-brand-bg-sec text-left space-y-4 shadow-2xl relative"
          >
            <h3 className="text-xs font-mono font-extrabold text-brand-error uppercase tracking-wider flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-brand-error" />
              Delete Page?
            </h3>
            <p className="text-xs text-brand-text-sec leading-relaxed">
              Are you sure you want to delete this whiteboard page and all drawing layers on it? This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPageToDeleteId(null)}
                className="flex-1 py-2 text-xs font-bold rounded-xl border border-brand-border bg-brand-bg hover:bg-brand-bg-sec text-brand-text-sec transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={performDeletePage}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-brand-error hover:opacity-95 text-white cursor-pointer transition-all shadow-md shadow-brand-error/15"
              >
                Delete Page
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* RESTORE VERSION CONFIRM OVERLAY */}
      {versionToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-6 rounded-2xl border border-brand-border bg-brand-bg-sec text-left space-y-4 shadow-2xl relative"
          >
            <h3 className="text-xs font-mono font-extrabold text-brand-primary uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-brand-primary" />
              Restore Layout?
            </h3>
            <p className="text-xs text-brand-text-sec leading-relaxed">
              Are you sure you want to restore the canvas layout to version <span className="font-bold text-brand-text">"{versionToRestore.description}"</span>? This will overwrite your current active shapes.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setVersionToRestore(null)}
                className="flex-1 py-2 text-xs font-bold rounded-xl border border-brand-border bg-brand-bg hover:bg-brand-bg-sec text-brand-text-sec transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={performRestoreVersion}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-brand-primary hover:opacity-95 text-white cursor-pointer transition-all shadow-md shadow-brand-primary/15"
              >
                Restore Version
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* TOAST NOTIFICATION FLOATING */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 left-6 z-55 flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold shadow-xl ${
              toast.type === 'success'
                ? 'bg-brand-success/15 border-brand-success/30 text-brand-success'
                : toast.type === 'error'
                ? 'bg-brand-error/15 border-brand-error/30 text-brand-error'
                : 'bg-brand-primary/15 border-brand-primary/30 text-brand-primary'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
