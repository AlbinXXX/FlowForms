// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require("../config/passport");

// Render Login Page
router.get('/login', authController.renderLogin);

// Render Signup Page
router.get('/signup', authController.renderSignup);

// Handle Signup Logic
router.post('/signup', authController.signup);

// Handle Login Logic
router.post('/login', authController.login);

// Handle Logout Logic
router.get('/logout', authController.logout);

// Google OAuth Routes (if applicable)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/api/auth/login', failureFlash: true }),
    (req, res) => {
      res.redirect('/dashboard');
    }
);

module.exports = router;

