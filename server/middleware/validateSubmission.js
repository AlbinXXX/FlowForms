// middleware/validateSubmission.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { body, validationResult } = require('express-validator');

// Middleware to validate submissions based on form.fields
const validateSubmission = async (req, res, next) => {
    const { token } = req.params;

    try {
        // Fetch the form using the token
        const form = await prisma.form.findUnique({
            where: { token },
        });

        if (!form) {
            return res.status(404).json({ error: 'Form not found.' });
        }

        const validationRules = [];

        if (Array.isArray(form.fields)) {
            form.fields.forEach(field => {
                if (field.required) {
                    validationRules.push(
                        body(field.name)
                            .notEmpty()
                            .withMessage(`${field.label} is required`)
                    );
                }
                if (field.type === 'email') {
                    validationRules.push(
                        body(field.name)
                            .isEmail()
                            .withMessage(`${field.label} must be a valid email`)
                    );
                }
                // Add more validations based on field.type as needed
            });
        }

        // Apply all validation rules
        await Promise.all(validationRules.map(rule => rule.run(req)));

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        next();
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ error: 'Server error during validation.' });
    }
};

module.exports = {
    validateSubmission,
};
