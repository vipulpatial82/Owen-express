const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

exports.googleAuth = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
        let user = await User.findOne({ email: email.toLowerCase() });
        let isNewUser = false;
        if (!user) {
            user = await User.create({
                name,
                email: email.toLowerCase(),
                password: 'google-oauth',
                isGoogleUser: true,
                isNewUser: true
            });
            isNewUser = true;
        } else {
            isNewUser = user.isNewUser === true;
        }
        res.json({ token: generateToken(user._id), user: { name: user.name, email: user.email, isAdmin: false, isNewUser } });
    } catch {
        res.status(500).json({ message: 'Google authentication failed' });
    }
};

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
        if (await User.findOne({ email: email.toLowerCase() })) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email: email.toLowerCase(), password: hashedPassword, isNewUser: true });
        await user.save();
        res.status(201).json({ token: generateToken(user._id), user: { name, email: user.email, isNewUser: true } });
    } catch {
        res.status(500).json({ message: 'Signup failed' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        if (email.toLowerCase() === 'admin@gmail.com' && password === 'admin@123') {
            return res.json({ token: generateToken('admin'), user: { name: 'Admin', email: 'admin@gmail.com', isAdmin: true, isNewUser: false } });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || user.isGoogleUser) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({ token: generateToken(user._id), user: { name: user.name, email: user.email, isAdmin: false, isNewUser: user.isNewUser === true } });
    } catch {
        res.status(500).json({ message: 'Login failed' });
    }
};

exports.verifyAuth = async (req, res) => {
    try {
        if (req.userId === 'admin') {
            return res.json({ user: { name: 'Admin', email: 'admin@gmail.com', isAdmin: true, isNewUser: false } });
        }
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user: { name: user.name, email: user.email, isAdmin: false, isNewUser: user.isNewUser === true } });
    } catch (error) {
        res.status(500).json({ message: 'Verification failed' });
    }
};

exports.dismissWelcomeCoupon = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.userId, { isNewUser: false }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Welcome coupon dismissed successfully', user: { name: user.name, email: user.email, isAdmin: false, isNewUser: false } });
    } catch {
        res.status(500).json({ message: 'Failed to dismiss welcome coupon' });
    }
};
