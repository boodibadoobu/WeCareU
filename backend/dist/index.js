"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const counselorRoutes_1 = __importDefault(require("./routes/counselorRoutes"));
const sessionRoutes_1 = __importDefault(require("./routes/sessionRoutes"));
const anonChatRoutes_1 = __importDefault(require("./routes/anonChatRoutes"));
const stressTestRoutes_1 = __importDefault(require("./routes/stressTestRoutes"));
const articleRoutes_1 = __importDefault(require("./routes/articleRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const socket_1 = require("./socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const port = process.env.PORT || 3000;
// Initialize Socket.IO
(0, socket_1.initSocket)(httpServer);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static('uploads')); // Serve uploaded files
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
// ... existing code ...
app.use('/api/auth', authRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/counselors', counselorRoutes_1.default);
app.use('/api/sessions', sessionRoutes_1.default);
app.use('/api/anon-chat', anonChatRoutes_1.default);
app.use('/api/stress-test', stressTestRoutes_1.default);
app.use('/api/articles', articleRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.get('/', (req, res) => {
    res.send('WeCareU Backend API');
});
httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
