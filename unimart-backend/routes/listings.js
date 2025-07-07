import express from 'express';
import Listing from '../models/Listing.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all listings
router.get('/', async (req, res) => {
    try {
        const { search, category, university } = req.query;
        let filter = { status: 'active' };
        
        if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
        }
        if (category) filter.category = category;
        if (university) filter.university = university;

        const listings = await Listing.find(filter)
        .populate('seller', 'name university')
        .sort({ createdAt: -1 });
        
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

    // Create listing
    router.post('/', auth, async (req, res) => {
    try {
        const listing = new Listing({
        ...req.body,
        seller: req.user._id,
        university: req.user.university
        });
        await listing.save();
        await listing.populate('seller', 'name university');
        
        res.status(201).json(listing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

    // Get user's listings
    router.get('/my-listings', auth, async (req, res) => {
    try {
        const listings = await Listing.find({ seller: req.user._id })
        .sort({ createdAt: -1 });
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

    // Update listing
    router.put('/:id', auth, async (req, res) => {
    try {
        const listing = await Listing.findOneAndUpdate(
        { _id: req.params.id, seller: req.user._id },
        req.body,
        { new: true }
        );
        if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
        }
        res.json(listing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

    // Delete listing
    router.delete('/:id', auth, async (req, res) => {
    try {
        const listing = await Listing.findOneAndDelete({
        _id: req.params.id,
        seller: req.user._id
        });
        if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
        }
        res.json({ message: 'Listing deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
