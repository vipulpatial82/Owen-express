const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ token: generateToken(user._id), user: { name, email } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (email === 'admin@gmail.com' && password === 'admin123') {
            return res.json({ token: generateToken('admin'), user: { name: 'Admin', email, isAdmin: true } });
        }
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        res.json({ token: generateToken(user._id), user: { name: user.name, email, isAdmin: false } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyAuth = async (req, res) => {
    try {
        if (req.userId === 'admin') {
            return res.json({ user: { name: 'Admin', email: 'admin@gmail.com', isAdmin: true } });
        }
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user: { name: user.name, email: user.email, isAdmin: false } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
