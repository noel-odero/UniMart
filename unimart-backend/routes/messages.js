import express from 'express';
import Message from '../models/Message.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get conversations
router.get('/conversations', auth, async (req, res) => {
    try {
        const conversations = await Message.aggregate([
        {
            $match: {
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
            _id: {
                $cond: [
                { $eq: ['$sender', req.user._id] },
                '$receiver',
                '$sender'
                ]
            },
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
                $sum: {
                $cond: [
                    { $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$read', false] }] },
                    1,
                    0
                ]
                }
            }
            }
        }
        ]);

        await Message.populate(conversations, [
        { path: '_id', select: 'name university' },
        { path: 'lastMessage.sender', select: 'name' },
        { path: 'lastMessage.listing', select: 'title' }
        ]);

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

    // Get messages with specific user
    router.get('/:userId', auth, async (req, res) => {
    try {
        const messages = await Message.find({
        $or: [
            { sender: req.user._id, receiver: req.params.userId },
            { sender: req.params.userId, receiver: req.user._id }
        ]
        })
        .populate('sender', 'name')
        .populate('listing', 'title')
        .sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
        { sender: req.params.userId, receiver: req.user._id, read: false },
        { read: true }
        );

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

    // Send message
    router.post('/', auth, async (req, res) => {
    try {
        const message = new Message({
        sender: req.user._id,
        receiver: req.body.receiver,
        content: req.body.content,
        listing: req.body.listing
        });
        await message.save();
        await message.populate(['sender', 'listing']);
        
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
