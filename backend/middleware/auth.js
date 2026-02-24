const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

exports.generateToken = (userId) => jwt.sign({ id: userId }, SECRET, { expiresIn: '7d' });

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    try {
        req.userId = jwt.verify(token, SECRET).id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
