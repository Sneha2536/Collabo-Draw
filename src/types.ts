export type ToolType =
  | 'select'
  | 'move'
  | 'pencil'
  | 'brush'
  | 'line'
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'arrow'
  | 'triangle'
  | 'diamond'
  | 'text'
  | 'sticky'
  | 'image'
  | 'eraser'
  | 'laser'
  | 'hand';

export interface BoardObject {
  id: string;
  type:
    | 'pencil'
    | 'brush'
    | 'line'
    | 'rect'
    | 'circle'
    | 'ellipse'
    | 'arrow'
    | 'triangle'
    | 'diamond'
    | 'text'
    | 'sticky'
    | 'image'
    | 'laser';
  x: number;
  y: number;
  width: number;
  height: number;
  points?: [number, number][]; // For freehand pencil/brush
  stroke: string;
  strokeWidth: number;
  fill: string;
  opacity: number;
  dashed: boolean;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  rotation: number;
  imageUrl?: string;
  locked?: boolean;
  stickyColor?: string; // For sticky notes background
  creatorId: string;
  creatorName: string;
  lastModified: number;
}

export interface Collaborator {
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface Board {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  createdTime: number;
  lastModifiedTime: number;
  collaborators: Collaborator[];
  pages: string[]; // Page IDs
  activePageId: string;
  isFavorite?: boolean;
}

export interface BoardPage {
  id: string;
  boardId: string;
  name: string;
  objects: BoardObject[];
  order: number;
}

export interface ChatMessage {
  id: string;
  boardId: string;
  userId: string;
  userName: string;
  userColor: string;
  text: string;
  timestamp: number;
}

export interface UserPresence {
  userId: string;
  name: string;
  email: string;
  cursorX: number;
  cursorY: number;
  color: string;
  lastSeen: number;
  pageId: string;
  isTyping?: boolean;
}

export interface BoardHistory {
  timestamp: number;
  editorName: string;
  description: string;
  objectsSnapshot: BoardObject[];
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
}
