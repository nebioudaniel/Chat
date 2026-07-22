# Chat App

Real-time chat application with 5-digit user IDs, direct messages, groups, and Socket.IO messaging.

## Architecture

```
frontend/          SolidJS + Vite + solid-router (static SPA)
backend/           Node.js + Express + Socket.IO + MongoDB
```

- **Frontend** runs as a static site (Cloudflare Pages or nginx in Docker)
- **Backend** runs as a Node.js process with a MongoDB database
- **MongoDB** stores users, groups, and messages

## Local Development

### Prerequisites

- Docker and Docker Compose

### Quick Start

```bash
# Clone and start everything
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- MongoDB: localhost:27017

### Without Docker

**Backend:**

```bash
cd backend
cp .env.example .env  # edit as needed
npm install
npm run dev
```

**Frontend:**

```bash
cd frontend
cp .env.example .env  # edit VITE_API_URL if backend is not on localhost:3001
npm install
npm run dev
```

## Authentication

### How It Works

1. **Register**: `POST /api/auth/register` with `{ username, password }` — password is hashed with bcrypt (12 rounds). Returns a JWT token.
2. **Login**: `POST /api/auth/login` with `{ username, password }` — verifies bcrypt hash, returns a JWT token.
3. **REST requests**: Include `Authorization: Bearer <token>` header on all authenticated endpoints.
4. **Socket.IO**: Pass the token in the auth handshake: `io(url, { auth: { token } })`. The server verifies the JWT in a middleware before allowing the socket connection.

The JWT encodes `{ id: <mongo ObjectId>, userId: <5-digit ID> }` and expires after 7 days (configurable via `JWT_EXPIRES_IN`).

## Message Send Flow

The message flow guarantees persistence before delivery:

```
Client                    Backend                     MongoDB        Rooms
  |                          |                           |             |
  |-- POST /api/messages --> |                           |             |
  |                          |-- create message doc ---> |             |
  |                          |<--- confirm write ------- |             |
  |<-- 201 Created --------- |                           |             |
  |                          |                           |             |
  |-- socket send-message -> |                           |             |
  |   (or server-side emit   |                           |             |
  |    after REST write)     |                           |             |
  |                          |-- emit receive-message ----------------->|
```

**In this implementation**, the REST POST persists the message to MongoDB first. Then the client emits via Socket.IO, and the server broadcasts to the relevant room. The DB write always succeeds before the socket emit fires.

## Socket.IO Room Mapping

| Room Pattern | Purpose |
|---|---|
| `user:<userId>` | Each user's personal room. DMs fan out to both users' rooms. |
| `group:<groupId>` | Group chat room. All group members join on connect. |

On socket connect, the server:
1. Verifies the JWT from `socket.handshake.auth.token`
2. Joins the user to their `user:<userId>` room
3. Finds all groups the user belongs to and joins each `group:<groupId>` room

## Pages

| Route | Description |
|---|---|
| `/auth` | Login and registration form |
| `/contacts` | View your 5-digit ID, open a DM by entering another user's ID |
| `/dm/:userId` | Direct message conversation with a specific user |
| `/group/:groupId` | Group chat conversation |
| `/create-group` | Create a new group by entering a name and member IDs |

## Project Structure

### Backend (`backend/src/`)

```
src/
  config/index.js        Environment variables + defaults
  middleware/
    auth.js              JWT verification middleware
    rateLimit.js         In-memory per-user rate limiter (30 req/min)
    validate.js          Request body validation middleware
  models/
    User.js              User schema (username, userId, passwordHash, groups)
    Message.js           Message schema (threadId, sender, content, timestamp)
    Group.js             Group schema (groupId, name, members)
  routes/
    auth.js              POST /register, POST /login, GET /me
    users.js             GET /user/:userId
    groups.js            POST /groups, GET /groups
    messages.js          GET /messages/:threadId
  sockets/index.js       Socket.IO setup with JWT auth + event handlers
  index.js               Express app + server + MongoDB connection
```

### Frontend (`frontend/src/`)

```
src/
  lib/api.js             API client with automatic JWT headers
  context/
    AuthContext.jsx       User state, login/register/logout
    SocketContext.jsx      Socket.IO singleton, connect/disconnect/emit/on
  pages/
    AuthPage.jsx          Login/Register form
    ContactsPage.jsx      Your ID + open DM by target ID
    DMView.jsx            Direct message chat view
    GroupView.jsx         Group chat view
    CreateGroupPage.jsx   Create a new group
  components/
    Sidebar.jsx           Navigation sidebar with group list
  App.jsx                 Router + auth protection
  index.jsx               Entry point
  index.css               Dark theme styles
```

## Deployment

### Why Cloudflare Pages + Separate Backend?

Cloudflare Workers/Pages **cannot run a persistent Node.js server** with Socket.IO or a MongoDB connection. The architecture splits into:

- **Frontend**: Static files on Cloudflare Pages (free, global CDN, fast)
- **Backend + MongoDB**: On a Docker host that supports long-running processes (Fly.io, Render, Railway, a VPS, etc.)

### Deploy the Backend

The backend and MongoDB run together on a host that supports Docker:

```bash
# Set your secrets
export JWT_SECRET="a-real-secret-here"
export FRONTEND_URL="https://your-app.pages.dev"

# Start on a remote host
docker compose -f docker-compose.prod.yml up -d
```

Or deploy just the backend container to Fly.io/Render with a managed MongoDB (MongoDB Atlas) and set the environment variables accordingly.

### Deploy the Frontend to Cloudflare Pages

**Option A: Direct deploy**

```bash
cd frontend
npm install
npm run build
# Upload the dist/ folder to Cloudflare Pages
```

**Option B: Git integration**

Connect your repo to Cloudflare Pages and set:
- Build command: `cd frontend && npm install && npm run build`
- Build output directory: `frontend/dist`

**Option C: Wrangler CLI**

```bash
cd frontend
npx wrangler pages deploy dist --project-name=chat-frontend
```

Set the `VITE_API_URL` environment variable in Cloudflare Pages dashboard to point at your deployed backend URL (e.g., `https://backend.example.com`). This must be set before building so it gets baked into the static bundle.

### Swapping MongoDB URI for Atlas

In the deployed environment there is no Docker MongoDB container. Update the `MONGO_URI` environment variable to point at your Atlas cluster:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/chatapp?retryWrites=true&w=majority
```

The backend reads `MONGO_URI` from the environment — no code changes needed.

### Environment Variables

**Backend** (set in your hosting platform or `.env`):

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGO_URI` | No | `mongodb://localhost:27017/chatapp` | MongoDB connection string |
| `JWT_SECRET` | Yes | `dev-secret-change-in-production` | Secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiration duration |
| `PORT` | No | `3001` | Server listen port |
| `FRONTEND_URL` | No | `*` | Allowed CORS origin |

**Frontend** (set in `.env` or build-time env):

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:3001` | Backend URL for API + Socket.IO |

## Rate Limiting

The backend applies a per-user rate limit of 30 requests per minute on message sends. This is enforced via an in-memory counter (resets on server restart). For production, consider using Redis-backed rate limiting.

## Key Technical Decisions

- **JWT over session tokens**: JWTs are stateless — no DB lookup needed to verify on each request. The token encodes the user's identity and is verified with a secret key.
- **bcrypt password hashing**: 12 salt rounds. The hash is never returned to the client.
- **DB-first message writes**: Messages are persisted to MongoDB before being broadcast via Socket.IO. If the DB write fails, no socket event fires.
- **Single socket connection**: The frontend establishes one Socket.IO connection after login and holds it in a SolidJS context. All pages share this connection.
- **Signal-based message patching**: Incoming socket events directly append to SolidJS signals — no refetch needed.
