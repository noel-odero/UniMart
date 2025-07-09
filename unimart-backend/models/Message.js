import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
    }, {
    timestamps: true
    });

    const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'offer'],
        default: 'text'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing'
    },
    offer: {
        amount: Number,
        status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
        }
    }
    }, {
    timestamps: true
});

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
const Message = mongoose.model('Message', messageSchema);


export { Conversation, Message };
