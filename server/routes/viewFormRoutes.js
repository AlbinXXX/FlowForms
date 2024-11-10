// routes/viewFormRoutes.js

const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController'); // Controller for form operations
const { ensureAuthenticated } = require('../middleware/authMiddleware'); // Middleware to protect routes

/**
 * @swagger
 * /forms/create:
 *   get:
 *     summary: Render the Create New Form page
 *     description: Render the Create New Form page
 *     tags:
 *       - View Forms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: HTML content of the create form page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       '401':
 *         description: Unauthorized
 */
router.get('/create', ensureAuthenticated, formController.renderCreateForm);

/**
 * @swagger
 * /forms/dashboard:
 *   get:
 *     summary: Render the User Dashboard showing all forms and projects
 *     description: Render the User Dashboard showing all forms and projects
 *     tags:
 *       - View Forms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: HTML content of the dashboard page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       '401':
 *         description: Unauthorized
 */
router.get('/dashboard', ensureAuthenticated, formController.renderDashboard);

/**
 * @swagger
 * /forms/{id}/submissions:
 *   get:
 *     summary: Render the Submissions page for a specific form
 *     description: Render the Submissions page for a specific form
 *     tags:
 *       - View Forms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Form ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: HTML content of the submissions page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Not Found
 */
router.get('/:id/submissions', ensureAuthenticated, formController.renderViewSubmissions);

/**
 * @swagger
 * /forms/{id}/embed:
 *   get:
 *     summary: Render the Embeddable Form for a specific form
 *     description: Render the Embeddable Form for a specific form
 *     tags:
 *       - View Forms
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Form ID
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: HTML content of the embeddable form
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       '404':
 *         description: Not Found
 */
router.get('/:id/embed', formController.renderEmbeddableForm);

/**
 * Additional View Routes can be added here following the same pattern
 * Example:
 * router.get('/:id/edit', ensureAuthenticated, formController.renderEditForm);
 */

module.exports = router;
