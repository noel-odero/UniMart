import mongoose from 'mongoose';

const ListingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
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
    images: [{ type: String }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, required: true },
    views: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }]
}, { timestamps: true });

const Listing = mongoose.model('Listing', ListingSchema);
export default Listing;
