import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const socketHandlers = (io) => {

    io.use(async (socket, next) => {
        try {
        const token = socket.handshake.auth.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id);
        socket.userId = user._id.toString();
        next();
        } catch (err) {
        next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User ${socket.userId} connected`);


        socket.join(socket.userId);


        socket.on('join_conversation', (otherUserId) => {
        const roomId = [socket.userId, otherUserId].sort().join('_');
        socket.join(roomId);
        });


        socket.on('send_message', (data) => {
        const roomId = [socket.userId, data.receiver].sort().join('_');
        socket.to(roomId).emit('receive_message', {
            ...data,
            sender: socket.userId,
            timestamp: new Date()
        });
        });


        socket.on('typing', (data) => {
        const roomId = [socket.userId, data.receiver].sort().join('_');
        socket.to(roomId).emit('user_typing', {
            userId: socket.userId,
            isTyping: data.isTyping
        });
        });

        socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        });
    });
};

export default socketHandlers;
