// routes/protected.js
const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const router = express.Router();

// Protected route
router.get('/user', verifyToken, (req, res) => {
    res.json({ message: 'User data', userId: req.user.userId });
});

module.exports = router;
