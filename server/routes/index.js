// routes/index.js

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRouters');
const dbRoutes = require('./dbRoutes');
const apiFormRoutes = require('./formRoutes'); // API routes for form operations
const projectRoutes = require('./projectRoutes');
const { ensureAuthenticated } = require("../middleware/authMiddleware");
const { swaggerUi, specs } = require('../swagger');
const viewFormRoutes = require('./viewFormRoutes');

/**
 * Centralized Route Loader
 */
module.exports = (app) => {
    // Swagger
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

    // Public routes
    const publicRoutes = [
        '/api/auth/login',
        '/api/auth/signup',
        '/api/auth/google',
        '/api/auth/google/callback',
        '/api/auth/status',
    ];

    // Protect routes except for public and certain form submission endpoints
    app.use((req, res, next) => {
        // Allow token-based form submissions
        if (req.path.match(/^\/api\/forms\/token\/[\w]+\/submissions$/) && req.method === 'POST') {
            return next();
        }
        // Also allow /api/forms/:id/submissions if needed
        if (req.path.match(/^\/api\/forms\/\d+\/submissions$/) && req.method === 'POST') {
            return next();
        }
        // Check if the route is public
        if (publicRoutes.includes(req.path)) {
            return next();
        }
        // Otherwise, ensure authentication
        ensureAuthenticated(req, res, next);
    });

    // Database-related routes
    app.use('/api/db', dbRoutes);

    // Authentication routes
    app.use('/api/auth', authRoutes);

    // User-related routes
    app.use('/api/users', userRoutes);

    // Project routes
    app.use('/api/projects', projectRoutes);

    // Form-related API routes
    app.use('/api/forms', apiFormRoutes);

    app.use('/forms', viewFormRoutes);
    // Remove or comment out the inline /dashboard route here
    // so that /forms/dashboard is the canonical route.

    // A sample test route
    app.get('/api', (req, res) => {
        res.json({ message: 'Hello From Backend' });
    });
};
