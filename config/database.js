// config/database.js

const { Sequelize } = require("sequelize");

// Set up the MySQL connection using Sequelize
const sequelize = new Sequelize(
    "personal_finance_manager_nodejs",
    "root",
    "",
    {
        host: "localhost",
        dialect: "mysql",
    }
);

module.exports = sequelize;
