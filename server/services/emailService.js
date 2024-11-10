// services/emailService.js

const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can use other services like SendGrid, Mailgun, etc.
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends an email notification to the form creator upon new submission.
 * @param {Object} form - The form object.
 * @param {Object} submission - The submission object.
 */
exports.sendSubmissionEmail = async (form, submission) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: form.user.email, // Send to the form creator's email
        subject: `New Submission for Your Form: ${form.title}`,
        text: `You have received a new submission for your form "${form.title}".\n\nSubmission Details:\n${JSON.stringify(submission.data, null, 2)}\n\nSubmitted At: ${submission.submittedAt}`,
        // You can also use HTML content by adding an 'html' property
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Submission email sent successfully.');
    } catch (error) {
        console.error('Error sending submission email:', error);
    }
};
