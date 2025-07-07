import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import socketHandlers from './socket/socketHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});


connectDB();


app.use(cors());
app.use(express.json());


import authRoutes from './routes/auth.js';
import listingsRoutes from './routes/listings.js';
import messagesRoutes from './routes/messages.js';

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/messages', messagesRoutes);

// Add this line after your other routes
app.get('/api/health', (req, res) => {
    res.json({ message: 'Server is healthy', timestamp: new Date() });
});



socketHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
