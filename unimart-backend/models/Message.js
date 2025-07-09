const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Other']
    },
    condition: {
        type: String,
        required: true,
        enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
    },
    images: [{
        type: String,
        required: true
    }],
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['active', 'sold', 'removed'],
        default: 'active'
    },
    views: {
        type: Number,
        default: 0
    },
    viewedBy: [{
        user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        },
        viewedAt: {
        type: Date,
        default: Date.now
        }
    }],
    location: String,
    university: String,
    tags: [String],
    isNegotiable: {
        type: Boolean,
        default: true
    },
    soldAt: Date,
    soldPrice: Number
    }, {
    timestamps: true
});

listingSchema.index({ title: 'text', description: 'text', tags: 'text' });
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ seller: 1, status: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Listing', listingSchema);
