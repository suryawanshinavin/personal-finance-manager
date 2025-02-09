const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const winston = require('winston');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth'); // Authentication routes
const generalHelper = require('./helpers/generalHelper');  // Import your generalHelper


dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json()); // Body parsing middleware
app.use(cookieParser()); // Parse cookies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// 🔹 Morgan: Logs all HTTP requests to access.log
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// 🔹 Winston: Logger for errors
const logger = winston.createLogger({
    level: 'error',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log' })
    ],
});

app.use(express.static('public'));

// Make the helper available globally for all views
app.use((req, res, next) => {
    res.locals.generalHelper = generalHelper;  // Make generalHelper available globally for all views
    next();
});

app.use((req, res, next) => {
    res.locals.siteName = 'Personal Finance Manager';  // Ensure siteName is globally available
    next();
});


// Routes
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login', siteName: 'Personal Finance Manager' });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

app.get('/dashboard', (req, res) => {
    if (!req.session.token) {  // Assuming token is stored in session
        return res.redirect('/login'); // Redirect to login if token is not found
    }

    const token = req.session.token;

    if (!token) {
        return res.redirect('/login');
    }

    res.render('dashboard', { 
        title: 'Dashboard',
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');    
});

// API Routes
app.use('/api/auth', authRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    logger.error({ message: err.message, stack: err.stack, url: req.originalUrl });

    // Ensure generalHelper and siteName are passed to the error page
    res.status(500).render('error', {
        title: 'Error',
        siteName: res.locals.siteName,  // Ensure siteName is passed to the error page
        error: err  // Pass the error object with the message and stack trace
    });
});

// Test MySQL connection
sequelize.authenticate()
    .then(() => console.log('✅ MySQL connected'))
    .catch(err => {
        logger.error({ message: 'MySQL connection error', error: err.message });
        console.error('❌ Error connecting to MySQL:', err);
    });

// Sync Sequelize models with the database
sequelize.sync()
    .then(() => console.log('✅ Database synced'))
    .catch(err => {
        logger.error({ message: 'Database sync error', error: err.message });
        console.error('❌ Database sync error:', err);
    });

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
