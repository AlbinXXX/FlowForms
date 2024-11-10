
// controllers/authController.js

const passport = require('passport');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Render Login Page
exports.renderLogin = (req, res) => {
    res.render('login', { title: 'Login' });
};

// Render Signup Page
exports.renderSignup = (req, res) => {
    res.render('signup', { title: 'Signup' });
};

// Handle Signup Logic
exports.signup = async (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // Basic validation
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('signup', {
            title: 'Signup',
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (user) {
                errors.push({ msg: 'Email is already registered' });
                res.render('signup', {
                    title: 'Signup',
                    errors,
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                await prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword
                    }
                });
                req.flash('success_msg', 'You are now registered and can log in');
                res.redirect('/api/auth/login');
            }
        } catch (error) {
            console.error(error);
            res.render('signup', {
                title: 'Signup',
                errors: [{ msg: 'Server error' }],
                name,
                email,
                password,
                password2
            });
        }
    }
};

// Handle Login Logic
exports.login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/api/auth/login',
        failureFlash: true
    })(req, res, next);
};

// Handle Logout Logic
exports.logout = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/api/auth/login');
    });
};
