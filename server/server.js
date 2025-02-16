require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('./config/passport'); // Ensure path is correct
const cors = require('cors');
const { swaggerUi, specs } = require('./swagger');
const loadRoutes = require('./routes/index');
const path = require('path');
const flash = require('connect-flash');
const PgSession = require('connect-pg-simple')(session);
const morgan = require('morgan');
const methodOverride = require('method-override');
const exphbs = require('express-handlebars');

const app = express();
const port = process.env.PORT || 5000;

const setUserId = require('./middleware/setUserId');
const moment = require('moment');

// Logging
app.use(morgan('combined'));

// Handlebars setup
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
        formatDate: function (date) {
            return moment(date).format('MMMM Do YYYY, h:mm:ss a');
        },
        add: function (a, b) {
            return a + b;
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// CORS options
const corsOptions = {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:8080",
    credentials: true,
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Method Override
app.use(methodOverride('_method'));

// Session middleware (unified)
app.use(
    session({
        store: new PgSession({
            conString: process.env.DATABASE_URL, // Connection string for PostgreSQL
        }),
        secret: process.env.SESSION_SECRET || 'your-secret-key', // Use a strong, unique secret in production
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1-week expiration
            secure: process.env.NODE_ENV === 'production', // true if HTTPS in production
        },
    })
);

// Flash messages
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null; // So {{user}} is available in handlebars
    next();
});

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Custom middleware to set req.userId from req.user
app.use(setUserId);

// Log all requests
app.use((req, res, next) => {
    const now = new Date();
    console.log(`${now.toISOString()} - ${req.method} request for '${req.url}'`);
    next();
});

// Make certain form submission routes open to public
app.use((req, res, next) => {
    // e.g., /api/forms/token/:token/submissions
    if (req.path.match(/^\/api\/forms\/token\/[\w]+\/submissions$/) && req.method === 'POST') {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'POST');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
    }
    next();
});

// Load all routes
loadRoutes(app);

// Start server
async function startServer() {
    try {
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            console.log(`Swagger Docs: http://localhost:${port}/api-docs`);
        });
    } catch (error) {
        console.error("Database connection failed. Server not started:", error);
    }
}

startServer();
