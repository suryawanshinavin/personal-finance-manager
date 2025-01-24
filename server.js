// server.js

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth'); // Import authentication routes

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Serve static files (CSS, images, etc.) from /public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes for login and register pages
app.get('/login', (req, res) => {
    console.log('Login route accessed'); // Add this log
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Serve Register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/dashboard', (req, res) => {
    // console.log(req.cookies.token);
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');  // Clear the cookie holding the JWT token
    res.redirect('/login');    // Redirect to login page
});

// Authentication API routes
app.use('/api/auth', authRoutes);

// Test MySQL connection
sequelize.authenticate()
    .then(() => {
        console.log('MySQL connected');
    })
    .catch(err => {
        console.error('Error connecting to MySQL:', err);
    });

// Sync Sequelize models with the database
sequelize.sync().then(() => {
    console.log('Database synced');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
