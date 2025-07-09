import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to authenticate socket connections using JWT token.
 * Attaches the user info to the socket object.
 */
const socketAuth = async (socket, next) => {
    try {
        const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
        return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
        return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
    } catch (error) {
        console.error('Socket auth error:', error.message);
        next(new Error('Authentication failed'));
    }
    };

    /**
     * Sets up socket.io connection and event handlers.
     * @param {import('socket.io').Server} io
     */
    const handleConnection = (io) => {
    io.use(socketAuth);

    io.on('connection', async (socket) => {
        console.log(`User ${socket.user.fullName} connected with socket ID: ${socket.id}`);

        // Update user's socket ID in DB
        await User.findByIdAndUpdate(socket.userId, { socketId: socket.id });

        // Join personal room for user
        socket.join(`user_${socket.userId}`);

        // Join a conversation room
        socket.on('joinConversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        });

        // Leave a conversation room
        socket.on('leaveConversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`User ${socket.userId} left conversation ${conversationId}`);
        });

        // Typing indicator event
        socket.on('typing', ({ conversationId, isTyping }) => {
        socket.to(`conversation_${conversationId}`).emit('userTyping', {
            userId: socket.userId,
            userName: socket.user.fullName,
            isTyping,
        });
        });

        // Real-time message read status
        socket.on('messageRead', ({ messageId, conversationId }) => {
        socket.to(`conversation_${conversationId}`).emit('messageReadStatus', {
            messageId,
            readBy: socket.userId,
            readAt: new Date(),
        });
        });

        // Broadcast user status (online/offline)
        socket.on('userStatus', (status) => {
        socket.broadcast.emit('userStatusChange', {
            userId: socket.userId,
            status,
            lastSeen: status === 'offline' ? new Date() : null,
        });
        });

        // Handle disconnect event
        socket.on('disconnect', async () => {
        console.log(`User ${socket.user.fullName} disconnected`);

        // Remove socket ID from user
        await User.findByIdAndUpdate(socket.userId, { $unset: { socketId: 1 } });

        // Notify others user is offline
        socket.broadcast.emit('userStatusChange', {
            userId: socket.userId,
            status: 'offline',
            lastSeen: new Date(),
        });
        });
    });
};

export { handleConnection };
