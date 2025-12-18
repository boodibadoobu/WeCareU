# Testing Real-Time Chat Across Multiple Devices

## Problem Fixed
Socket.io was hardcoded to `http://localhost:3000`, which only works on the same machine. Now it uses environment variables to support testing from multiple devices on the same network.

## Files Updated

### Backend
- No changes needed (already configured for network access)

### Frontend
- ✅ Created `.env` file with `VITE_API_URL`
- ✅ Updated `axios.ts` - API calls now use environment variable
- ✅ Updated `AnonChatPage.tsx` - Socket.io connection uses environment variable
- ✅ Updated `ChatPage.tsx` - Socket.io connection uses environment variable  
- ✅ Updated `ArticleFormPage.tsx` - Image upload URL uses environment variable

---

## Setup Instructions

### Step 1: Find Your Computer's Local IP Address

**On Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your network adapter (WiFi or Ethernet).
Example: `192.168.1.100`

**On Mac/Linux:**
```bash
ifconfig
```
or
```bash
ip addr show
```

### Step 2: Update Frontend `.env` File

Edit `frontend/.env` and change `localhost` to your local IP:

```env
VITE_API_URL=http://192.168.1.100:3000
```

Replace `192.168.1.100` with YOUR computer's actual IP address.

### Step 3: Restart Frontend Dev Server

**IMPORTANT:** Vite only reads `.env` on startup!

```bash
# Stop current frontend server (Ctrl+C)
cd frontend
npm run dev
```

### Step 4: Test from Another Device

On the **second laptop** (must be on the SAME WiFi network):

1. Open browser
2. Navigate to: `http://192.168.1.100:5173` (replace IP with your backend computer's IP)
3. Login with different accounts (one as student, one as counselor)

---

## Testing Real-Time Anonymous Chat

### Laptop 1 - Student
1. Login as **Student**
2. Go to "Anon Chat"
3. Select a counselor
4. Start chat
5. Send a message
6. **Open browser console (F12)** - you should see:
   ```
   Initializing socket connection for session: X
   Socket URL: http://192.168.1.100:3000
   Socket connected successfully
   Successfully joined anon session: X
   ```

### Laptop 2 - Counselor
1. Login as **Counselor**
2. Go to "Anon Chats"
3. Click on the new session
4. **Check console** - should see Socket connection logs
5. Send a reply
6. Message should appear **INSTANTLY** on Student's laptop (no refresh!)

### What to Verify
- ✅ Messages appear in real-time (no refresh needed)
- ✅ Both sides can send and receive instantly
- ✅ Console shows "Socket connected successfully"
- ✅ No CORS errors in console

---

## Common Issues & Solutions

### Issue 1: Cannot Connect to Backend
**Symptom:** "Connection refused" or "Failed to fetch"

**Solution:**
1. Check backend is running: `npm run dev` in backend folder
2. Verify IP address is correct
3. Check Windows Firewall - allow Node.js through firewall
4. Make sure both devices are on the SAME WiFi network

### Issue 2: Messages Still Don't Appear in Real-Time
**Symptom:** Messages only show after refresh

**Solution:**
1. Check browser console for Socket.io errors
2. Verify `.env` file has correct IP (not `localhost`)
3. **Restart frontend dev server** after changing `.env`
4. Hard reload browser (Ctrl+Shift+R)

### Issue 3: CORS Error
**Symptom:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**
Backend already has CORS enabled for all origins:
```typescript
// backend/src/index.ts
app.use(cors());
```
This should work. If not, check backend console for errors.

### Issue 4: Socket.io Connection Failed
**Symptom:** Console shows "connect_error"

**Check:**
1. Backend is running on port 3000
2. Frontend `.env` has correct IP
3. Frontend dev server was restarted after .env change
4. Firewall is not blocking port 3000

---

## Quick Troubleshooting Checklist

- [ ] Backend running on port 3000
- [ ] Frontend `.env` has correct IP (not localhost)
- [ ] Frontend dev server restarted after .env change
- [ ] Both laptops on same WiFi network
- [ ] Firewall allows Node.js
- [ ] Browser console shows "Socket connected successfully"
- [ ] No CORS errors in console

---

## For Production Deployment

When deploying to production server:

1. **Backend:** Deploy to a server with public IP or domain
2. **Frontend `.env`:**
   ```env
   VITE_API_URL=https://your-backend-domain.com
   ```
3. **Build frontend:**
   ```bash
   npm run build
   ```
4. **Serve static files** from `dist/` folder

---

## Network Configuration

### Backend (already configured)
```typescript
// Listens on all network interfaces
httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// CORS enabled for all origins
app.use(cors());

// Socket.io CORS configured
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
```

### Frontend (now configured)
```typescript
// Uses environment variable
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`
});

const socketUrl = import.meta.env.VITE_API_URL;
socketRef.current = io(socketUrl, {
    auth: { token }
});
```

---

## Example Full Test Flow

**Laptop 1 (Backend & Student):**
```bash
# Terminal 1 - Backend
cd backend
npm run dev   # Running on port 3000

# Terminal 2 - Frontend
cd frontend
# Edit .env: VITE_API_URL=http://192.168.1.100:3000
npm run dev   # Running on port 5173

# Browser: http://localhost:5173
# Login as Student → Anon Chat → Send message
```

**Laptop 2 (Counselor):**
```bash
# Browser: http://192.168.1.100:5173
# Login as Counselor → Anon Chats → Open session
# Message from student appears instantly!
# Reply → Student sees it instantly!
```

---

## Success Indicators

When working correctly, you'll see:

**Browser Console:**
```
Initializing socket connection for session: 1
Socket URL: http://192.168.1.100:3000
Socket connected successfully
Successfully joined anon session: 1
Received message: {id: 1, message_text: "Hello!", ...}
```

**Backend Console:**
```
Server is running on port 3000
User connected: 12
User 12 joined anon session 1
Anon message sent to session 1: {id: 1, ...}
```

**In the Chat:**
- Type message on Laptop 1
- Message instantly appears on Laptop 2 (NO REFRESH!)
- Type reply on Laptop 2
- Reply instantly appears on Laptop 1 (NO REFRESH!)

🎉 This confirms real-time Socket.io is working across devices!
