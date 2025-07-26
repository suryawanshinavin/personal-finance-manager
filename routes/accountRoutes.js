const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/authMiddleware');
const Account = require('../models/account');
const sequelize = require('../config/database');


// View accounts
router.get('/', isAuthenticated, async (req, res) => {
    const sampleAccounts = await Account.findAll({ where: { userId: req.session.userId } });

    res.render('accounts/add',
        {
            title: 'Accounts',
            accounts: sampleAccounts
        });
});

// GET /accounts/:id
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const account = await Account.findByPk(id);

    if (!account) {
        return res.status(404).json({ success: false, message: "Account not found" });
    }

    res.json({ success: true, account });
});


// Add account
router.post('/', isAuthenticated, async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { name, type, balance, note } = req.body;

        // Create account record within a transaction
        const newAccount = await Account.create({
            userId: req.session.userId,
            name,
            type,
            balance: parseFloat(balance),
            note
        }, { transaction: t });

        // Commit transaction
        await t.commit();

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: newAccount
        });

    } catch (error) {
        // Rollback on error
        await t.rollback();
        console.error('Account creation failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create account',
            error: error.message
        });
    }

});

router.put('/:id', isAuthenticated, async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { id } = req.params;
        const { name, type, balance, note } = req.body;

        // Validate
        if (!name || !type || isNaN(parseFloat(balance))) {
            return res.status(400).json({
                success: false,
                message: 'Name, type, and valid balance are required'
            });
        }

        const account = await Account.findOne({
            where: {
                id,
                userId: req.session.userId // Enforce user-level access control
            }
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        // Update values
        account.name = name;
        account.type = type;
        account.balance = parseFloat(balance);
        account.note = note || null;

        await account.save({ transaction: t });
        await t.commit();

        res.json({
            success: true,
            message: 'Account updated successfully',
            data: account
        });

    } catch (error) {
        await t.rollback();
        console.error('Account update failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update account',
            error: error.message
        });
    }
});


// GET /accounts/list
router.get('/list', isAuthenticated, async (req, res) => {
    try {
        const accounts = await Account.findAll({
            where: { userId: req.session.userId },
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, accounts });
    } catch (err) {
        console.error("Failed to fetch accounts:", err);
        res.status(500).json({ success: false, message: 'Failed to fetch accounts' });
    }
});



// Delete account
router.post('/delete/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    await Account.destroy({ where: { id, userId: req.session.userId } });
    res.redirect('/accounts');
});

module.exports = router;
