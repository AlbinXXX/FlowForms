// controllers/projectController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new Project
exports.createProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.userId; // Assuming userId is set by the authentication middleware

        // Simple validation
        if (!name) {
            return res.status(400).json({ error: 'Project name is required' });
        }

        // Create the project
        const project = await prisma.project.create({
            data: {
                name,
                description,
                users: {
                    connect: { id: userId },
                },
                manager: {
                    connect: { id: userId }, // Assuming the creator is the manager
                },
            },
            include: {
                users: true,
                manager: true,
                forms: true,
            },
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all Projects for the current user
exports.getAllProjects = async (req, res) => {
    try {
        const userId = req.userId; // Assuming userId is set by the authentication middleware

        const projects = await prisma.project.findMany({
            where: {
                users: {
                    some: {
                        id: userId,
                    },
                },
            },
            include: {
                forms: true,
                users: true,
                manager: true,
            },
        });

        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get a Project by ID for the current user
exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const project = await prisma.project.findUnique({
            where: { id: parseInt(id) },
            include: {
                forms: true,
                users: true,
                manager: true,
            },
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if the project is associated with the current user
        const isUserAuthorized = project.users.some(user => user.id === userId);
        if (!isUserAuthorized) {
            return res.status(403).json({ error: 'User not authorized to access this project' });
        }

        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update a Project if it belongs to the current user
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const userId = req.userId;

        // Fetch the project to check ownership
        const project = await prisma.project.findUnique({
            where: { id: parseInt(id) },
            include: { users: true },
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if the project is associated with the current user
        const isUserAuthorized = project.users.some(user => user.id === userId);
        if (!isUserAuthorized) {
            return res.status(403).json({ error: 'User not authorized to update this project' });
        }

        // Update the project
        const updatedProject = await prisma.project.update({
            where: { id: parseInt(id) },
            data: {
                name: name || project.name,
                description: description || project.description,
            },
            include: {
                forms: true,
                users: true,
                manager: true,
            },
        });

        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a Project if it belongs to the current user
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Fetch the project to check ownership
        const project = await prisma.project.findUnique({
            where: { id: parseInt(id) },
            include: { users: true },
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if the project is associated with the current user
        const isUserAuthorized = project.users.some(user => user.id === userId);
        if (!isUserAuthorized) {
            return res.status(403).json({ error: 'User not authorized to delete this project' });
        }

        // Delete the project (and cascade delete forms if configured in Prisma)
        await prisma.project.delete({
            where: { id: parseInt(id) },
        });

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: error.message });
    }
};
