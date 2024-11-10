// routes/formRoutes.js

const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/forms:
 *   post:
 *     summary: Create a new form associated with a project
 *     description: Create a new form associated with a project
 *     tags:
 *       - Forms
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Form data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FormInput'
 *     responses:
 *       '201':
 *         description: Form created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Form'
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal Server Error
 */
router.post('/', ensureAuthenticated, formController.createForm);

/**
 * @swagger
 * /api/forms:
 *   get:
 *     summary: Get all forms for the authenticated user
 *     description: Retrieve all forms for the authenticated user
 *     tags:
 *       - Forms
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of forms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Form'
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal Server Error
 */
router.get('/', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.userId;
        const forms = await prisma.form.findMany({
            where: { userId: userId },
            include: { project: true, submissions: true },
        });

        res.json(forms);
    } catch (error) {
        console.error('Error fetching forms:', error);
        res.status(500).json({ error: 'Failed to fetch forms' });
    }
});

/**
 * @swagger
 * /api/forms/{id}:
 *   get:
 *     summary: Get a specific form by ID for the authenticated user
 *     description: Retrieve a specific form by ID for the authenticated user
 *     tags:
 *       - Forms
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
 *         description: Form details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Form'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Not Found
 *       '500':
 *         description: Internal Server Error
 */
router.get('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const form = await prisma.form.findUnique({
            where: { id: parseInt(id) },
            include: { project: true, submissions: true },
        });

        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        if (form.userId !== userId) {
            return res.status(403).json({ error: 'User not authorized to access this form' });
        }

        res.json(form);
    } catch (error) {
        console.error('Error fetching form:', error);
        res.status(500).json({ error: 'Failed to fetch form' });
    }
});

/**
 * @swagger
 * /api/forms/{id}:
 *   put:
 *     summary: Update a specific form by ID for the authenticated user
 *     description: Update a specific form by ID for the authenticated user
 *     tags:
 *       - Forms
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Form ID
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Updated form data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FormInput'
 *     responses:
 *       '200':
 *         description: Form updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Form'
 *       '400':
 *         description: Bad Request
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Not Found
 *       '500':
 *         description: Internal Server Error
 */
router.put('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, fields } = req.body;
        const userId = req.userId;

        // Fetch the form to check ownership
        const form = await prisma.form.findUnique({
            where: { id: parseInt(id) },
            include: { project: true },
        });

        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        if (form.userId !== userId) {
            return res.status(403).json({ error: 'User not authorized to update this form' });
        }

        // Update the form
        const updatedForm = await prisma.form.update({
            where: { id: parseInt(id) },
            data: {
                title: title || form.title,
                description: description || form.description,
                fields: fields || form.fields,
            },
            include: { project: true },
        });

        res.json(updatedForm);
    } catch (error) {
        console.error('Error updating form:', error);
        res.status(500).json({ error: 'Failed to update form' });
    }
});

/**
 * @swagger
 * /api/forms/{id}:
 *   delete:
 *     summary: Delete a specific form by ID for the authenticated user
 *     description: Delete a specific form by ID for the authenticated user
 *     tags:
 *       - Forms
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
 *         description: Form deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Not Found
 *       '500':
 *         description: Internal Server Error
 */
router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Fetch the form to check ownership
        const form = await prisma.form.findUnique({
            where: { id: parseInt(id) },
        });

        if (!form) {
            return res.status(404).json({ error: 'Form not found' });
        }

        if (form.userId !== userId) {
            return res.status(403).json({ error: 'User not authorized to delete this form' });
        }

        // Delete the form
        await prisma.form.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: 'Form deleted successfully' });
    } catch (error) {
        console.error('Error deleting form:', error);
        res.status(500).json({ error: 'Failed to delete form' });
    }
});

module.exports = router;
