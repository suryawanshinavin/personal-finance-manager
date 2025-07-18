const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/authMiddleware');
const Account = require('../models/account');

// View accounts
router.get('/', isAuthenticated, async (req, res) => {
    const accounts = await Account.findAll({ where: { userId: req.session.userId } });
    res.render('accounts/add', { title: 'My Accounts', accounts });
});

// Add account
router.post('/add', isAuthenticated, async (req, res) => {
    const { name, type, balance } = req.body;
    await Account.create({
        userId: req.session.userId,
        name,
        type,
        balance,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    res.redirect('/accounts');
});

// Delete account
router.post('/delete/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    await Account.destroy({ where: { id, userId: req.session.userId } });
    res.redirect('/accounts');
});

module.exports = router;
