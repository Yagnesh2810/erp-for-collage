# Socket.IO Deployment Fix for Render

## Problem
Socket.IO connections failing with "xhr poll error" and timeout errors on Render deployment.

## Root Causes
1. **Transport ordering** - Polling should be fallback, not primary
2. **Timeout values** - Too short for cloud deployments
3. **CORS configuration** - Missing production origins
4. **WebSocket support** - Not properly configured for Render

## Solutions Applied

### Backend Changes (server.ts)
- Reordered transports: `["websocket", "polling"]` (WebSocket first)
- Increased `pingTimeout` to 60000ms
- Increased `pingInterval` to 25000ms
- Added `upgradeTimeout` of 30000ms
- Disabled compression for better compatibility
- Added explicit path: `/socket.io/`

### Frontend Changes (socket.ts)
- Reordered transports: `["websocket", "polling"]`
- Increased reconnection attempts to 10
- Increased timeout to 30000ms
- Added `withCredentials: true` for CORS
- Added `secure: true` for HTTPS
- Added explicit path: `/socket.io/`

### Render Environment Variables Required
```
NODE_ENV=production
PORT=10000
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-jwt-secret>
CORS_ORIGIN=<your-frontend-url>
FRONTEND_URL=<your-frontend-url>
```

## Testing Steps

1. **Check API Health**
   ```bash
   curl https://erp-main-wocg.onrender.com/api/test
   ```

2. **Check Socket.IO Health**
   ```bash
   curl https://erp-main-wocg.onrender.com/api/socket/health
   ```

3. **Test WebSocket Connection**
   - Open browser console on your frontend
   - Look for: `✅ Socket connected: <socket-id>`
   - Should NOT see repeated "xhr poll error"

## Common Issues & Fixes

### Issue: Still getting "xhr poll error"
**Fix:** Ensure Render environment variables include:
- `CORS_ORIGIN` matches your frontend URL exactly
- `FRONTEND_URL` matches your frontend URL exactly

### Issue: Connection timeout
**Fix:** 
- Check Render logs for backend errors
- Verify MongoDB connection is working
- Ensure backend is actually running (not crashed)

### Issue: CORS errors
**Fix:** Add your production frontend URL to allowed origins:
```typescript
const allowedOrigins = [
  process.env.CORS_ORIGIN || "http://localhost:3000",
  process.env.FRONTEND_URL || "http://localhost:3000",
  "https://your-frontend-domain.vercel.app" // Add explicitly
];
```

## Render-Specific Configuration

### Enable WebSocket Support
Render automatically supports WebSockets on all plans. No special configuration needed.

### Health Checks
Render will ping `/api/test` to verify service health. Ensure this endpoint always returns 200 OK.

### Logs
Monitor Render logs for Socket.IO connection messages:
```
✅ Connected to MongoDB
🚀 Server running on port 10000
User connected: <socket-id>
```

## Deployment Checklist

- [ ] Backend deployed to Render
- [ ] Environment variables configured
- [ ] MongoDB Atlas connection working
- [ ] Frontend deployed (Vercel/Netlify)
- [ ] Frontend `NEXT_PUBLIC_API_URL` points to Render backend
- [ ] CORS origins include frontend URL
- [ ] Socket.IO health check returns 200 OK
- [ ] Browser console shows successful socket connection

## Monitoring

Check Socket.IO status:
```bash
curl https://erp-main-wocg.onrender.com/api/socket/health
```

Expected response:
```json
{
  "status": "ok",
  "socketConnections": 0,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Additional Notes

- Render free tier may spin down after inactivity (causes initial connection delay)
- First connection after spin-down may take 30-60 seconds
- Consider upgrading to paid tier for always-on service
- WebSocket connections are more reliable than polling on Render
