import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import counselorRoutes from './routes/counselorRoutes';
import sessionRoutes from './routes/sessionRoutes';
import anonChatRoutes from './routes/anonChatRoutes';
import stressTestRoutes from './routes/stressTestRoutes';
import articleRoutes from './routes/articleRoutes';
import { initSocket } from './socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;

// Initialize Socket.IO
initSocket(httpServer);

app.use(cors());
app.use(express.json());

import notificationRoutes from './routes/notificationRoutes';

// ... existing code ...

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/counselors', counselorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/anon-chat', anonChatRoutes);
app.use('/api/stress-test', stressTestRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('WeCareU Backend API');
});

httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
