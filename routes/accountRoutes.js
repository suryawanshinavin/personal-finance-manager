const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/authMiddleware');
const Account = require('../models/account');
const sequelize = require('../config/database');


// View accounts
router.get('/', isAuthenticated, async (req, res) => {

    res.render('pages/accounts',
        {
            title: 'Accounts',
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

        const lastId = newAccount.id;

        if (newAccount) {
            const insertTimelineSQL = `
                        INSERT INTO timelines (
                            associate_id,
                            payment_type,
                            amount,
                            purpose,
                            note,
                            created_date,
                            created_time,
                            created_at,
                            created_by,
                            isActive
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

            const now = new Date();
            const created_date = now.toISOString().split('T')[0]; // YYYY-MM-DD
            const created_time = now.toTimeString().split(' ')[0]; // HH:MM:SS
            const created_at = now.toISOString(); // Full ISO timestamp

            await sequelize.query(insertTimelineSQL, {
                replacements: [
                    lastId,                 // associate_id
                    '',                   // payment_type
                    balance,                // amount as string (because column is varchar)
                    'Account_Add',          // purpose
                    note || '',             // note
                    created_date,           // created_date
                    created_time,           // created_time
                    created_at,             // created_at
                    req.session.userId,     // created_by
                    1,                      // isActive (default to true)
                ],
                transaction: t
            });
        }

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



// GET /accounts/:id
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const account = await Account.findByPk(id);

    if (!account) {
        return res.status(404).json({ success: false, message: "Account not found" });
    }

    res.json({ success: true, account });
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
router.get('/api/getAccounts', isAuthenticated, async (req, res) => {
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
