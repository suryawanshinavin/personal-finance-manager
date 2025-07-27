const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Account = require('./account');

const transactions = sequelize.define('transactions', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    accountId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    date: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
});

// Relations
transactions.belongsTo(User, { foreignKey: 'userId' });
transactions.belongsTo(Account, { foreignKey: 'accountId' });

module.exports = transactions;
