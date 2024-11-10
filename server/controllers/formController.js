// controllers/formController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

/**
 * Render the Create New Form page
 */
exports.renderCreateForm = async (req, res) => {
    try {
        const userId = req.userId;
        const projects = await prisma.project.findMany({
            where: { users: { some: { id: userId } } },
        });

        if (projects.length === 0) {
            req.flash('error_msg', 'Please create a project before adding forms.');
            return res.redirect('/forms/dashboard');
        }

        res.render('createForm', {
            title: 'Create New Form',
            projects,
        });
    } catch (error) {
        console.error('Error rendering create form page:', error);
        req.flash('error_msg', 'Unable to load the form creation page.');
        res.redirect('/forms/dashboard');
    }
};

/**
 * Handle creating a new form
 */
exports.createForm = async (req, res) => {
    try {
        const { title, description, projectId, fields } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!title || !projectId) {
            req.flash('error_msg', 'Form title and associated project are required');
            return res.redirect('/forms/create');
        }

        // Check if the project exists and belongs to the user
        const project = await prisma.project.findUnique({
            where: { id: parseInt(projectId) },
        });

        if (!project) {
            req.flash('error_msg', 'Selected project does not exist');
            return res.redirect('/forms/create');
        }

        const isUserAuthorized = project.users.some(user => user.id === userId);
        if (!isUserAuthorized) {
            req.flash('error_msg', 'You are not authorized to add a form to this project');
            return res.redirect('/forms/create');
        }

        // Generate a unique token for the form
        const token = crypto.randomBytes(16).toString('hex');

        // Create the form
        await prisma.form.create({
            data: {
                title,
                description,
                fields: fields, // Assuming fields is already a JSON object/string
                token,
                project: { connect: { id: parseInt(projectId) } },
                user: { connect: { id: userId } },
            },
        });

        req.flash('success_msg', 'Form created successfully');
        res.redirect('/forms/dashboard');
    } catch (error) {
        console.error('Error creating form:', error);
        req.flash('error_msg', 'Failed to create form');
        res.redirect('/forms/create');
    }
};

/**
 * Render the Dashboard page showing all forms and projects
 */
exports.renderDashboard = async (req, res) => {
    try {
        const userId = req.userId;

        // Fetch all forms created by the user
        const forms = await prisma.form.findMany({
            where: { userId: userId },
            include: { submissions: true, project: true },
        });

        // Fetch all projects associated with the user
        const projects = await prisma.project.findMany({
            where: { users: { some: { id: userId } } },
            include: { forms: true },
        });

        // Parse fields from JSON string to object for each form
        const parsedForms = forms.map(form => ({
            ...form,
            fields: typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields,
        }));

        res.render('dashboard', {
            title: 'Dashboard',
            forms: parsedForms,
            projects: projects,
        });
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        req.flash('error_msg', 'Server error while loading dashboard.');
        res.redirect('/');
    }
};

/**
 * Render the Submissions page for a specific form
 */
exports.renderViewSubmissions = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        // Verify that the form exists and belongs to the current user
        const form = await prisma.form.findUnique({
            where: { id: parseInt(id) },
            include: { submissions: true, project: true },
        });

        if (!form) {
            req.flash('error_msg', 'Form not found');
            return res.redirect('/forms/dashboard');
        }

        if (form.userId !== userId) {
            req.flash('error_msg', 'User not authorized to view submissions for this form.');
            return res.redirect('/forms/dashboard');
        }

        // Fetch submissions
        const submissions = await prisma.submission.findMany({
            where: { formId: form.id },
            orderBy: { submittedAt: 'desc' },
        });

        // Parse submission data from JSON string to object
        const parsedSubmissions = submissions.map(sub => ({
            ...sub,
            data: typeof sub.data === 'string' ? JSON.parse(sub.data) : sub.data,
        }));

        // Parse form fields from JSON string to object
        const parsedForm = {
            ...form,
            fields: typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields,
        };

        res.render('viewSubmissions', {
            title: `Submissions for ${form.title}`,
            form: parsedForm,
            submissions: parsedSubmissions
        });
    } catch (error) {
        console.error('Error rendering submissions:', error);
        req.flash('error_msg', 'Server error while fetching submissions.');
        res.redirect('/forms/dashboard');
    }
};

/**
 * Render the Embeddable Form for a specific form
 */
exports.renderEmbeddableForm = async (req, res) => {
    const { id } = req.params;

    try {
        const form = await prisma.form.findUnique({
            where: { id: parseInt(id) },
            include: { user: true },
        });

        if (!form) {
            return res.status(404).send('Form not found.');
        }

        const parsedFields = typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields;

        res.render('embedForm', {
            formId: form.id,
            formTitle: form.title,
            formDescription: form.description,
            fields: parsedFields,
        });
    } catch (error) {
        console.error('Error rendering embeddable form:', error);
        res.status(500).send('Failed to render form.');
    }
};
