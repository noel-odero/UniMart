// routes/listings.js

import express from 'express';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';
import auth from '../middleware/auth.js';
import { body, validationResult, query } from 'express-validator';

const router = express.Router();

// ---------- PRIORITY: Specific Routes First ----------

// Get user's listings
router.get('/user/my-listings', auth, async (req, res) => {
    try {
        const { status = 'active', page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { seller: req.user.userId };
        if (status !== 'all') filter.status = status;

        const listings = await Listing.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Listing.countDocuments(filter);

        res.json({
            listings,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total
            }
        });
    } catch (error) {
        console.error('Get user listings error:', error);
        res.status(500).json({ message: 'Server error while fetching your listings' });
    }
});

// Get user purchases
router.get('/user/purchases', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const purchases = await Purchase.find({ buyer: req.user.userId })
            .populate('listing', 'title price images category condition')
            .populate('seller', 'fullName university avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Purchase.countDocuments({ buyer: req.user.userId });

        res.json({
            purchases,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total
            }
        });
    } catch (error) {
        console.error('Get purchases error:', error);
        res.status(500).json({ message: 'Server error while fetching purchases' });
    }
});

// ---------- General Routes ----------

// Get all listings
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('category').optional().isIn(['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Other']),
    query('condition').optional().isIn(['New', 'Like New', 'Good', 'Fair', 'Poor']),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('university').optional().isString(),
    query('search').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const {
            page = 1,
            limit = 20,
            category,
            condition,
            minPrice,
            maxPrice,
            university,
            search,
            sortBy = 'newest'
        } = req.query;

        const filter = { status: 'active' };

        if (category && category !== 'all') filter.category = category;
        if (condition) filter.condition = condition;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        if (university) filter.university = university;
        if (search) filter.$text = { $search: search };

        const sort = {
            'price-low': { price: 1 },
            'price-high': { price: -1 },
            'popular': { views: -1 },
            'newest': { createdAt: -1 }
        }[sortBy] || { createdAt: -1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const listings = await Listing.find(filter)
            .populate('seller', 'fullName university avatar rating reviewCount')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Listing.countDocuments(filter);

        res.json({
            listings,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get listings error:', error);
        res.status(500).json({ message: 'Server error while fetching listings' });
    }
});

// Create new listing
router.post('/', auth, [
    body('title').trim().isLength({ min: 1, max: 100 }),
    body('description').trim().isLength({ min: 10, max: 1000 }),
    body('price').isFloat({ min: 0 }),
    body('category').isIn(['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Other']),
    body('condition').isIn(['New', 'Like New', 'Good', 'Fair', 'Poor']),
    body('images').isArray({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const user = await User.findById(req.user.userId);

        const listing = new Listing({
            ...req.body,
            seller: req.user.userId,
            university: user.university,
            location: user.location || user.university
        });

        await listing.save();
        await listing.populate('seller', 'fullName university avatar');

        res.status(201).json({ listing, message: 'Listing created successfully' });
    } catch (error) {
        console.error('Create listing error:', error);
        res.status(500).json({ message: 'Server error while creating listing' });
    }
});

// Update listing
router.put('/:id', auth, [
    body('title').optional().trim().isLength({ min: 1, max: 100 }),
    body('description').optional().trim().isLength({ min: 10, max: 1000 }),
    body('price').optional().isFloat({ min: 0 }),
    body('category').optional().isIn(['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Other']),
    body('condition').optional().isIn(['New', 'Like New', 'Good', 'Fair', 'Poor'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const listing = await Listing.findOne({
            _id: req.params.id,
            seller: req.user.userId
        });

        if (!listing) return res.status(404).json({ message: 'Listing not found or you are not the seller' });

        Object.assign(listing, req.body);
        await listing.save();
        await listing.populate('seller', 'fullName university avatar');

        res.json({ listing, message: 'Listing updated successfully' });
    } catch (error) {
        console.error('Update listing error:', error);
        res.status(500).json({ message: 'Server error while updating listing' });
    }
});

// Mark listing as sold
router.post('/:id/sold', auth, [
    body('buyerId').optional().isMongoId(),
    body('soldPrice').optional().isFloat({ min: 0 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const listing = await Listing.findOne({
            _id: req.params.id,
            seller: req.user.userId,
            status: 'active'
        });

        if (!listing) return res.status(404).json({ message: 'Listing not found or already sold' });

        const { buyerId, soldPrice } = req.body;

        listing.status = 'sold';
        listing.soldAt = new Date();
        listing.soldPrice = soldPrice || listing.price;
        if (buyerId) listing.buyer = buyerId;

        await listing.save();

        const seller = await User.findById(req.user.userId);
        seller.totalSales += 1;
        seller.totalEarnings += listing.soldPrice;
        await seller.save();

        if (buyerId) {
            const purchase = new Purchase({
                buyer: buyerId,
                seller: req.user.userId,
                listing: listing._id,
                purchasePrice: listing.soldPrice,
                status: 'completed',
                completedAt: new Date()
            });
            await purchase.save();
        }

        res.json({ message: 'Listing marked as sold successfully', listing });
    } catch (error) {
        console.error('Mark sold error:', error);
        res.status(500).json({ message: 'Server error while marking listing as sold' });
    }
});

// Add/remove from wishlist
router.post('/:id/wishlist', auth, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: 'Listing not found' });

        const user = await User.findById(req.user.userId);
        const isInWishlist = user.wishlist.includes(listing._id);

        if (isInWishlist) {
            user.wishlist = user.wishlist.filter(id => !id.equals(listing._id));
            await user.save();
            res.json({ message: 'Removed from wishlist', inWishlist: false });
        } else {
            user.wishlist.push(listing._id);
            await user.save();
            res.json({ message: 'Added to wishlist', inWishlist: true });
        }
    } catch (error) {
        console.error('Wishlist error:', error);
        res.status(500).json({ message: 'Server error while updating wishlist' });
    }
});

// Get single listing (LAST!)
router.get('/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate('seller', 'fullName university avatar phone location bio rating reviewCount joinedDate');

        if (!listing) return res.status(404).json({ message: 'Listing not found' });

        if (req.user && req.user.userId.toString() !== listing.seller._id.toString()) {
            const hasViewed = listing.viewedBy.some(view => view.user.toString() === req.user.userId.toString());
            if (!hasViewed) {
                listing.views += 1;
                listing.viewedBy.push({ user: req.user.userId });
                await listing.save();
            }
        }

        res.json({ listing });
    } catch (error) {
        console.error('Get listing error:', error);
        res.status(500).json({ message: 'Server error while fetching listing' });
    }
});

export default router;
