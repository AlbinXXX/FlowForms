// routes/viewFormRoutes.js

const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /forms/create:
 *   get:
 *     summary: Render the Create New Form page
 *     description: Renders the HTML page that allows an authenticated user to create a new form.
 *                  The page requires a form title, description, and project association (no user-defined fields).
 *     tags:
 *       - View Forms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The HTML page for creating a form.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized access.
 */
router.get('/create', ensureAuthenticated, formController.renderCreateForm);

/**
 * @swagger
 * /forms/dashboard:
 *   get:
 *     summary: Render the User Dashboard
 *     description: Renders the HTML dashboard page for an authenticated user, showing:
 *                  - The user's email
 *                  - List of projects
 *                  - List of forms (with submission endpoint URLs)
 *     tags:
 *       - View Forms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The HTML dashboard page.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized access.
 */
router.get('/dashboard', ensureAuthenticated, formController.renderDashboard);

/**
 * @swagger
 * /forms/{id}/submissions:
 *   get:
 *     summary: Render the Submissions page for a specific form
 *     description: Shows all submissions for the specified form, only accessible by the form owner.
 *     tags:
 *       - View Forms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the form.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The HTML page displaying submissions for the form.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Forbidden access.
 *       404:
 *         description: Form not found.
 */
router.get('/:id/submissions', ensureAuthenticated, formController.renderViewSubmissions);

/**
 * @swagger
 * /forms/{id}/embed:
 *   get:
 *     summary: Render the Embeddable Form
 *     description: Renders an HTML page for embedding the form in external websites.
 *                  This page displays the form for submission. Note: The form does not include predefined fields
 *                  since submissions are accepted as arbitrary JSON.
 *     tags:
 *       - View Forms
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the form to embed.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The embeddable HTML form.
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       404:
 *         description: Form not found.
 */
router.get('/:id/embed', formController.renderEmbeddableForm);

module.exports = router;
