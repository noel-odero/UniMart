import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './CompleteRoutes/auth.js';
import listingRoutes from './CompleteRoutes/listings.js';
import messageRoutes from './CompleteRoutes/messages.js';
import { handleConnection } from './socket/socketHandler.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
    });

    // Store io instance for use in routes
    app.set('io', io);

    // Security middleware
    app.use(helmet());
    app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { message: 'Too many requests from this IP, please try again later' }
    });
    app.use('/api', limiter);

    // Body parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Database connection
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB connection error:', err));


    
    // Routes
    // console.log('authRoutes:', authRoutes);
    // console.log('listingRoutes:', listingRoutes);
    // console.log('messageRoutes:', messageRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/listings', listingRoutes);
    app.use('/api/messages', messageRoutes);

    // Health check endpoint
    app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
    });

    // Socket.IO connection
    handleConnection(io);

    // Error handler
    app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
    });

    // 404 handler
    app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
    });

    const PORT = process.env.PORT || 5001;

    server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { app, server, io };
