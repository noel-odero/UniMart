import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, university } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ name, email, password, university });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
        
        res.status(201).json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            university: user.university
        }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

    // Login
    router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
        return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
        
        res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            university: user.university
        }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    });

    // Get current user
    router.get('/me', auth, (req, res) => {
    res.json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        university: req.user.university
    });
});

export default router;
