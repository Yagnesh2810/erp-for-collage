"use strict";
//path: backend/src/controllers/taskController.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatus = exports.addTimelineEntry = exports.getTaskTimeline = exports.getTaskStats = exports.addTaskComment = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTaskById = exports.getAllTasks = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const Project_1 = __importDefault(require("../models/Project"));
const timelineHelper_1 = require("../utils/timelineHelper");
const emitProjectStats = async () => {
    try {
        const totalProjects = await Project_1.default.countDocuments();
        const activeProjects = await Project_1.default.countDocuments({ status: 'active' });
        const completedProjects = await Project_1.default.countDocuments({ status: 'completed' });
        const overdueTasks = await Task_1.default.countDocuments({
            dueDate: { $lt: new Date() },
            status: { $ne: 'completed' }
        });
        const stats = {
            totalProjects,
            activeProjects,
            completedProjects,
            overdueTasks,
            totalTasks: await Task_1.default.countDocuments(),
            completedTasks: await Task_1.default.countDocuments({ status: 'completed' })
        };
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('project:stats', stats);
    }
    catch (error) {
        console.error('Error emitting project stats:', error);
    }
};
const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task_1.default.find()
            .populate('project', 'name')
            .populate('assignedTo', 'firstName lastName')
            .populate('assignedBy', 'firstName lastName');
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
};
exports.getAllTasks = getAllTasks;
const getTaskById = async (req, res) => {
    try {
        const task = await Task_1.default.findById(req.params.id)
            .populate('project', 'name')
            .populate('assignedTo', 'firstName lastName')
            .populate('assignedBy', 'firstName lastName')
            .populate('comments.user', 'firstName lastName');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching task', error });
    }
};
exports.getTaskById = getTaskById;
const createTask = async (req, res) => {
    try {
        const task = new Task_1.default(req.body);
        await task.save();
        await task.populate('project', 'name');
        await task.populate('assignedTo', 'firstName lastName');
        await task.populate('assignedBy', 'firstName lastName');
        // Safely get assignedBy ID
        const assignedById = task.assignedBy ?
            (task.assignedBy._id?.toString() || task.assignedBy.toString()) :
            req.body.assignedBy;
        if (!assignedById) {
            return res.status(400).json({ message: 'AssignedBy user is required for timeline event' });
        }
        await (0, timelineHelper_1.createTimelineEvent)('task', task._id.toString(), 'created', 'Task Created', `Task "${task.title}" was created`, assignedById);
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('task:created', task);
        await emitProjectStats();
        res.status(201).json(task);
    }
    catch (error) {
        console.error('Error creating task:', error);
        res.status(400).json({ message: 'Error creating task', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const oldTask = await Task_1.default.findById(req.params.id);
        if (!oldTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const task = await Task_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('project', 'name')
            .populate('assignedTo', 'firstName lastName')
            .populate('assignedBy', 'firstName lastName');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // Safely get user ID for timeline
        const updatedBy = req.body.updatedBy ||
            (task.assignedBy ? task.assignedBy._id?.toString() || task.assignedBy.toString() : null);
        if (!updatedBy) {
            return res.status(400).json({ message: 'Unable to determine user for timeline event' });
        }
        if (oldTask.status !== task.status) {
            await (0, timelineHelper_1.createTimelineEvent)('task', task._id.toString(), 'status_changed', 'Status Updated', `Task status changed from "${oldTask.status}" to "${task.status}"`, updatedBy, {
                field: 'status',
                oldValue: oldTask.status,
                newValue: task.status
            });
        }
        else {
            await (0, timelineHelper_1.createTimelineEvent)('task', task._id.toString(), 'updated', 'Task Updated', `Task "${task.title}" was updated`, updatedBy);
        }
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('task:updated', task);
        await emitProjectStats();
        res.json(task);
    }
    catch (error) {
        console.error('Error updating task:', error);
        res.status(400).json({ message: 'Error updating task', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const task = await Task_1.default.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // Safely get assignedBy ID
        const assignedById = task.assignedBy ? task.assignedBy.toString() : null;
        if (assignedById) {
            await (0, timelineHelper_1.createTimelineEvent)('task', req.params.id, 'deleted', 'Task Deleted', `Task "${task.title}" was deleted`, assignedById);
        }
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('task:deleted', { id: req.params.id });
        await emitProjectStats();
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Error deleting task', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.deleteTask = deleteTask;
const addTaskComment = async (req, res) => {
    try {
        const { comment, user } = req.body;
        if (!comment || !user) {
            return res.status(400).json({ message: 'Comment and user are required' });
        }
        const task = await Task_1.default.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        task.comments.push({ user, comment, createdAt: new Date() });
        await task.save();
        await task.populate('comments.user', 'firstName lastName');
        try {
            await (0, timelineHelper_1.createTimelineEvent)('task', req.params.id, 'comment_added', 'Comment Added', comment, user);
        }
        catch (timelineError) {
            console.error('Timeline event creation failed:', timelineError);
            // Continue execution even if timeline fails
        }
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('task:comment:added', { taskId: req.params.id, comment: task.comments[task.comments.length - 1] });
        res.json(task);
    }
    catch (error) {
        console.error('Error adding comment:', error);
        res.status(400).json({ message: 'Error adding comment', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.addTaskComment = addTaskComment;
const getTaskStats = async (req, res) => {
    try {
        const { getTaskStats } = await Promise.resolve().then(() => __importStar(require('../utils/taskUtils')));
        const stats = await getTaskStats();
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching task stats', error });
    }
};
exports.getTaskStats = getTaskStats;
const getTaskTimeline = async (req, res) => {
    try {
        // Validate that the task exists
        const task = await Task_1.default.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const timeline = await (0, timelineHelper_1.getEntityTimeline)('task', req.params.id);
        res.json(timeline);
    }
    catch (error) {
        console.error('Error fetching task timeline:', error);
        res.status(500).json({ message: 'Error fetching task timeline', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getTaskTimeline = getTaskTimeline;
const addTimelineEntry = async (req, res) => {
    try {
        const { type, description, user } = req.body;
        if (!type || !description || !user) {
            return res.status(400).json({ message: 'Type, description, and user are required' });
        }
        // Validate that the task exists
        const task = await Task_1.default.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        await (0, timelineHelper_1.createTimelineEvent)('task', req.params.id, type, 'Manual Entry', description, user);
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('task:timeline:added', {
            taskId: req.params.id,
            entry: { type, description, user, timestamp: new Date() }
        });
        res.json({ message: 'Timeline entry added successfully' });
    }
    catch (error) {
        console.error('Error adding timeline entry:', error);
        res.status(400).json({ message: 'Error adding timeline entry', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.addTimelineEntry = addTimelineEntry;
const updateTaskStatus = async (req, res) => {
    try {
        const { status, user } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        const task = await Task_1.default.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const oldStatus = task.status;
        task.status = status;
        await task.save();
        await task.populate('project', 'name');
        await task.populate('assignedTo', 'firstName lastName');
        await task.populate('assignedBy', 'firstName lastName');
        // Safely get user ID
        const userId = user || (task.assignedBy ?
            (task.assignedBy._id?.toString() || task.assignedBy.toString()) :
            null);
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required for timeline event' });
        }
        try {
            await (0, timelineHelper_1.createTimelineEvent)('task', task._id.toString(), 'status_changed', 'Status Updated', `Task status changed from "${oldStatus}" to "${status}"`, userId, {
                field: 'status',
                oldValue: oldStatus,
                newValue: status
            });
        }
        catch (timelineError) {
            console.error('Timeline event creation failed:', timelineError);
            // Continue execution even if timeline fails
        }
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('task:status:updated', task);
        await emitProjectStats();
        res.json(task);
    }
    catch (error) {
        console.error('Error updating task status:', error);
        res.status(400).json({ message: 'Error updating task status', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.updateTaskStatus = updateTaskStatus;
