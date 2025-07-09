import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail, generateVerificationToken } from '../utils/emailService.js';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
    message: { message: 'Too many authentication attempts, please try again later' }
    });

    // Sign up
    router.post('/signup', [
    body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('university').notEmpty().withMessage('University is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const { fullName, email, university, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Validate university email domain (optional)
        const universityDomains = {
        'University of Rwanda': ['ur.ac.rw'],
        'African Leadership University': ['alueducation.com'],
        'Makerere University': ['mak.ac.ug'],
        'University of Nairobi': ['uonbi.ac.ke'],
        'University of Cape Town': ['uct.ac.za']
        };

        // Generate verification token
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create user
        const user = new User({
        fullName,
        email,
        university,
        password,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires
        });

        await user.save();

        // Send verification email
        await sendVerificationEmail(user, verificationToken);

        res.status(201).json({
        message: 'Account created successfully! Please check your email to verify your account.',
        userId: user._id
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
    });

    // Verify email
    router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Server error during email verification' });
    }
    });

    // Login
    router.post('/login', authLimiter, [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
    ], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
        return res.status(401).json({ message: 'Please verify your email before logging in' });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
        );

        res.json({
        message: 'Login successful',
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            university: user.university,
            avatar: user.avatar,
            totalSales: user.totalSales,
            totalEarnings: user.totalEarnings
        }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
    });

    // Get current user
    router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
        .select('-password -emailVerificationToken -resetPasswordToken')
        .populate('wishlist', 'title price images category condition');

        if (!user) {
        return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    });

    // Forgot password
    router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please enter a valid email')
    ], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
        return res.status(404).json({ message: 'No user found with this email address' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        // Send password reset email
        await sendPasswordResetEmail(user, resetToken);

        res.json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    });

    // Reset password
    router.post('/reset-password/:token', [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    });

    // Logout
    router.post('/logout', auth, async (req, res) => {
    try {
        // Clear socket ID
        await User.findByIdAndUpdate(req.user.userId, { $unset: { socketId: 1 } });
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;