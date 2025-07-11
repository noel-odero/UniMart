import express from 'express';
import { Conversation, Message } from '../models/Message.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import auth from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get user's conversations
router.get('/conversations', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const conversations = await Conversation.find({
        participants: req.user.userId
        })
        .populate('participants', 'fullName avatar university')
        .populate('listing', 'title images price category')
        .populate('lastMessage')
        .sort({ lastActivity: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        // Get unread message counts for each conversation
        const conversationsWithUnread = await Promise.all(
        conversations.map(async (conversation) => {
            const unreadCount = await Message.countDocuments({
            conversation: conversation._id,
            recipient: req.user.userId,
            isRead: false
            });

            return {
            ...conversation.toObject(),
            unreadCount
            };
        })
        );

        const total = await Conversation.countDocuments({
        participants: req.user.userId
        });

        res.json({
        conversations: conversationsWithUnread,
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total
        }
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Server error while fetching conversations' });
    }
    });

    // Get messages in a conversation
    router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Verify user is part of the conversation
        const conversation = await Conversation.findOne({
        _id: req.params.conversationId,
        participants: req.user.userId
        });

        if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found or access denied' });
        }

        const messages = await Message.find({
        conversation: req.params.conversationId
        })
        .populate('sender', 'fullName avatar')
        .populate('recipient', 'fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

        const total = await Message.countDocuments({
        conversation: req.params.conversationId
        });

        // Mark messages as read
        await Message.updateMany({
        conversation: req.params.conversationId,
        recipient: req.user.userId,
        isRead: false
        }, {
        isRead: true,
        readAt: new Date()
        });

        res.json({
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalItems: total
        }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error while fetching messages' });
    }
    });

    // Send a message
    router.post('/send', auth, [
    body('recipientId').isMongoId().withMessage('Invalid recipient ID'),
    body('listingId').isMongoId().withMessage('Invalid listing ID'),
    body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content must be between 1 and 1000 characters'),
    body('messageType').optional().isIn(['text', 'image', 'offer']).withMessage('Invalid message type')
    ], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const { recipientId, listingId, content, messageType = 'text', offer } = req.body;

        // Verify recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found' });
        }

        // Verify listing exists and is active
        const listing = await Listing.findById(listingId);
        if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
        }

        // Check if user is trying to message themselves
        if (req.user.userId.toString() === recipientId) {
        return res.status(400).json({ message: 'Cannot send message to yourself' });
        }

        // Find or create conversation
        let conversation = await Conversation.findOne({
        participants: { $all: [req.user.userId, recipientId] },
        listing: listingId
        });

        if (!conversation) {
        conversation = new Conversation({
            participants: [req.user.userId, recipientId],
            listing: listingId
        });
        await conversation.save();
        }

        // Create message
        const message = new Message({
        conversation: conversation._id,
        sender: req.user.userId,
        recipient: recipientId,
        content,
        messageType,
        listing: listingId,
        offer: messageType === 'offer' ? offer : undefined
        });

        await message.save();

        // Update conversation
        conversation.lastMessage = message._id;
        conversation.lastActivity = new Date();
        await conversation.save();

        // Populate message for response
        await message.populate([
        { path: 'sender', select: 'fullName avatar' },
        { path: 'recipient', select: 'fullName avatar' }
        ]);

        // Emit real-time message if recipient is online
        const io = req.app.get('io');
        if (recipient.socketId) {
        io.to(recipient.socketId).emit('newMessage', {
            message,
            conversation: conversation._id
        });
        }

        res.status(201).json({ message, conversationId: conversation._id });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Server error while sending message' });
    }
    });

    // Start conversation (when someone wants to message about a listing)
    router.post('/start-conversation', auth, [
    body('listingId').isMongoId().withMessage('Invalid listing ID'),
    body('initialMessage').trim().isLength({ min: 1, max: 1000 }).withMessage('Initial message must be between 1 and 1000 characters')
    ], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const { listingId, initialMessage } = req.body;

        const listing = await Listing.findById(listingId).populate('seller');
        if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
        }

        if (listing.seller._id.toString() === req.user.userId.toString()) {
        return res.status(400).json({ message: 'Cannot message yourself about your own listing' });
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
        participants: { $all: [req.user.userId, listing.seller._id] },
        listing: listingId
        });

        if (conversation) {
        return res.status(400).json({
            message: 'Conversation already exists',
            conversationId: conversation._id
        });
        }

        // Create new conversation
        conversation = new Conversation({
        participants: [req.user.userId, listing.seller._id],
        listing: listingId
        });
        await conversation.save();

        // Send initial message
        const message = new Message({
        conversation: conversation._id,
        sender: req.user.userId,
        recipient: listing.seller._id,
        content: initialMessage,
        listing: listingId
        });

        await message.save();

        // Update conversation
        conversation.lastMessage = message._id;
        conversation.lastActivity = new Date();
        await conversation.save();

        // Populate for response
        await Promise.all([
        conversation.populate('participants', 'fullName avatar university'),
        conversation.populate('listing', 'title images price category'),
        message.populate([
            { path: 'sender', select: 'fullName avatar' },
            { path: 'recipient', select: 'fullName avatar' }
        ])
        ]);

        // Emit real-time notification
        const io = req.app.get('io');
        if (listing.seller.socketId) {
        io.to(listing.seller.socketId).emit('newConversation', {
            conversation,
            message
        });
        }

        res.status(201).json({
        conversation,
        message,
        messageText: 'Conversation started successfully'
        });
    } catch (error) {
        console.error('Start conversation error:', error);
        res.status(500).json({ message: 'Server error while starting conversation' });
    }
    });

    // Get unread message count
    router.get('/unread-count', auth, async (req, res) => {
    try {
        const unreadCount = await Message.countDocuments({
        recipient: req.user.userId,
        isRead: false
        });

        res.json({ unreadCount });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Server error while fetching unread count' });
    }
    });

    // Mark conversation as read
    router.put('/conversations/:conversationId/mark-read', auth, async (req, res) => {
    try {
        // Verify user is part of the conversation
        const conversation = await Conversation.findOne({
        _id: req.params.conversationId,
        participants: req.user.userId
        });

        if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found or access denied' });
        }

        await Message.updateMany({
        conversation: req.params.conversationId,
        recipient: req.user.userId,
        isRead: false
        }, {
        isRead: true,
        readAt: new Date()
        });

        res.json({ message: 'Conversation marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: 'Server error while marking conversation as read' });
    }
});

export default router;

