const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/authMiddleware');
const Transaction = require('../models/transactions');
const sequelize = require('../config/database');


// View transactions
router.get('/', isAuthenticated, async (req, res) => {

    res.render('pages/transactions',
        {
            title: 'Transactions',
        });
});

// Add Transaction
router.post('/', isAuthenticated, async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { name, type, balance, note } = req.body;

        // Create Transaction record within a transaction
        const newTransaction = await Transaction.create({
            userId: req.session.userId,
            name,
            type,
            balance: parseFloat(balance),
            note
        }, { transaction: t });

        const lastId = newTransaction.id;

        if (newTransaction) {
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
                    lastId,     // associate_id
                    type,                   // payment_type
                    balance,     // amount as string (because column is varchar)
                    name,                   // purpose
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
            message: 'Transaction created successfully',
            data: newTransaction
        });

    } catch (error) {
        // Rollback on error
        await t.rollback();
        console.error('Transaction creation failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create Transaction',
            error: error.message
        });
    }

});



// GET /transactions/:id
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const Transaction = await Transaction.findByPk(id);

    if (!Transaction) {
        return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.json({ success: true, Transaction });
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

        const Transaction = await Transaction.findOne({
            where: {
                id,
                userId: req.session.userId // Enforce user-level access control
            }
        });

        if (!Transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        // Update values
        Transaction.name = name;
        Transaction.type = type;
        Transaction.balance = parseFloat(balance);
        Transaction.note = note || null;

        await Transaction.save({ transaction: t });
        await t.commit();

        res.json({
            success: true,
            message: 'Transaction updated successfully',
            data: Transaction
        });

    } catch (error) {
        await t.rollback();
        console.error('Transaction update failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update Transaction',
            error: error.message
        });
    }
});


// GET api request
router.get('/api/gettransactions', isAuthenticated, async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            where: { userId: req.session.userId },
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, transactions });
    } catch (err) {
        console.error("Failed to fetch transactions:", err);
        res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }
});



// Delete Transaction
router.post('/delete/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    await Transaction.destroy({ where: { id, userId: req.session.userId } });
    res.redirect('/transactions');
});

module.exports = router;
