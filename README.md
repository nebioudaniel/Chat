# Chat

A real-time messaging app with 5-digit user IDs, direct messages, group chats, online presence, and a clean shadcn-style UI.

**Live:** https://chat-61e3.pages.dev

---

## Table of Contents

- [What It Does](#what-it-does)
- [Tech Stack](#tech-stack)
- [Why SolidJS](#why-solidjs)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
  - [Authentication](#authentication)
  - [Messaging](#messaging)
  - [Real-Time Delivery](#real-time-delivery)
  - [Online Presence](#online-presence)
  - [Inbox and Conversations](#inbox-and-conversations)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Deployment](#deployment)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)

---

## What It Does

- Register with any username, get a random 5-digit ID
- Share your ID with someone so they can find and message you
- Direct messages between any two users
- Group chats with multiple members
- Online/offline status indicators (green dot)
- Inbox showing recent conversations with last message preview
- Message grouping (consecutive messages from same sender are grouped together)
- Date separators ("Today", "Yesterday", etc.)
- Change your 5-digit ID anytime
- Messages persist in MongoDB
- Real-time delivery via Socket.IO

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | SolidJS | Fine-grained reactivity, no virtual DOM, fast updates for chat UIs |
| Routing | solid-router | Simple file-based routing for SolidJS |
| Styling | Tailwind CSS v4 | Utility-first CSS, fast to build UIs |
| Build tool | Vite | Fast dev server and production builds |
| Backend | Node.js + Express | Simple, well-known, fast to build APIs |
| Real-time | Socket.IO | Reliable WebSocket abstraction with fallbacks |
| Database | MongoDB + Mongoose | Document store fits chat naturally (messages are self-contained) |
| Auth | bcrypt + JWT | Stateless auth, no session storage needed |
| Frontend deploy | Cloudflare Pages | Free global CDN, instant deploys from GitHub |
| Backend deploy | Railway | Easy Docker deployment, free tier |
| Database host | MongoDB Atlas | Free managed MongoDB |

---

## Why SolidJS

SolidJS is a JavaScript framework for building UIs. It looks like React but works fundamentally differently.

**React uses a virtual DOM.** When state changes, React re-renders the entire component tree into a virtual DOM, diffs it against the previous virtual DOM, and patches only the differences into the real DOM. This is O(n) where n is the number of components.

**SolidJS uses signals.** When state changes, SolidJS updates only the specific DOM nodes tied to that signal. No re-rendering, no diffing, no virtual DOM. This is O(1) per update.

**Why this matters for a chat app:**
- A chat UI has a long list of messages that updates frequently (new messages arriving every second)
- With React, every new message triggers a re-render of the entire message list, then a diff pass to find what changed
- With SolidJS, every new message appends one DOM node directly — no re-render of existing messages
- The difference is noticeable at scale: 100+ messages in a conversation, multiple tabs open, typing indicators updating constantly

SolidJS also has a simpler mental model for this kind of app:
- `createSignal` creates a reactive value
- Reading the signal in JSX creates a subscription — the DOM updates automatically when the value changes
- `createEffect` runs side effects when signals change (e.g., scroll to bottom when new messages arrive)
- No `useState`, no `useEffect`, no dependency arrays, no stale closure bugs

The tradeoff: SolidJS has a smaller ecosystem than React. For a chat app this doesn't matter — we need sockets, forms, and lists, not 50 UI libraries.

---

## Project Structure

```
my-solid-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── index.js            # Environment variables with defaults
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification middleware
│   │   │   ├── rateLimit.js         # Per-user rate limiter (30 req/min)
│   │   │   └── validate.js          # Request body validation
│   │   ├── models/
│   │   │   ├── User.js              # User schema (username, userId, passwordHash, groups, dmPartners)
│   │   │   ├── Message.js           # Message schema (threadId, sender, senderName, content, timestamp)
│   │   │   └── Group.js             # Group schema (groupId, name, members)
│   │   ├── routes/
│   │   │   ├── auth.js              # POST /register, POST /login, GET /me, PATCH /userid
│   │   │   ├── users.js             # GET /user/:userId (lookup by 5-digit ID)
│   │   │   ├── groups.js            # POST /groups, GET /groups
│   │   │   ├── messages.js          # GET /messages/:threadId
│   │   │   └── conversations.js     # GET /conversations (inbox list)
│   │   ├── sockets/
│   │   │   └── index.js             # Socket.IO setup, JWT auth, event handlers, presence
│   │   └── index.js                 # Express app + server + MongoDB connection
│   ├── Dockerfile                   # Multi-stage Docker build
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatComponents.jsx   # Avatar, MessageBubble, DateSeparator, ReadMarker
│   │   │   └── Sidebar.jsx          # Navigation sidebar with conversations + groups
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # User state, login/register/logout, token management
│   │   │   └── SocketContext.jsx     # Socket.IO singleton, connect/disconnect, presence
│   │   ├── lib/
│   │   │   └── api.js               # Fetch wrapper with automatic JWT headers
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Marketing page at /
│   │   │   ├── LearnPage.jsx         # /learn page with app docs
│   │   │   ├── AuthPage.jsx          # Login/register form at /auth
│   │   │   ├── HomePage.jsx          # Inbox at /home (conversation list)
│   │   │   ├── ContactsPage.jsx      # Find people by 5-digit ID
│   │   │   ├── DMView.jsx           # Direct message chat view
│   │   │   ├── GroupView.jsx         # Group chat view
│   │   │   └── CreateGroupPage.jsx   # Create a new group
│   │   ├── App.jsx                   # Router + auth protection
│   │   ├── index.jsx                 # Entry point
│   │   └── index.css                 # Tailwind CSS + base styles
│   ├── Dockerfile                    # Multi-stage build (Node → nginx)
│   ├── nginx.conf                    # SPA routing + asset caching
│   ├── wrangler.toml                 # Cloudflare Pages config
│   ├── vite.config.js                # Vite + SolidJS + Tailwind
│   ├── package.json
│   └── .env.example
├── docker-compose.yml                # Development (frontend + backend + mongo)
├── docker-compose.prod.yml           # Production (backend + mongo only)
├── .env.example
├── .gitignore
└── README.md
```

---

## How It Works

### Authentication

The auth system uses **bcrypt** for password hashing and **JWT** (JSON Web Tokens) for session management.

**Registration flow:**
1. User submits username + password
2. Backend hashes password with bcrypt (12 salt rounds)
3. Backend generates a random 5-digit ID (10000–99999)
4. User document saved to MongoDB
5. Backend signs a JWT containing `{ id: <MongoDB _id> }`
6. JWT returned to frontend, stored in `localStorage`

**Login flow:**
1. User submits username + password
2. Backend finds user by username, compares password with bcrypt
3. If match, signs JWT and returns it

**How auth is sent:**
- **REST API calls**: `Authorization: Bearer <token>` header on every request
- **Socket.IO**: Token passed in handshake: `io(url, { auth: { token } })`. Server verifies JWT before allowing the socket connection.

**The JWT is valid for 7 days.** The server verifies it on every REST request and on every socket connection. No database lookup is needed for verification — the token is self-contained.

### Messaging

When you send a message, here's what happens:

1. **Frontend** calls `socket.emit("send-message", { threadId, content, type, groupId })`
2. **Backend socket handler** receives the event
3. Backend verifies the sender exists and checks rate limit (30 messages/min)
4. Backend creates a Message document in MongoDB with:
   - `threadId`: either `userA_id:userB_id` (DM) or `group:groupId` (group)
   - `sender`: the sender's MongoDB `_id`
   - `senderName`: the sender's username
   - `content`: the message text
   - `timestamp`: auto-set to current time
5. Backend emits `receive-message` to the appropriate Socket.IO rooms
6. **Both sender and receiver** receive the event and append the message to their UI

**Why DB-first?** The message is written to MongoDB before being broadcast. If the socket broadcast fails, the message still exists in the database and will appear on next load. If the DB write fails, no socket event fires — no phantom messages.

### Real-Time Delivery

Socket.IO manages the real-time layer. Here's how messages reach the right people:

**Socket.IO rooms** are how the server targets who gets a message:
- Each user joins a room called `user:<their_mongo_id>` on connect
- For DMs: the server splits the threadId on `:` and emits to both `user:<id1>` and `user:<id2>` rooms
- For groups: all members join a room called `group:<groupId>` and the server emits to that room

**On the frontend:**
- `SocketContext` creates one socket connection after login
- `DMView` and `GroupView` register a `receive-message` listener via `createEffect`
- When a message arrives, the handler checks if the `threadId` matches the current chat
- If it matches, the message is appended to the messages signal
- Deduplication: if a message with the same `_id` already exists, it's skipped

**Why `createEffect` instead of `onMount`?**
The socket connects asynchronously (dynamic import of socket.io-client). If we registered the listener in `onMount`, the socket might not be ready yet and the listener would never be attached. `createEffect` reactively watches `socket.socket()` and re-registers the listener when the socket becomes available.

### Online Presence

The server tracks which users are connected:

- `onlineDbIds`: a `Set` of MongoDB `_id` values of connected users
- On connect: the user's `_id` is added to the set, and `presence` event is broadcast to all clients
- On disconnect: if the user has no other connections, their `_id` is removed and `presence` is broadcast again
- The frontend stores `onlineUsers` as a `Set` in `SocketContext`
- Green dots appear next to online users in the inbox, sidebar, and chat header

Multiple sockets from the same user are handled: the user is only marked offline when ALL their sockets disconnect.

### Inbox and Conversations

The inbox (`/home`) shows your recent DM conversations:

1. Frontend calls `GET /api/conversations`
2. Backend reads the current user's `dmPartners` array (list of users they've DM'd)
3. For each partner, backend queries the Message collection for the last message in that conversation
4. Returns an array sorted by most recent message
5. Each entry contains: partner user info, last message content, last message timestamp, last message sender

The `dmPartners` array is automatically updated when a DM message is sent — the server adds each participant to the other's `dmPartners` using MongoDB's `$addToSet` operator.

---

## API Endpoints

All authenticated endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check (no auth) |
| POST | `/api/auth/register` | Create account. Body: `{ username, password }` |
| POST | `/api/auth/login` | Sign in. Body: `{ username, password }` |
| GET | `/api/auth/me` | Get current user info |
| PATCH | `/api/auth/userid` | Generate new 5-digit ID |
| GET | `/api/user/:userId` | Look up user by 5-digit ID |
| POST | `/api/groups` | Create group. Body: `{ name, memberIds }` |
| GET | `/api/groups` | List user's groups |
| GET | `/api/messages/:threadId` | Get messages for a thread |
| GET | `/api/conversations` | Get inbox (DM partners + last message) |

**Socket.IO events:**

| Event | Direction | Payload |
|---|---|---|
| `send-message` | Client → Server | `{ threadId, content, type, groupId }` |
| `receive-message` | Server → Client | `{ threadId, message }` |
| `join-group` | Client → Server | `{ groupId }` |
| `presence` | Server → Client | `{ online: [userId, ...] }` |

---

## Database Models

### User

```js
{
  username: String,        // unique, required
  userId: String,          // 5-digit number (10000-99999), unique, required
  passwordHash: String,    // bcrypt hash, never returned to client
  groups: [String],        // array of groupIds this user belongs to
  dmPartners: [ObjectId],  // array of User _ids this user has DM'd with
}
```

### Message

```js
{
  threadId: String,        // "mongoId1:mongoId2" for DMs, "group:groupId" for groups
  sender: String,          // MongoDB _id of sender (not the 5-digit ID)
  senderName: String,      // username of sender (denormalized for display)
  content: String,         // message text
  timestamp: Date,         // auto-set to Date.now
}
```

### Group

```js
{
  groupId: String,         // random 5-digit number
  name: String,            // group name
  members: [ObjectId],     // array of User _id references
}
```

**Why is `threadId` a string and not a reference?**
It's a composite key that works for both DMs and groups. For DMs, it's `sorted(userId1, userId2).join(":")`. For groups, it's `group:groupId`. This makes querying simple: `Message.find({ threadId })` gets all messages for any conversation.

**Why store `sender` as a string (_id) instead of a reference?**
Storing the `_id` as a string avoids a MongoDB lookup when reading messages. The sender's username is denormalized into `senderName` for the same reason — no join needed to display who sent a message.

---

## Frontend Architecture

### Routing

The app uses `solid-router` v0.15. Routes are defined in `App.jsx`:

```
/                → LandingPage (logged out) or redirect to /home (logged in)
/learn           → LearnPage (app documentation)
/auth            → AuthPage (login/register, redirects to /home if logged in)
/home            → HomePage (inbox, requires login)
/contacts        → ContactsPage (find people, requires login)
/dm/:userId      → DMView (direct message chat, requires login)
/group/:groupId  → GroupView (group chat, requires login)
/create-group    → CreateGroupPage (requires login)
```

**Protected routes** use a `ProtectedLayout` wrapper that checks `auth.user()`. If not logged in, it redirects to `/auth`. If still loading, it shows a spinner.

### State Management

There are three global stores, all using SolidJS context:

**AuthContext** (`context/AuthContext.jsx`):
- `user()`: reactive signal with `{ _id, userId, username, groups }` or `null`
- `login()`, `register()`, `logout()`: auth operations
- `updateUser()`: partial update (used when changing 5-digit ID)
- Token stored in `localStorage`

**SocketContext** (`context/SocketContext.jsx`):
- `socket()`: the Socket.IO client instance or `null`
- `onlineUsers()`: Set of user `_id` strings who are currently online
- `emit()`, `on()`, `disconnect()`: socket operations
- Socket connects automatically when user logs in, disconnects on logout
- Socket.io-client is lazy-loaded via dynamic import to avoid blocking initial page load

**Page-level signals:**
- Each page manages its own state with `createSignal`
- DMView and GroupView hold `messages` signal, `inputVal` signal, etc.
- No global message store — each chat page loads and manages its own messages

### Chat UI Components

Located in `components/ChatComponents.jsx`:

**Avatar**: Circular avatar with user's initial letter. Optional green online dot.

**MessageBubble**: The core chat bubble. Handles:
- Mine vs theirs styling (dark bg for mine, white for theirs)
- Sender name display (only for first message in a group)
- Corner radius variants (`rounded-br-sm` for mine, `rounded-bl-sm` for theirs)
- Continuation messages (same sender within 60s) get tighter spacing and no repeated avatar

**DateSeparator**: Horizontal line with centered date text ("Today", "Yesterday", or formatted date).

**ReadMarker**: Blue checkmark + "Read" text (used for future read receipts).

### Message Grouping

Messages from the same sender within 60 seconds of each other are "grouped":
- No avatar repeated (spacer instead)
- No sender name repeated
- Tighter vertical spacing (`mt-0.5` instead of `mt-3`)
- Different corner radius on the bubble (connects to previous message)

This is the same pattern used by iMessage, WhatsApp, and Telegram.

---

## Backend Architecture

### Request Flow

```
Client → Express Middleware → Route Handler → MongoDB
                ↓
         Socket.IO → MongoDB → Broadcast to rooms
```

### Middleware Stack

1. **CORS**: Allows requests from the frontend origin
2. **JSON parser**: Parses request bodies
3. **Auth middleware**: Verifies JWT on protected routes, attaches `req.user`
4. **Rate limiter**: 30 messages/min per user (in-memory counter)

### Socket.IO Setup

1. **JWT middleware**: Verifies token from `socket.handshake.auth.token`, attaches `socket.dbId`
2. **On connect**: 
   - Adds user to `onlineDbIds` set
   - Joins `user:<dbId>` room
   - Loads user's groups from MongoDB, joins each `group:<groupId>` room
   - Broadcasts presence to all clients
3. **On `send-message`**:
   - Rate limit check
   - Creates Message document in MongoDB
   - For DMs: emits to both users' rooms
   - For groups: emits to group room
   - Updates `dmPartners` arrays for DM participants
4. **On disconnect**:
   - Removes socket from tracking
   - If user has no other sockets, removes from `onlineDbIds` and broadcasts presence

### Rate Limiting

In-memory per-user rate limiter:
- 30 messages per minute window
- Counter resets after the window expires
- Returns 429 error if exceeded
- Resets on server restart (for production, use Redis-backed limiting)

---

## Deployment

### Architecture

```
                    Cloudflare Pages (CDN)
                    Serves static frontend
                           │
                           │ HTTPS
                           ▼
                    Railway (Docker)
                    Runs Node.js backend
                           │
                           │ MongoDB protocol
                           ▼
                    MongoDB Atlas
                    Stores all data
```

**Why split frontend and backend?**
Cloudflare Pages serves static files only — it cannot run a persistent Node.js server with Socket.IO or maintain a MongoDB connection. The backend runs separately on a host that supports long-running processes.

### Frontend (Cloudflare Pages)

1. Push to GitHub
2. Cloudflare Pages auto-builds from `frontend/` directory
3. Build command: `cd frontend && npm install && npm run build`
4. Output: `frontend/dist/`
5. The production build has the backend URL hardcoded in `api.js`

### Backend (Railway)

1. Push to GitHub
2. Railway detects `backend/Dockerfile`
3. Environment variables set in Railway dashboard
4. Docker builds multi-stage image: `node:20-alpine` → installs deps → runs `node src/index.js`
5. Railway generates a public URL for the backend

### MongoDB Atlas

1. Free M0 cluster on MongoDB Atlas
2. Database user with password
3. Network access allowed from anywhere (0.0.0.0/0)
4. Connection string set as `MONGO_URI` in Railway

---

## Local Development

### With Docker (recommended)

```bash
git clone https://github.com/nebioudaniel/Chat.git
cd Chat
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- MongoDB: localhost:27017

### Without Docker

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend defaults to `http://localhost:3001` as the backend URL. Change `VITE_API_URL` in `.env` if your backend runs elsewhere.

---

## Environment Variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `MONGO_URI` | `mongodb://localhost:27017/chatapp` | MongoDB connection string |
| `JWT_SECRET` | `dev-secret-change-in-production` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | `7d` | JWT expiration |
| `PORT` | `3001` | Server port |
| `FRONTEND_URL` | `*` | Allowed CORS origin |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3001` | Backend URL (baked into build at compile time) |

---

## Key Technical Decisions

| Decision | Reasoning |
|---|---|
| **JWT over sessions** | Stateless — no DB lookup on every request. Token encodes user identity, verified with a secret. |
| **bcrypt (12 rounds)** | Industry standard for password hashing. Salt is built in. Hash never returned to client. |
| **DB-first message writes** | Messages are persisted before broadcasting. If socket fails, message still exists. |
| **MongoDB _id as internal identifier** | Stable across 5-digit ID changes. All internal references (messages, rooms, dmPartners) use _id. |
| **5-digit userId as public handle** | Short, easy to share, changeable. Purely a lookup mechanism. |
| **Single socket connection** | One Socket.IO connection per user, shared across all pages via context. |
| **SolidJS signals for chat state** | O(1) DOM updates when new messages arrive. No virtual DOM diffing on long message lists. |
| **In-memory rate limiting** | Simple, no external dependencies. Resets on restart. Adequate for small scale. |
| **Static frontend on CDN** | Free, fast, globally distributed. Backend URL hardcoded at build time. |
| **Docker for backend** | Consistent environment. Multi-stage build keeps image small (~50MB). |

---

## Credits

- **UI**: Built with [Opencode](https://opencode.ai)
- **Backend**: Built by Nebiou Daniel
- **Design reference**: [shadcn/ui](https://ui.shadcn.com)
