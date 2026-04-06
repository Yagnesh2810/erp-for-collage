"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSprintAnalytics = exports.deleteSprint = exports.completeSprint = exports.startSprint = exports.updateSprint = exports.createSprint = exports.getSprintById = exports.getAllSprints = void 0;
const Sprint_1 = __importDefault(require("../../models/it/Sprint"));
const numberGenerator_1 = require("../../utils/numberGenerator");
// Get all sprints
const getAllSprints = async (req, res) => {
    try {
        const { project, status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (project)
            filter.project = project;
        if (status)
            filter.status = status;
        const sprints = await Sprint_1.default.find(filter)
            .populate('project', 'name')
            .populate('tasks', 'title status priority')
            .populate('createdBy', 'name email')
            .sort({ startDate: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Sprint_1.default.countDocuments(filter);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sprints',
            error: error.message,
        });
    }
};
exports.getAllSprints = getAllSprints;
// Get sprint by ID
const getSprintById = async (req, res) => {
    try {
        const sprint = await Sprint_1.default.findById(req.params.id)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sprint',
            error: error.message,
        });
    }
};
exports.getSprintById = getSprintById;
// Create sprint
const createSprint = async (req, res) => {
    try {
        const sprintNumber = await (0, numberGenerator_1.generateSprintNumber)();
        const sprintData = {
            ...req.body,
            sprintNumber,
            createdBy: req.user._id,
        };
        const sprint = await Sprint_1.default.create(sprintData);
        res.status(201).json({
            success: true,
            message: 'Sprint created successfully',
            data: sprint,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating sprint',
            error: error.message,
        });
    }
};
exports.createSprint = createSprint;
// Update sprint
const updateSprint = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: req.user._id,
        };
        const sprint = await Sprint_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating sprint',
            error: error.message,
        });
    }
};
exports.updateSprint = updateSprint;
// Start sprint
const startSprint = async (req, res) => {
    try {
        const sprint = await Sprint_1.default.findById(req.params.id);
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
        sprint.updatedBy = req.user._id;
        await sprint.save();
        res.json({
            success: true,
            message: 'Sprint started successfully',
            data: sprint,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error starting sprint',
            error: error.message,
        });
    }
};
exports.startSprint = startSprint;
// Complete sprint
const completeSprint = async (req, res) => {
    try {
        const sprint = await Sprint_1.default.findById(req.params.id).populate('tasks');
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
        sprint.updatedBy = req.user._id;
        // Calculate final velocity
        const tasks = sprint.tasks;
        const completedPoints = tasks
            .filter((task) => task.status === 'COMPLETED')
            .reduce((sum, task) => sum + (task.storyPoints || 0), 0);
        sprint.completedPoints = completedPoints;
        sprint.velocity = completedPoints;
        await sprint.save();
        res.json({
            success: true,
            message: 'Sprint completed successfully',
            data: sprint,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error completing sprint',
            error: error.message,
        });
    }
};
exports.completeSprint = completeSprint;
// Delete sprint
const deleteSprint = async (req, res) => {
    try {
        const sprint = await Sprint_1.default.findByIdAndDelete(req.params.id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting sprint',
            error: error.message,
        });
    }
};
exports.deleteSprint = deleteSprint;
// Get sprint analytics
const getSprintAnalytics = async (req, res) => {
    try {
        const { project } = req.query;
        const filter = {};
        if (project)
            filter.project = project;
        const totalSprints = await Sprint_1.default.countDocuments(filter);
        const activeSprints = await Sprint_1.default.countDocuments({ ...filter, status: 'ACTIVE' });
        const completedSprints = await Sprint_1.default.countDocuments({ ...filter, status: 'COMPLETED' });
        const avgVelocity = await Sprint_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sprint analytics',
            error: error.message,
        });
    }
};
exports.getSprintAnalytics = getSprintAnalytics;
