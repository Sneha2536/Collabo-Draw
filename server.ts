import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  Board,
  BoardObject,
  BoardPage,
  ChatMessage,
  UserPresence,
  BoardHistory,
  AppUser,
} from './src/types';

// Storage structure for data.json
interface DBState {
  users: AppUser[];
  boards: Board[];
  pages: Record<string, BoardPage>; // pageId -> page
  chats: Record<string, ChatMessage[]>; // boardId -> messages
  history: Record<string, BoardHistory[]>; // boardId -> versions
}

const DATA_FILE = path.join(process.cwd(), 'data.json');

// Initial state if database file does not exist
const defaultDB: DBState = {
  users: [
    {
      uid: 'demo-user-1',
      email: 'sneharajak2006@gmail.com',
      displayName: 'Sneha Rajak',
      photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha',
      bio: 'Lead Architect & Designer',
    },
    {
      uid: 'demo-user-2',
      email: 'collaborator@collabodraw.com',
      displayName: 'Alex Rivers',
      photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex',
      bio: 'Product Manager',
    },
  ],
  boards: [
    {
      id: 'demo-board',
      name: 'Hackathon Project Pitch Whiteboard',
      ownerId: 'demo-user-1',
      ownerName: 'Sneha Rajak',
      ownerEmail: 'sneharajak2006@gmail.com',
      createdTime: Date.now() - 3600000 * 2,
      lastModifiedTime: Date.now() - 600000,
      collaborators: [
        {
          userId: 'demo-user-1',
          name: 'Sneha Rajak',
          email: 'sneharajak2006@gmail.com',
          role: 'owner',
        },
        {
          userId: 'demo-user-2',
          name: 'Alex Rivers',
          email: 'collaborator@collabodraw.com',
          role: 'editor',
        },
      ],
      pages: ['demo-page-1'],
      activePageId: 'demo-page-1',
    },
  ],
  pages: {
    'demo-page-1': {
      id: 'demo-page-1',
      boardId: 'demo-board',
      name: 'Brainstorm Page 1',
      order: 1,
      objects: [
        {
          id: 'obj-1',
          type: 'rect',
          x: 200,
          y: 150,
          width: 300,
          height: 180,
          stroke: '#6366f1',
          strokeWidth: 4,
          fill: '#818cf81a',
          opacity: 1,
          dashed: false,
          rotation: 0,
          creatorId: 'demo-user-1',
          creatorName: 'Sneha Rajak',
          lastModified: Date.now(),
        },
        {
          id: 'obj-2',
          type: 'text',
          x: 230,
          y: 200,
          width: 240,
          height: 60,
          stroke: '#ffffff',
          strokeWidth: 0,
          fill: 'transparent',
          opacity: 1,
          dashed: false,
          text: 'CollaboDraw Architecture',
          fontSize: 22,
          fontFamily: 'Inter',
          bold: true,
          italic: false,
          underline: false,
          align: 'center',
          rotation: 0,
          creatorId: 'demo-user-1',
          creatorName: 'Sneha Rajak',
          lastModified: Date.now(),
        },
        {
          id: 'obj-3',
          type: 'sticky',
          x: 550,
          y: 130,
          width: 180,
          height: 180,
          stroke: '#eab308',
          strokeWidth: 1,
          fill: '#fef08a',
          opacity: 0.95,
          dashed: false,
          text: 'Add custom client-side SSE sync to allow full multi-user testing!',
          fontSize: 14,
          fontFamily: 'Inter',
          rotation: 5,
          stickyColor: '#fef08a',
          creatorId: 'demo-user-2',
          creatorName: 'Alex Rivers',
          lastModified: Date.now(),
        },
        {
          id: 'obj-4',
          type: 'arrow',
          x: 420,
          y: 350,
          width: 120,
          height: 100,
          stroke: '#10b981',
          strokeWidth: 3,
          fill: '#10b981',
          opacity: 1,
          dashed: false,
          rotation: 0,
          creatorId: 'demo-user-1',
          creatorName: 'Sneha Rajak',
          lastModified: Date.now(),
        },
      ],
    },
  },
  chats: {
    'demo-board': [
      {
        id: 'msg-1',
        boardId: 'demo-board',
        userId: 'demo-user-2',
        userName: 'Alex Rivers',
        userColor: '#10b981',
        text: 'Welcome to our collaborative session! SSE synchronization is running perfectly.',
        timestamp: Date.now() - 300000,
      },
      {
        id: 'msg-2',
        boardId: 'demo-board',
        userId: 'demo-user-1',
        userName: 'Sneha Rajak',
        userColor: '#6366f1',
        text: 'Awesome, let’s design some diagrams here!',
        timestamp: Date.now() - 150000,
      },
    ],
  },
  history: {
    'demo-board': [
      {
        timestamp: Date.now() - 3600000,
        editorName: 'Sneha Rajak',
        description: 'Initial creation & outline setup',
        objectsSnapshot: [],
      },
    ],
  },
};

// Helper: Read database from file
function readDB(): DBState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading data.json, returning default DB', err);
  }
  // Write default db if not found
  writeDB(defaultDB);
  return defaultDB;
}

// Helper: Write database to file
function writeDB(db: DBState) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing data.json', err);
  }
}

// Real-time Event Clients tracking
interface SSEClient {
  userId: string;
  res: express.Response;
}

// Map of boardId -> active SSE connections
const activeSSEConnections: Record<string, SSEClient[]> = {};

// Broadcast helper for SSE
function broadcastSSEEvent(boardId: string, eventType: string, payload: any, originUserId?: string) {
  const clients = activeSSEConnections[boardId] || [];
  clients.forEach((client) => {
    // Optionally exclude the origin user to prevent echo (e.g., for cursors)
    if (originUserId && client.userId === originUserId && eventType === 'cursor') {
      return;
    }
    try {
      client.res.write(`event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`);
    } catch (err) {
      console.error(`Error sending SSE event to user ${client.userId}`, err);
    }
  });
}

// Build Express server
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize DB state
  let db = readDB();

  // AUTH ENDPOINTS
  app.post('/api/auth/signup', (req, res) => {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Missing required signup details' });
    }

    db = readDB();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const uid = 'usr_' + Math.random().toString(36).substr(2, 9);
    const newUser: AppUser = {
      uid,
      email,
      displayName,
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`,
      bio: 'Whiteboard designer',
    };

    db.users.push(newUser);
    writeDB(db);

    res.json({ user: newUser });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    db = readDB();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'User not found. Try signing up.' });
    }

    // In this premium demo/hackathon build, we accept any password to make testing/evaluating seamless
    res.json({ user });
  });

  app.post('/api/auth/google', (req, res) => {
    const { email, displayName, photoURL } = req.body;
    if (!email || !displayName) {
      return res.status(400).json({ error: 'Missing details for Google login' });
    }

    db = readDB();
    let user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        uid: 'usr_' + Math.random().toString(36).substr(2, 9),
        email,
        displayName,
        photoURL: photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`,
        bio: 'Whiteboard Enthusiast',
      };
      db.users.push(user);
      writeDB(db);
    }

    res.json({ user });
  });

  app.post('/api/users/profile', (req, res) => {
    const { uid, displayName, bio, photoURL } = req.body;
    db = readDB();
    const userIndex = db.users.findIndex((u) => u.uid === uid);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.users[userIndex] = {
      ...db.users[userIndex],
      displayName: displayName || db.users[userIndex].displayName,
      bio: bio !== undefined ? bio : db.users[userIndex].bio,
      photoURL: photoURL || db.users[userIndex].photoURL,
    };
    writeDB(db);

    res.json({ user: db.users[userIndex] });
  });

  // BOARDS ENDPOINTS
  app.get('/api/boards', (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    db = readDB();
    // Find boards where user is owner or listed in collaborators
    const userBoards = db.boards.filter(
      (b) => b.ownerId === userId || b.collaborators.some((c) => c.userId === userId)
    );

    res.json({ boards: userBoards });
  });

  app.post('/api/boards', (req, res) => {
    const { name, ownerId, ownerName, ownerEmail } = req.body;
    if (!ownerId || !name) {
      return res.status(400).json({ error: 'Board name and ownerId are required' });
    }

    db = readDB();
    const boardId = 'board_' + Math.random().toString(36).substr(2, 9);
    const pageId = 'page_' + Math.random().toString(36).substr(2, 9);

    const newBoard: Board = {
      id: boardId,
      name,
      ownerId,
      ownerName,
      ownerEmail: ownerEmail || '',
      createdTime: Date.now(),
      lastModifiedTime: Date.now(),
      collaborators: [
        {
          userId: ownerId,
          name: ownerName,
          email: ownerEmail || '',
          role: 'owner',
        },
      ],
      pages: [pageId],
      activePageId: pageId,
    };

    const newPage: BoardPage = {
      id: pageId,
      boardId,
      name: 'Default Page 1',
      order: 1,
      objects: [],
    };

    db.boards.push(newBoard);
    db.pages[pageId] = newPage;
    db.chats[boardId] = [];
    db.history[boardId] = [
      {
        timestamp: Date.now(),
        editorName: ownerName,
        description: 'Whiteboard created',
        objectsSnapshot: [],
      },
    ];

    writeDB(db);
    res.json({ board: newBoard, page: newPage });
  });

  app.get('/api/boards/:id', (req, res) => {
    const { id } = req.params;
    db = readDB();
    const board = db.boards.find((b) => b.id === id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    res.json({ board });
  });

  app.put('/api/boards/:id', (req, res) => {
    const { id } = req.params;
    const { name, activePageId, isFavorite } = req.body;
    db = readDB();
    const boardIndex = db.boards.findIndex((b) => b.id === id);
    if (boardIndex === -1) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const original = db.boards[boardIndex];
    db.boards[boardIndex] = {
      ...original,
      name: name !== undefined ? name : original.name,
      activePageId: activePageId !== undefined ? activePageId : original.activePageId,
      isFavorite: isFavorite !== undefined ? isFavorite : original.isFavorite,
      lastModifiedTime: Date.now(),
    };

    writeDB(db);

    // Broadcast board meta changes to other editors
    broadcastSSEEvent(id, 'board:updated', db.boards[boardIndex]);

    res.json({ board: db.boards[boardIndex] });
  });

  app.delete('/api/boards/:id', (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    db = readDB();
    const boardIndex = db.boards.findIndex((b) => b.id === id);
    if (boardIndex === -1) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (db.boards[boardIndex].ownerId !== userId) {
      return res.status(403).json({ error: 'Only the board owner can delete this board' });
    }

    // Clean up pages and chats related to this board
    const pageIds = db.boards[boardIndex].pages;
    pageIds.forEach((pId) => {
      delete db.pages[pId];
    });
    delete db.chats[id];
    delete db.history[id];

    // Remove board
    db.boards.splice(boardIndex, 1);
    writeDB(db);

    broadcastSSEEvent(id, 'board:deleted', { boardId: id });

    res.json({ success: true });
  });

  // COLLABORATORS
  app.post('/api/boards/:id/collaborators', (req, res) => {
    const { id } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Collaborator email is required' });
    }

    db = readDB();
    const boardIndex = db.boards.findIndex((b) => b.id === id);
    if (boardIndex === -1) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Find if user exists with this email
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: `No user found with email "${email}"` });
    }

    const board = db.boards[boardIndex];
    const exists = board.collaborators.find((c) => c.userId === user.uid);
    if (exists) {
      return res.status(400).json({ error: 'This user is already a collaborator' });
    }

    const newCollab = {
      userId: user.uid,
      name: user.displayName,
      email: user.email,
      role: role || 'editor',
    };

    board.collaborators.push(newCollab);
    board.lastModifiedTime = Date.now();
    writeDB(db);

    broadcastSSEEvent(id, 'board:updated', board);

    res.json({ success: true, collaborator: newCollab });
  });

  // PAGES
  app.get('/api/boards/:id/pages', (req, res) => {
    const { id } = req.params;
    db = readDB();
    const board = db.boards.find((b) => b.id === id);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const boardPages = board.pages.map((pId) => db.pages[pId]).filter(Boolean);
    res.json({ pages: boardPages });
  });

  app.post('/api/boards/:id/pages', (req, res) => {
    const { id } = req.params;
    const { name, copyFromPageId } = req.body;

    db = readDB();
    const boardIndex = db.boards.findIndex((b) => b.id === id);
    if (boardIndex === -1) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const board = db.boards[boardIndex];
    const newPageId = 'page_' + Math.random().toString(36).substr(2, 9);
    
    let clonedObjects: BoardObject[] = [];
    if (copyFromPageId && db.pages[copyFromPageId]) {
      // Duplicate objects
      clonedObjects = db.pages[copyFromPageId].objects.map((obj) => ({
        ...obj,
        id: 'obj_' + Math.random().toString(36).substr(2, 9),
        lastModified: Date.now(),
      }));
    }

    const newPage: BoardPage = {
      id: newPageId,
      boardId: id,
      name: name || `Page ${board.pages.length + 1}`,
      order: board.pages.length + 1,
      objects: clonedObjects,
    };

    db.pages[newPageId] = newPage;
    board.pages.push(newPageId);
    board.activePageId = newPageId;
    board.lastModifiedTime = Date.now();
    
    writeDB(db);

    broadcastSSEEvent(id, 'page:created', { page: newPage, activePageId: newPageId });

    res.json({ page: newPage, board });
  });

  app.put('/api/boards/:id/pages/:pageId', (req, res) => {
    const { id, pageId } = req.params;
    const { objects, name } = req.body;

    db = readDB();
    if (!db.pages[pageId]) {
      return res.status(404).json({ error: 'Page not found' });
    }

    if (objects !== undefined) {
      db.pages[pageId].objects = objects;
    }
    if (name !== undefined) {
      db.pages[pageId].name = name;
    }

    const board = db.boards.find((b) => b.id === id);
    if (board) {
      board.lastModifiedTime = Date.now();
    }

    writeDB(db);

    // Broadcast objects sync
    broadcastSSEEvent(id, 'canvas:updated', { pageId, objects: db.pages[pageId].objects, name: db.pages[pageId].name });

    res.json({ page: db.pages[pageId] });
  });

  app.delete('/api/boards/:id/pages/:pageId', (req, res) => {
    const { id, pageId } = req.params;

    db = readDB();
    const boardIndex = db.boards.findIndex((b) => b.id === id);
    if (boardIndex === -1) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const board = db.boards[boardIndex];
    if (board.pages.length <= 1) {
      return res.status(400).json({ error: 'Cannot delete the only page of a whiteboard' });
    }

    const pageIndex = board.pages.indexOf(pageId);
    if (pageIndex === -1) {
      return res.status(404).json({ error: 'Page not found in this board' });
    }

    // Remove page index
    board.pages.splice(pageIndex, 1);
    delete db.pages[pageId];

    // Reset active page if necessary
    if (board.activePageId === pageId) {
      board.activePageId = board.pages[0];
    }
    board.lastModifiedTime = Date.now();

    writeDB(db);

    broadcastSSEEvent(id, 'page:deleted', { pageId, activePageId: board.activePageId });

    res.json({ success: true, activePageId: board.activePageId });
  });

  // REAL TIME CURSORS & CHAT & PRESENCE SSE ROUTE
  app.get('/api/boards/:id/live', (req, res) => {
    const { id: boardId } = req.params;
    const { userId, name, email } = req.query;

    if (!userId || !name) {
      return res.status(400).json({ error: 'userId and name parameters are required' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Content-Encoding', 'none');
    res.flushHeaders();

    const client: SSEClient = {
      userId: userId as string,
      res,
    };

    // Store connection
    if (!activeSSEConnections[boardId]) {
      activeSSEConnections[boardId] = [];
    }
    activeSSEConnections[boardId].push(client);

    // Initial message to verify connection
    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'ok', userId })}\n\n`);

    const userColorPalette = [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
      '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'
    ];
    // Assign a deterministic color based on userId hash
    const hash = Array.from(userId as string).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const assignedColor = userColorPalette[hash % userColorPalette.length];

    const initialPresence: UserPresence = {
      userId: userId as string,
      name: name as string,
      email: (email as string) || '',
      cursorX: 0,
      cursorY: 0,
      color: assignedColor,
      lastSeen: Date.now(),
      pageId: '',
    };

    // Broadcast new user presence
    broadcastSSEEvent(boardId, 'presence:joined', initialPresence);

    // Send active list of other connected users
    const otherPresences = (activeSSEConnections[boardId] || [])
      .filter((c) => c.userId !== userId)
      .map((c) => {
        const otherHash = Array.from(c.userId).reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        return {
          userId: c.userId,
          name: 'Active Collaborator', // Placeholder, clients will report theirs
          color: userColorPalette[otherHash % userColorPalette.length],
        };
      });
    res.write(`event: presence:init\ndata: ${JSON.stringify(otherPresences)}\n\n`);

    // Keep SSE connection alive
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch (e) {
        clearInterval(heartbeatInterval);
      }
    }, 15000);

    // Clean up on disconnect
    req.on('close', () => {
      clearInterval(heartbeatInterval);
      const index = activeSSEConnections[boardId]?.indexOf(client);
      if (index !== -1 && index !== undefined) {
        activeSSEConnections[boardId].splice(index, 1);
      }
      broadcastSSEEvent(boardId, 'presence:left', { userId });
    });
  });

  // CURSOR UPDATE ENDPOINT (Triggered as user moves cursor; broadcasts memory-only to save disk)
  app.post('/api/boards/:id/cursor', (req, res) => {
    const { id: boardId } = req.params;
    const { userId, name, email, cursorX, cursorY, pageId, isTyping } = req.body;

    const userColorPalette = [
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
      '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'
    ];
    const hash = Array.from((userId as string) || '').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const color = userColorPalette[hash % userColorPalette.length];

    const presence: any = {
      ...req.body,
      color,
      lastSeen: Date.now(),
      email: email || '',
      cursorX: cursorX || 0,
      cursorY: cursorY || 0,
      pageId: pageId || '',
      isTyping: !!isTyping,
    };

    // Broadcast cursor positions to other editors (excluding sender)
    broadcastSSEEvent(boardId, 'cursor', presence, userId);
    res.sendStatus(204);
  });

  // EXPLICIT LEAVE ENDPOINT
  app.post('/api/boards/:id/leave', (req, res) => {
    const { id: boardId } = req.params;
    const { userId } = req.body;
    
    // Remove from active SSE connections if found
    if (activeSSEConnections[boardId]) {
      const idx = activeSSEConnections[boardId].findIndex(c => c.userId === userId);
      if (idx !== -1) {
        try {
          activeSSEConnections[boardId][idx].res.end();
        } catch (e) {}
        activeSSEConnections[boardId].splice(idx, 1);
      }
    }
    
    broadcastSSEEvent(boardId, 'presence:left', { userId });
    res.sendStatus(200);
  });

  // CHAT ENDPOINTS
  app.get('/api/boards/:id/chats', (req, res) => {
    const { id } = req.params;
    db = readDB();
    const chats = db.chats[id] || [];
    res.json({ chats });
  });

  app.post('/api/boards/:id/chats', (req, res) => {
    const { id } = req.params;
    const { userId, userName, userColor, text } = req.body;

    if (!text || !userId) {
      return res.status(400).json({ error: 'userId and text are required' });
    }

    db = readDB();
    if (!db.chats[id]) {
      db.chats[id] = [];
    }

    const newMessage: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      boardId: id,
      userId,
      userName,
      userColor: userColor || '#6366f1',
      text,
      timestamp: Date.now(),
    };

    db.chats[id].push(newMessage);
    writeDB(db);

    broadcastSSEEvent(id, 'chat:message', newMessage);

    res.json({ message: newMessage });
  });

  // HISTORY & VERSIONING
  app.get('/api/boards/:id/history', (req, res) => {
    const { id } = req.params;
    db = readDB();
    const history = db.history[id] || [];
    res.json({ history });
  });

  app.post('/api/boards/:id/history', (req, res) => {
    const { id } = req.params;
    const { editorName, description, objectsSnapshot } = req.body;

    if (!editorName || !description || !objectsSnapshot) {
      return res.status(400).json({ error: 'Missing history details' });
    }

    db = readDB();
    if (!db.history[id]) {
      db.history[id] = [];
    }

    const newVersion: BoardHistory = {
      timestamp: Date.now(),
      editorName,
      description,
      objectsSnapshot,
    };

    db.history[id].push(newVersion);
    writeDB(db);

    broadcastSSEEvent(id, 'history:created', newVersion);

    res.json({ version: newVersion });
  });

  app.post('/api/boards/:id/history/restore', (req, res) => {
    const { id } = req.params;
    const { timestamp, pageId } = req.body;

    db = readDB();
    const boardHistory = db.history[id] || [];
    const targetVersion = boardHistory.find((v) => v.timestamp === timestamp);
    
    if (!targetVersion) {
      return res.status(404).json({ error: 'History version not found' });
    }

    if (!db.pages[pageId]) {
      return res.status(404).json({ error: 'Active page not found' });
    }

    // Restore page objects
    db.pages[pageId].objects = targetVersion.objectsSnapshot;
    
    const board = db.boards.find((b) => b.id === id);
    if (board) {
      board.lastModifiedTime = Date.now();
    }

    writeDB(db);

    broadcastSSEEvent(id, 'canvas:updated', { pageId, objects: targetVersion.objectsSnapshot, name: db.pages[pageId].name });

    res.json({ page: db.pages[pageId] });
  });

  // IMAGE UPLOADING SIMULATOR (Base64 storage in objects schema)
  // In a traditional hosting setup this would upload to Firebase Storage or S3.
  // Storing as Base64 makes it 100% cloud-functional out of the box with zero credentials!
  app.post('/api/upload', (req, res) => {
    const { filename, base64 } = req.body;
    if (!base64) {
      return res.status(400).json({ error: 'No image data received' });
    }
    // We can directly send back the base64 URI as our cloud path so it renders beautifully anywhere!
    res.json({ url: base64 });
  });

  // Mount Vite middleware for asset resolution and Hot Module Replacement simulation in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CollaboDraw server running on http://localhost:${PORT}`);
  });
}

startServer();
