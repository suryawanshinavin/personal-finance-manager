const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');

const Account = sequelize.define('Account', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
    },
    note: {
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
Account.belongsTo(User, { foreignKey: 'userId' });

module.exports = Account;
