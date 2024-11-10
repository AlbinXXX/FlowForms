// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Limit to 100 requests per hour per IP
const submissionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many submissions from this IP, please try again after an hour.',
    headers: true,
});

module.exports = {
    submissionLimiter,
};
