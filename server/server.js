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
const exphbs = require('express-handlebars'); // Import express-handlebars

const app = express();
const port = process.env.PORT || 5000;

const setUserId = require('./middleware/setUserId');

app.use(morgan('combined'));

const moment = require('moment'); // For date formatting

app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main', // Specify default layout
    layoutsDir: path.join(__dirname, 'views', 'layouts'), // Layouts directory
    partialsDir: path.join(__dirname, 'views', 'partials'), // Partials directory
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
app.set("views", path.join(__dirname, "views"));

console.log(process.env.CLIENT_ORIGIN);
// CORS options
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:8080",
  credentials: true,
};

// Middleware for logging requests
app.use((req, res, next) => {
  const now = new Date();
  console.log(`${now.toISOString()} - ${req.method} request for '${req.url}'`);
  next();
});


// Middleware
app.use(methodOverride('_method')); // Add this line
app.use(cors(corsOptions));
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data
app.use(
    session({
        store: new PgSession({
            conString: process.env.DATABASE_URL, // Connection string for PostgreSQL
        }),
        secret: process.env.SESSION_SECRET || 'your-secret-key', // Use a strong, unique secret in production
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // Optional: 1-week expiration for sessions
            secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS in production
        },
    })
);
app.use((req, res, next) => {
    if (req.path.match(/^\/api\/forms\/\d+\/submissions$/) && req.method === 'POST') {
        // Allow all origins for form submissions
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'POST');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
    }
    next();
});
// Session middleware configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Use true for HTTPS
  })
);
// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Passport middleware (make sure this is after session middleware)
app.use(passport.initialize());
app.use(passport.session());
app.use(setUserId);

// Import and use centralized routes after initializing Passport
loadRoutes(app);

// Start server
async function startServer() {
  try {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(
        `Swagger Docs are available at http://localhost:${port}/api-docs`
      );
    });
  } catch (error) {
    console.error("Database connection failed. Server not started:", error);
  }
}

startServer();
