# CollaboDraw 🚀

### *Real-Time Collaborative Whiteboard for Teams, Students and Professionals*

CollaboDraw is an extremely beautiful, high-performance, responsive collaborative whiteboard system built for college hackathons and agile product brainstorming. 

Featuring a premium **glassmorphic design language**, CollaboDraw allows multiple authenticated editors to work on an infinite canvas with zero-latency drawing synchronization, live cursor coordinates, integrated sidebar chat, and detailed version chronology snapshots.

---

## 🎨 Visual Identity & Key Features

*   **Dynamic SVG Infinite Stage**: Draw pencil shapes, brushes, vectors (lines, rectangles, circles), double-clickable text nodes, yellow sticky notes, and upload local images. Smoothly zoom (`45% - 300%`) and pan (holding Spacebar or Hand tool).
*   **Real-Time Collaboration Backbone**: Powered by standard native **Server-Sent Events (SSE)**, broadcasting cursors, text inputs, shape additions, chat logs, and presence join/leave events globally under 40ms.
*   **Version chronology & auto-saves**: Save vector snapshots with custom descriptions and restore any page to a previous layout in 1 click.
*   **Structured Pages Catalog**: Supports multiple whiteboards and multiple pages per board. Create, duplicate, rename, or delete canvas pages dynamically.
*   **Team Chat Workspace**: Share instant text messages with unique user color codes, unread notification bubbles, and active typing indicators.
*   **Local Exports**: Instantly download your canvas layout as a high-resolution **PNG print**, standard **SVG vector**, or raw **JSON schema configuration**.

---

## 🛠️ Architecture & Tech Stack

```
[ Draw Client ] ======= ( HTTP Delta PUTs ) ======> [ Express Backend Router ]
      ▲                                                    │
      └─────── ( SSE Continuous Broadcasts ) ──────────────┘
```

*   **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, React Router, Context Session, CSS Transitions, Motion animations.
*   **Backend**: Node.js, Express.js.
*   **Realtime**: Server-Sent Events (SSE) heartbeat & broadcast streams.
*   **Storage**: Container-persisted local `data.json` database.

---

## 🗂️ Folder Structure

```
├── data.json                   # Local persistent JSON database schema
├── package.json                # Project dependencies and startup scripts
├── server.ts                   # Express backend + SSE live channel broadcaster
├── src/
│   ├── App.tsx                 # Client routing and Context providers injection
│   ├── main.tsx                # Client root mounter
│   ├── index.css               # Core Tailwind configuration & visual theme tokens
│   ├── types.ts                # Strict TypeScript model schemas
│   ├── context/
│   │   ├── AuthContext.tsx     # Credentials & active session Context
│   │   └── ThemeContext.tsx    # Light/Dark interface switcher Context
│   └── pages/
│       ├── Landing.tsx         # Stunning product showcase homepage
│       ├── Login.tsx           # Credentials sign-in view
│       ├── Signup.tsx          # Account registration view
│       ├── ForgotPassword.tsx  # Password recovery simulation view
│       ├── Dashboard.tsx       # Metrics, settings, and board directory manager
│       ├── Workspace.tsx       # Infinite collaborative drawing board stage
│       └── NotFound.tsx        # Styled 404 page
```

---

## 🚀 Installation & Local Launch

### 1. Install Workspace Dependencies
Ensure Node.js is installed locally, then run:
```bash
npm install
```

### 2. Configure Environment Secrets (`.env`)
Create a `.env` file in the root based on `.env.example`:
```env
GEMINI_API_KEY="your_api_key_here"
APP_URL="http://localhost:3000"
```

### 3. Start Development Server
This boots the Express backend on port `3000` alongside Vite:
```bash
npm run dev
```

### 4. Build for Production
Compiles the client-side bundle and bundles the backend server into a single `dist/server.cjs` via `esbuild`:
```bash
npm run build
npm start
```

---

## ✨ Future Scope
*   **Smart AI Co-Pilot**: Integrate Google Gemini API (`@google/genai`) directly on the backend to automatically summarize sticky notes, suggest UI wireframe flows, or autocomplete diagrams.
*   **Relational PostgreSQL Scaling**: Seamlessly plug in a persistent Cloud SQL or PostgreSQL database to handle enterprise security scopes.
*   **Physical Sound FX Synthesizers**: Add tactile audio feedback when shapes snap-to-grid, notes are added, or collaborators connect.
