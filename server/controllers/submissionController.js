// controllers/submissionController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('../services/emailService');

// Handle form submission by token
exports.submitFormByToken = async (req, res) => {
    const { token } = req.params; // Submission token
    const submissionData = req.body;

    try {
        // Validate that the form exists
        const form = await prisma.form.findUnique({
            where: { token: token },
            include: { user: true },
        });

        if (!form) {
            return res.status(404).json({ error: 'Form not found.' });
        }

        // Optional: Validate submissionData against form.fields
        // Implement field validation based on form.fields JSON

        // Save submission to the database
        const submission = await prisma.submission.create({
            data: {
                form: { connect: { id: form.id } },
                data: submissionData,
            },
        });

        // Optionally send an email notification to the form creator
        if (form.user && form.user.email) {
            await emailService.sendSubmissionEmail(form, submission);
        }

        res.status(201).json({ message: 'Form submitted successfully.' });
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ error: 'Failed to submit form.' });
    }
};

// Get submissions for a specific form (Protected Route)
exports.getFormSubmissions = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId; // Assuming userId is set by the authentication middleware

    try {
        // Verify that the form exists and belongs to the current user
        const form = await prisma.form.findUnique({
            where: { id: parseInt(id) },
        });

        if (!form) {
            req.flash('error_msg', 'Form not found');
            return res.redirect('/dashboard');
        }

        if (form.userId !== userId) {
            req.flash('error_msg', 'User not authorized to view submissions for this form.');
            return res.redirect('/dashboard');
        }

        // Fetch submissions
        const submissions = await prisma.submission.findMany({
            where: { formId: form.id },
            orderBy: { submittedAt: 'desc' },
        });

        res.render('viewSubmissions', { title: `Submissions for ${form.title}`, form, submissions });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        req.flash('error_msg', 'Server error while fetching submissions.');
        res.redirect('/dashboard');
    }
};
