import { Request, Response } from 'express';
import Sprint from '../../models/it/Sprint';
import Task from '../../models/Task';
import { generateSprintNumber } from '../../utils/numberGenerator';

// Get all sprints
export const getAllSprints = async (req: Request, res: Response) => {
    try {
        const { project, status, page = 1, limit = 20 } = req.query;

        const filter: any = {};
        if (project) filter.project = project;
        if (status) filter.status = status;

        const sprints = await Sprint.find(filter)
            .populate('project', 'name')
            .populate('tasks', 'title status priority')
            .populate('createdBy', 'name email')
            .sort({ startDate: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Sprint.countDocuments(filter);

        res.json({
            success: true,
            data: sprints,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sprints',
            error: error.message,
        });
    }
};

// Get sprint by ID
export const getSprintById = async (req: Request, res: Response) => {
    try {
        const sprint = await Sprint.findById(req.params.id)
            .populate('project')
            .populate('tasks')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!sprint) {
            return res.status(404).json({
                success: false,
                message: 'Sprint not found',
            });
        }

        res.json({
            success: true,
            data: sprint,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sprint',
            error: error.message,
        });
    }
};

// Create sprint
export const createSprint = async (req: Request, res: Response) => {
    try {
        const sprintNumber = await generateSprintNumber();

        const sprintData = {
            ...req.body,
            sprintNumber,
            createdBy: (req as any).user._id,
        };

        const sprint = await Sprint.create(sprintData);

        res.status(201).json({
            success: true,
            message: 'Sprint created successfully',
            data: sprint,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error creating sprint',
            error: error.message,
        });
    }
};

// Update sprint
export const updateSprint = async (req: Request, res: Response) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: (req as any).user._id,
        };

        const sprint = await Sprint.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('project')
            .populate('tasks');

        if (!sprint) {
            return res.status(404).json({
                success: false,
                message: 'Sprint not found',
            });
        }

        res.json({
            success: true,
            message: 'Sprint updated successfully',
            data: sprint,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error updating sprint',
            error: error.message,
        });
    }
};

// Start sprint
export const startSprint = async (req: Request, res: Response) => {
    try {
        const sprint = await Sprint.findById(req.params.id);

        if (!sprint) {
            return res.status(404).json({
                success: false,
                message: 'Sprint not found',
            });
        }

        if (sprint.status !== 'PLANNED') {
            return res.status(400).json({
                success: false,
                message: 'Only planned sprints can be started',
            });
        }

        sprint.status = 'ACTIVE';
        sprint.updatedBy = (req as any).user._id;
        await sprint.save();

        res.json({
            success: true,
            message: 'Sprint started successfully',
            data: sprint,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error starting sprint',
            error: error.message,
        });
    }
};

// Complete sprint
export const completeSprint = async (req: Request, res: Response) => {
    try {
        const sprint = await Sprint.findById(req.params.id).populate('tasks');

        if (!sprint) {
            return res.status(404).json({
                success: false,
                message: 'Sprint not found',
            });
        }

        if (sprint.status !== 'ACTIVE') {
            return res.status(400).json({
                success: false,
                message: 'Only active sprints can be completed',
            });
        }

        sprint.status = 'COMPLETED';
        sprint.retrospectiveNotes = req.body.retrospectiveNotes || '';
        sprint.updatedBy = (req as any).user._id;

        // Calculate final velocity
        const tasks: any[] = sprint.tasks as any[];
        const completedPoints = tasks
            .filter((task: any) => task.status === 'COMPLETED')
            .reduce((sum: number, task: any) => sum + (task.storyPoints || 0), 0);

        sprint.completedPoints = completedPoints;
        sprint.velocity = completedPoints;

        await sprint.save();

        res.json({
            success: true,
            message: 'Sprint completed successfully',
            data: sprint,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error completing sprint',
            error: error.message,
        });
    }
};

// Delete sprint
export const deleteSprint = async (req: Request, res: Response) => {
    try {
        const sprint = await Sprint.findByIdAndDelete(req.params.id);

        if (!sprint) {
            return res.status(404).json({
                success: false,
                message: 'Sprint not found',
            });
        }

        res.json({
            success: true,
            message: 'Sprint deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error deleting sprint',
            error: error.message,
        });
    }
};

// Get sprint analytics
export const getSprintAnalytics = async (req: Request, res: Response) => {
    try {
        const { project } = req.query;

        const filter: any = {};
        if (project) filter.project = project;

        const totalSprints = await Sprint.countDocuments(filter);
        const activeSprints = await Sprint.countDocuments({ ...filter, status: 'ACTIVE' });
        const completedSprints = await Sprint.countDocuments({ ...filter, status: 'COMPLETED' });

        const avgVelocity = await Sprint.aggregate([
            { $match: { ...filter, status: 'COMPLETED' } },
            { $group: { _id: null, avgVelocity: { $avg: '$velocity' } } },
        ]);

        res.json({
            success: true,
            data: {
                total: totalSprints,
                active: activeSprints,
                completed: completedSprints,
                averageVelocity: avgVelocity[0]?.avgVelocity || 0,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sprint analytics',
            error: error.message,
        });
    }
};
