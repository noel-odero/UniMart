import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    purchasePrice: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: String,
    deliveryMethod: {
        type: String,
        enum: ['pickup', 'delivery'],
        default: 'pickup'
    },
    deliveryAddress: String,
    notes: String,
    completedAt: Date,
    cancelledAt: Date,
    cancellationReason: String
    }, {
    timestamps: true
});

export default mongoose.model('Purchase', purchaseSchema);
