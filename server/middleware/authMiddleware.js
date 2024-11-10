function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the route
    }
    res.status(401).json({ message: 'Unauthorized' }); // Send JSON response for unauthorized access
}
// Middleware to define unprotected routes
function publicRoute(req, res, next) {
    const publicRoutes = ['/auth/login', '/auth/signup', '/auth/google', '/auth/google/callback'];
    if (publicRoutes.includes(req.path)) {
        return next(); // If the route is public, allow access
    }
    ensureAuthenticated(req, res, next); // Otherwise, apply authentication check
}

module.exports = {
    ensureAuthenticated,
    publicRoute
};
