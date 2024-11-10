// routes/index.js

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRouters');
const dbRoutes = require('./dbRoutes');
const apiFormRoutes = require('./formRoutes'); // API routes for form operations
const projectRoutes = require('./projectRoutes');

const viewFormRoutes = require('./viewFormRoutes');
const { ensureAuthenticated } = require("../middleware/authMiddleware");
const { swaggerUi, specs } = require('../swagger'); // Ensure correct path

/**
 * Centralized Route Loader
 * This function takes the Express app instance and mounts all route modules.
 *
 * @param {Express.Application} app - The Express application instance
 */

module.exports = (app) => {
    // Swagger documentation route
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

    // Middleware to protect routes except public submission endpoints
    app.use((req, res, next) => {
        // Define public routes
        const publicRoutes = [
            '/api/auth/login',
            '/api/auth/signup',
            '/api/auth/google',
            '/api/auth/google/callback',
            '/api/auth/status',
        ];

        // Allow token-based form submissions
        if (req.path.match(/^\/api\/forms\/token\/[\w]+\/submissions$/) && req.method === 'POST') {
            return next();
        }

        // Make form submission routes (by ID) public if needed
        if (req.path.match(/^\/api\/forms\/\d+\/submissions$/) && req.method === 'POST') {
            return next();
        }

        // Check if the route is public
        if (publicRoutes.includes(req.path)) {
            return next();
        }

        // Protect all other routes
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

    // Mount API Form Routes
    // All form-related API endpoints will be prefixed with /api/forms
    app.use('/api/forms', apiFormRoutes);

    // Mount View Form Routes
    // All form-related view routes will be prefixed with /forms
    app.use('/forms', viewFormRoutes);

    // Dashboard route (Protected)
    app.get('/dashboard', ensureAuthenticated, async (req, res) => {
        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            const forms = await prisma.form.findMany({
                where: { userId: req.user.id },
                include: { submissions: true },
            });

            res.render('dashboard', { title: 'Dashboard', forms });
        } catch (error) {
            console.error(error);
            req.flash('error_msg', 'Server error while loading dashboard.');
            res.redirect('/');
        }
    });

    // Sample API endpoint
    app.get('/api', (req, res) => {
        res.json({ message: 'Hello From Backend' });
    });
};
