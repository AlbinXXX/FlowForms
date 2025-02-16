
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
        console.debug('[renderCreateForm] User ID:', userId);
        const projects = await prisma.project.findMany({
            where: { users: { some: { id: userId } } },
        });
        console.debug('[renderCreateForm] Projects found:', projects);

        if (projects.length === 0) {
            req.flash('error_msg', 'Please create a project before adding forms.');
            return res.redirect('/forms/dashboard');
        }

        res.render('createForm', {
            title: 'Create New Form',
            projects,
        });
    } catch (error) {
        console.error('[renderCreateForm] Error rendering create form page:', error);
        req.flash('error_msg', 'Unable to load the form creation page.');
        res.redirect('/forms/dashboard');
    }
};

/**
 * Handle creating a new form with debugging logs
 */
exports.createForm = async (req, res) => {
    try {
        console.debug('[createForm] Received request body:', req.body);
        const { title, description, projectId } = req.body;
        const userId = req.userId;
        console.debug('[createForm] User ID:', userId);

        // Validate required fields
        if (!title || !projectId) {
            console.warn('[createForm] Missing required fields:', { title, projectId });
            req.flash('error_msg', 'Form title and associated project are required');
            return res.redirect('/forms/create');
        }

        // Fetch the project to ensure it exists and belongs to the user
        const project = await prisma.project.findUnique({
            where: { id: parseInt(projectId) },
            include: { users: true },
        });
        console.debug('[createForm] Fetched project:', project);

        if (!project) {
            console.warn('[createForm] Project not found for projectId:', projectId);
            req.flash('error_msg', 'Selected project does not exist');
            return res.redirect('/forms/create');
        }

        // Check if the current user is associated with this project
        const isUserAuthorized = project.users.some(user => user.id === parseInt(userId));
        console.debug('[createForm] isUserAuthorized:', isUserAuthorized);
        if (!isUserAuthorized) {
            console.warn('[createForm] User is not authorized for this project:', { userId, projectId });
            req.flash('error_msg', 'You are not authorized to add a form to this project');
            return res.redirect('/forms/create');
        }

        // Generate a unique token for the form
        const token = crypto.randomBytes(16).toString('hex');
        console.debug('[createForm] Generated token:', token);

        // Create the form
        const createdForm = await prisma.form.create({
            data: {
                title,
                description,
                token,
                project: { connect: { id: parseInt(projectId) } },
                user: { connect: { id: parseInt(userId) } },
            },
        });
        console.debug('[createForm] Form created:', createdForm);

        // Generate the submission endpoint URL
        const submissionUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/forms/token/${token}/submissions`;
        console.debug('[createForm] Submission endpoint URL:', submissionUrl);

        req.flash('success_msg', `Form created successfully. Submission endpoint: ${submissionUrl}`);
        res.redirect('/forms/dashboard');
    } catch (error) {
        console.error('[createForm] Error creating form:', error);
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
        console.debug('[renderDashboard] User ID:', userId);

        // Fetch all forms created by this user
        const forms = await prisma.form.findMany({
            where: { userId: parseInt(userId) },
            include: { submissions: true, project: true },
        });
        console.debug('[renderDashboard] Forms found:', forms);

        // Fetch all projects associated with this user
        const projects = await prisma.project.findMany({
            where: { users: { some: { id: parseInt(userId) } } },
            include: { forms: true },
        });
        console.debug('[renderDashboard] Projects found:', projects);

        // Add submissionUrl for each form
        const updatedForms = forms.map(form => ({
            ...form,
            submissionUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/api/forms/token/${form.token}/submissions`
        }));
        console.debug('[renderDashboard] Updated forms with submissionUrl:', updatedForms);

        res.render('dashboard', {
            title: 'Dashboard',
            forms: updatedForms,
            projects,
        });
    } catch (error) {
        console.error('[renderDashboard] Error rendering dashboard:', error);
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
    console.debug('[renderViewSubmissions] Form ID:', id, 'User ID:', userId);

    try {
        // Verify that the form exists and belongs to the current user
        const form = await prisma.form.findUnique({
            where: { id: parseInt(id) },
            include: { submissions: true, project: true },
        });
        console.debug('[renderViewSubmissions] Fetched form:', form);

        if (!form) {
            req.flash('error_msg', 'Form not found');
            return res.redirect('/forms/dashboard');
        }

        if (form.userId !== parseInt(userId)) {
            req.flash('error_msg', 'User not authorized to view submissions for this form.');
            return res.redirect('/forms/dashboard');
        }

        // Fetch submissions
        const submissions = await prisma.submission.findMany({
            where: { formId: form.id },
            orderBy: { submittedAt: 'desc' },
        });
        console.debug('[renderViewSubmissions] Submissions found:', submissions);

        res.render('viewSubmissions', {
            title: `Submissions for ${form.title}`,
            form,
            submissions
        });
    } catch (error) {
        console.error('[renderViewSubmissions] Error rendering submissions:', error);
        req.flash('error_msg', 'Server error while fetching submissions.');
        res.redirect('/forms/dashboard');
    }
};

/**
 * Render the Embeddable Form for a specific form
 */
exports.renderEmbeddableForm = async (req, res) => {
    const { id } = req.params;
    console.debug('[renderEmbeddableForm] Form ID:', id);

    try {
        const form = await prisma.form.findUnique({
            where: { id: parseInt(id) },
            include: { user: true },
        });
        console.debug('[renderEmbeddableForm] Fetched form:', form);

        if (!form) {
            return res.status(404).send('Form not found.');
        }

        res.render('embedForm', {
            formId: form.id,
            formTitle: form.title,
            formDescription: form.description,
            fields: [], // No user-defined fields in this setup
        });
    } catch (error) {
        console.error('[renderEmbeddableForm] Error rendering embeddable form:', error);
        res.status(500).send('Failed to render form.');
    }
};
