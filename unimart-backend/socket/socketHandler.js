const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
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
        next(new Error('Authentication failed'));
    }
    };

    const handleConnection = (io) => {
    io.use(socketAuth);

    io.on('connection', async (socket) => {
        console.log(`User ${socket.user.fullName} connected with socket ID: ${socket.id}`);

        // Update user's socket ID in database
        await User.findByIdAndUpdate(socket.userId, { socketId: socket.id });

        // Join user to their personal room
        socket.join(`user_${socket.userId}`);

        // Handle joining conversation rooms
        socket.on('joinConversation', (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        });

        // Handle leaving conversation rooms
        socket.on('leaveConversation', (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
        console.log(`User ${socket.userId} left conversation ${conversationId}`);
        });

        // Handle typing indicators
        socket.on('typing', ({ conversationId, isTyping }) => {
        socket.to(`conversation_${conversationId}`).emit('userTyping', {
            userId: socket.userId,
            userName: socket.user.fullName,
            isTyping
        });
        });

        // Handle real-time message read status
        socket.on('messageRead', ({ messageId, conversationId }) => {
        socket.to(`conversation_${conversationId}`).emit('messageReadStatus', {
            messageId,
            readBy: socket.userId,
            readAt: new Date()
        });
        });

        // Handle user going online/offline
        socket.on('userStatus', (status) => {
        socket.broadcast.emit('userStatusChange', {
            userId: socket.userId,
            status,
            lastSeen: status === 'offline' ? new Date() : null
        });
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
        console.log(`User ${socket.user.fullName} disconnected`);
        
        // Remove socket ID from user
        await User.findByIdAndUpdate(socket.userId, { $unset: { socketId: 1 } });
        
        // Notify others user is offline
        socket.broadcast.emit('userStatusChange', {
            userId: socket.userId,
            status: 'offline',
            lastSeen: new Date()
        });
        });
    });
};

module.exports = { handleConnection };
