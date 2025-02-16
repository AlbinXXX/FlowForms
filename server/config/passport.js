const { PrismaClient } = require('@prisma/client');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Serialize user by storing the user ID in the session
passport.serializeUser((user, done) => {
    done(null, user.id); // Store user ID instead of email
});

// Deserialize user by fetching user data from Prisma by ID
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user); // Retrieve the full user object by ID
    } catch (error) {
        done(error, null);
    }
});


// Local strategy for email/password authentication
passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        async (email, password, done) => {
            try {
                console.log(`Attempting to log in with email: ${email}`);

                // Query Prisma to find the user by email
                const user = await prisma.user.findUnique({ where: { email } });

                if (!user) {
                    console.log('User not found in Prisma');
                    return done(null, false, { message: 'Incorrect email.' });
                }

                // Compare password with the hashed password stored in Prisma
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    console.log('Password does not match');
                    return done(null, false, { message: 'Incorrect password.' });
                }

                return done(null, user);
            } catch (error) {
                console.error('Error during authentication:', error);
                return done(error);
            }
        }
    )
);

// Google strategy for OAuth authentication
passport.use(
    new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if the user exists in Prisma
                let user = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });

                // If the user doesn't exist, create a new user in Prisma
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            googleId: profile.id,
                            name: profile.displayName,
                            email: profile.emails[0].value,
                        },
                    });
                }

                done(null, user);
            } catch (error) {
                done(error);
            }
        })
);

module.exports = passport;
