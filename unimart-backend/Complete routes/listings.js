const express = require('express');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const auth = require('../middleware/auth');
const { body, validationResult, query } = require('express-validator');

const router = express.Router();

// Get all listings with filtering and pagination
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
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

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

        // Build filter object
        const filter = { status: 'active' };

        if (category && category !== 'all') {
        filter.category = category;
        }

        if (condition) {
        filter.condition = condition;
        }

        if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        if (university) {
        filter.university = university;
        }

        if (search) {
        filter.$text = { $search: search };
        }

        // Build sort object
        let sort = {};
        switch (sortBy) {
        case 'price-low':
            sort.price = 1;
            break;
        case 'price-high':
            sort.price = -1;
            break;
        case 'popular':
            sort.views = -1;
            break;
        default:
            sort.createdAt = -1;
        }

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

    // Get single listing
    router.get('/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
        .populate('seller', 'fullName university avatar phone location bio rating reviewCount joinedDate');

        if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
        }

        // Increment view count (but not for the seller)
        if (req.user && req.user.userId.toString() !== listing.seller._id.toString()) {
        const hasViewed = listing.viewedBy.some(view => 
            view.user.toString() === req.user.userId.toString()
        );

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

    // Create new listing
    router.post('/', auth, [
    body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
    body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').isIn(['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Other']).withMessage('Invalid category'),
    body('condition').isIn(['New', 'Like New', 'Good', 'Fair', 'Poor']).withMessage('Invalid condition'),
    body('images').isArray({ min: 1 }).withMessage('At least one image is required')
    ], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

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
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const listing = await Listing.findOne({
        _id: req.params.id,
        seller: req.user.userId
        });

        if (!listing) {
        return res.status(404).json({ message: 'Listing not found or you are not the seller' });
        }

        Object.assign(listing, req.body);
        await listing.save();
        await listing.populate('seller', 'fullName university avatar');

        res.json({ listing, message: 'Listing updated successfully' });
    } catch (error) {
        console.error('Update listing error:', error);
        res.status(500).json({ message: 'Server error while updating listing' });
    }
    });

    // Delete listing
    router.delete('/:id', auth, async (req, res) => {
    try {
        const listing = await Listing.findOne({
        _id: req.params.id,
        seller: req.user.userId
        });

        if (!listing) {
        return res.status(404).json({ message: 'Listing not found or you are not the seller' });
        }

        listing.status = 'removed';
        await listing.save();

        res.json({ message: 'Listing removed successfully' });
    } catch (error) {
        console.error('Delete listing error:', error);
        res.status(500).json({ message: 'Server error while deleting listing' });
    }
    });

    // Get user's listings
    router.get('/user/my-listings', auth, async (req, res) => {
    try {
        const { status = 'active', page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { seller: req.user.userId };
        if (status !== 'all') {
        filter.status = status;
        }

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

    // Mark listing as sold
    router.post('/:id/sold', auth, [
    body('buyerId').optional().isMongoId().withMessage('Invalid buyer ID'),
    body('soldPrice').optional().isFloat({ min: 0 }).withMessage('Sold price must be positive')
    ], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const listing = await Listing.findOne({
        _id: req.params.id,
        seller: req.user.userId,
        status: 'active'
        });

        if (!listing) {
        return res.status(404).json({ message: 'Listing not found or already sold' });
        }

        const { buyerId, soldPrice } = req.body;

        listing.status = 'sold';
        listing.soldAt = new Date();
        listing.soldPrice = soldPrice || listing.price;
        if (buyerId) listing.buyer = buyerId;

        await listing.save();

        // Update seller's stats
        const seller = await User.findById(req.user.userId);
        seller.totalSales += 1;
        seller.totalEarnings += listing.soldPrice;
        await seller.save();

        // Create purchase record if buyer is specified
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

    // Add to wishlist
    router.post('/:id/wishlist', auth, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
        }

        const user = await User.findById(req.user.userId);
        const isAlreadyInWishlist = user.wishlist.includes(listing._id);

        if (isAlreadyInWishlist) {
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

    // Get user's purchases
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

module.exports = router;
