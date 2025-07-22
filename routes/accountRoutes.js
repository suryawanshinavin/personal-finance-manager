const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/authMiddleware');
const Account = require('../models/account');
const sequelize = require('../config/database');


// View accounts
router.get('/', isAuthenticated, async (req, res) => {

    // const sampleAccounts = [
    //     {
    //         id: 1,
    //         name: "Savings Account",
    //         number: "1234567890",
    //         type: "Savings",
    //         balance: "$10,000"
    //     },
    //     {
    //         id: 2,
    //         name: "Cash Wallet",
    //         number: "N/A",
    //         type: "Cash",
    //         balance: "$1,250"
    //     },
    //     {
    //         id: 3,
    //         name: "Paytm Wallet",
    //         number: "paytm-9988776655",
    //         type: "Wallet",
    //         balance: "$430.75"
    //     },
    //     {
    //         id: 4,
    //         name: "Mutual Fund Investment",
    //         number: "MF-34837284",
    //         type: "Investment",
    //         balance: "$7,860"
    //     },
    //     {
    //         id: 5,
    //         name: "Current Account",
    //         number: "0987654321",
    //         type: "Bank",
    //         balance: "$4,320.90"
    //     }
    // ];

    const sampleAccounts = await Account.findAll({ where: { userId: req.session.userId } });

    res.render('accounts/add',
        {
            title: 'Accounts',
            accounts: sampleAccounts
        });
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

    // res.json(req.body);
});


// Delete account
router.post('/delete/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    await Account.destroy({ where: { id, userId: req.session.userId } });
    res.redirect('/accounts');
});

module.exports = router;
