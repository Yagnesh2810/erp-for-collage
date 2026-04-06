# Socket.IO Connection Fix Guide

## Issues Fixed

### 1. **XHR Poll Error**
**Problem:** Socket repeatedly failing with "xhr poll error" after initial connection
**Solution:** 
- Disabled transport upgrades (`upgrade: false` on client, `allowUpgrades: false` on server)
- Reduced reconnection attempts from 10 to 5
- Adjusted timeout values for better stability

### 2. **CORS Configuration**
**Problem:** Trailing slashes in CORS_ORIGIN and FRONTEND_URL causing origin mismatch
**Solution:**
- Removed trailing slashes from URLs in `.env`
- Changed NODE_ENV to `production` for proper CORS handling

### 3. **Connection Stability**
**Problem:** Too aggressive reconnection causing connection floods
**Solution:**
- Increased reconnection delay to 3000ms
- Reduced reconnection attempts to 5
- Adjusted ping intervals for better keep-alive

## Changes Made

### Frontend (`frontend/src/lib/socket.ts`)
```typescript
socket = io(API_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,        // Reduced from 10
  reconnectionDelay: 3000,        // Increased from 2000
  reconnectionDelayMax: 10000,
  timeout: 20000,                 // Reduced from 30000
  forceNew: false,
  upgrade: false,                 // Changed from true
  autoConnect: true,
  path: "/socket.io/",
  withCredentials: true,
  // Removed: secure: true (let it auto-detect)
});
```

### Backend (`backend/.env`)
```env
CORS_ORIGIN=https://erp-main-git-main-yagnesh2810s-projects.vercel.app  # Removed trailing /
FRONTEND_URL=https://erp-main-git-main-yagnesh2810s-projects.vercel.app # Removed trailing /
NODE_ENV=production  # Changed from development
```

### Backend (`backend/src/server.ts`)
```typescript
const io = new SocketServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Socket CORS blocked: ${origin}`);
        callback(null, false);
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 30000,      // Reduced from 60000
  pingInterval: 10000,     // Reduced from 25000
  upgradeTimeout: 10000,   // Reduced from 30000
  maxHttpBufferSize: 1e6,
  allowUpgrades: false,    // Changed from true
  perMessageDeflate: false,
  httpCompression: false,
  cookie: false,
  path: "/socket.io/",
});
```

## Deployment Steps

### 1. Update Backend on Render
```bash
cd backend
git add .
git commit -m "Fix Socket.IO connection issues"
git push
```

Make sure Render environment variables are set:
- `CORS_ORIGIN=https://erp-main-git-main-yagnesh2810s-projects.vercel.app`
- `FRONTEND_URL=https://erp-main-git-main-yagnesh2810s-projects.vercel.app`
- `NODE_ENV=production`

### 2. Update Frontend on Vercel
```bash
cd frontend
git add .
git commit -m "Fix Socket.IO connection issues"
git push
```

Vercel will auto-deploy. Ensure environment variable is set:
- `NEXT_PUBLIC_API_URL=https://erp-main-wocg.onrender.com`

### 3. Test the Connection

Open browser console and check for:
```
🔌 Initializing socket connection to: https://erp-main-wocg.onrender.com
✅ Socket connected: <socket-id>
🔐 Attempting socket authentication...
✅ Socket authenticated successfully for user: <user-id>
```

You should NOT see repeated "xhr poll error" messages.

## Troubleshooting

### Still Getting Errors?

1. **Clear browser cache and hard reload** (Ctrl+Shift+R)
2. **Check Render logs** for backend errors
3. **Verify environment variables** on both Render and Vercel
4. **Test API endpoint**: `https://erp-main-wocg.onrender.com/api/test`
5. **Test Socket health**: `https://erp-main-wocg.onrender.com/api/socket/health`

### Connection Timeout?

If Render service is sleeping (free tier):
- First connection may take 30-60 seconds
- Subsequent connections should be instant
- Consider upgrading to paid tier for always-on service

### CORS Errors?

Check that:
- No trailing slashes in URLs
- Frontend URL matches exactly in backend CORS config
- Both HTTP and HTTPS protocols match

## Expected Behavior

✅ **Good:**
- Socket connects within 2-3 seconds
- Authentication succeeds immediately
- No repeated error messages
- Real-time updates work

❌ **Bad:**
- Repeated "xhr poll error" messages
- Connection timeout after 20 seconds
- CORS errors in console
- Socket disconnects immediately after connecting

## Monitoring

Check connection status:
```bash
curl https://erp-main-wocg.onrender.com/api/socket/health
```

Expected response:
```json
{
  "status": "ok",
  "socketConnections": 1,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Additional Notes

- WebSocket is preferred transport (faster, more reliable)
- Polling is fallback only (slower, but works everywhere)
- Upgrades disabled to prevent transport switching issues
- Connection should be stable for hours without disconnecting
