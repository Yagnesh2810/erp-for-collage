"use strict";
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
exports.getProjectTimeline = exports.deleteProjectTask = exports.updateProjectTask = exports.getProjectStats = exports.createProjectTask = exports.getProjectTasks = exports.deleteProject = exports.updateProjectStatus = exports.updateProject = exports.createProject = exports.getProjectById = exports.getAllProjects = void 0;
const Project_1 = __importDefault(require("../models/Project"));
const Task_1 = __importDefault(require("../models/Task"));
const timelineHelper_1 = require("../utils/timelineHelper");
// Socket will be imported dynamically to avoid circular dependency
// Helper function to emit updated project stats
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
const getAllProjects = async (req, res) => {
    try {
        const projects = await Project_1.default.find()
            .populate('manager', 'firstName lastName')
            .populate('team', 'firstName lastName');
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error });
    }
};
exports.getAllProjects = getAllProjects;
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        // Validate project ID format
        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({ message: 'Invalid project ID' });
        }
        // Check if ID is a valid MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid project ID format' });
        }
        const project = await Project_1.default.findById(id)
            .populate('manager', 'firstName lastName')
            .populate('team', 'firstName lastName');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    }
    catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ message: 'Error fetching project', error });
    }
};
exports.getProjectById = getProjectById;
const createProject = async (req, res) => {
    try {
        const project = new Project_1.default(req.body);
        await project.save();
        await project.populate('manager', 'firstName lastName');
        await project.populate('team', 'firstName lastName');
        // Safely get manager ID
        const managerId = project.manager ?
            (project.manager._id?.toString() || project.manager.toString()) :
            req.body.manager;
        if (!managerId) {
            return res.status(400).json({ message: 'Manager is required for timeline event' });
        }
        // Create timeline event
        await (0, timelineHelper_1.createTimelineEvent)('project', project._id.toString(), 'created', 'Project Created', `Project "${project.name}" was created`, managerId);
        // Emit socket events
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('project:created', project);
        await emitProjectStats();
        res.status(201).json(project);
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(400).json({ message: 'Error creating project', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
    try {
        const oldProject = await Project_1.default.findById(req.params.id);
        if (!oldProject) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const project = await Project_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('manager', 'firstName lastName')
            .populate('team', 'firstName lastName');
        if (!project) {
            return res.status(404).json({ message: 'Project not found after update' });
        }
        // Safely get manager ID for timeline
        const managerId = req.body.updatedBy ||
            (project.manager ?
                (project.manager._id?.toString() || project.manager.toString()) :
                null);
        if (!managerId) {
            return res.status(400).json({ message: 'Unable to determine user for timeline event' });
        }
        // Create timeline event
        if (oldProject.status !== project.status) {
            await (0, timelineHelper_1.createTimelineEvent)('project', project._id.toString(), 'status_changed', 'Status Updated', `Project status changed from "${oldProject.status}" to "${project.status}"`, managerId, {
                field: 'status',
                oldValue: oldProject.status,
                newValue: project.status
            });
        }
        else {
            await (0, timelineHelper_1.createTimelineEvent)('project', project._id.toString(), 'updated', 'Project Updated', `Project "${project.name}" was updated`, managerId);
        }
        // Emit socket events
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('project:updated', project);
        await emitProjectStats();
        res.json(project);
    }
    catch (error) {
        console.error('Error updating project:', error);
        res.status(400).json({ message: 'Error updating project', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.updateProject = updateProject;
const updateProjectStatus = async (req, res) => {
    try {
        const { status, user } = req.body;
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        const project = await Project_1.default.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const oldStatus = project.status;
        project.status = status;
        await project.save();
        await project.populate('manager', 'firstName lastName');
        await project.populate('team', 'firstName lastName');
        // Safely get user ID
        const userId = user || (project.manager ?
            (project.manager._id?.toString() || project.manager.toString()) :
            null);
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required for timeline event' });
        }
        await (0, timelineHelper_1.createTimelineEvent)('project', project._id.toString(), 'status_changed', 'Status Updated', `Project status changed from "${oldStatus}" to "${status}"`, userId, { field: 'status', oldValue: oldStatus, newValue: status });
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('project:status:updated', project);
        await emitProjectStats();
        res.json(project);
    }
    catch (error) {
        console.error('Error updating project status:', error);
        res.status(400).json({ message: 'Error updating project status', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.updateProjectStatus = updateProjectStatus;
const deleteProject = async (req, res) => {
    try {
        const project = await Project_1.default.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        await Task_1.default.deleteMany({ project: req.params.id });
        // Safely get manager ID
        const managerId = project.manager ? project.manager.toString() : null;
        if (managerId) {
            // Create timeline event
            await (0, timelineHelper_1.createTimelineEvent)('project', req.params.id, 'deleted', 'Project Deleted', `Project "${project.name}" was deleted`, managerId);
        }
        // Emit socket events
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('project:deleted', { id: req.params.id });
        await emitProjectStats();
        res.json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Error deleting project', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.deleteProject = deleteProject;
const getProjectTasks = async (req, res) => {
    try {
        const tasks = await Task_1.default.find({ project: req.params.id })
            .populate('assignedTo', 'firstName lastName')
            .populate('assignedBy', 'firstName lastName');
        // Transform tasks to include projectId for frontend compatibility
        const transformedTasks = tasks.map(task => ({
            ...task.toObject(),
            projectId: task.project.toString()
        }));
        res.json(transformedTasks);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching project tasks', error });
    }
};
exports.getProjectTasks = getProjectTasks;
const createProjectTask = async (req, res) => {
    try {
        const projectId = req.params.id;
        // Validate that the project exists
        const project = await Project_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const taskData = { ...req.body, project: projectId };
        const task = new Task_1.default(taskData);
        await task.save();
        await task.populate('project', 'name');
        await task.populate('assignedTo', 'firstName lastName');
        await task.populate('assignedBy', 'firstName lastName');
        // Create timeline event for task creation
        const assignedById = task.assignedBy ?
            (task.assignedBy._id?.toString() || task.assignedBy.toString()) :
            req.body.assignedBy;
        if (assignedById) {
            try {
                await (0, timelineHelper_1.createTimelineEvent)('task', task._id.toString(), 'created', 'Task Created', `Task "${task.title}" was created in project "${project.name}"`, assignedById);
            }
            catch (timelineError) {
                console.error('Timeline event creation failed:', timelineError);
            }
        }
        // Transform task to include projectId for frontend compatibility
        const transformedTask = {
            ...task.toObject(),
            projectId: task.project.toString()
        };
        // Emit socket events
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('task:created', transformedTask);
        await emitProjectStats();
        res.status(201).json(transformedTask);
    }
    catch (error) {
        console.error('Error creating project task:', error);
        res.status(400).json({ message: 'Error creating project task', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.createProjectTask = createProjectTask;
const getProjectStats = async (req, res) => {
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
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching project stats', error });
    }
};
exports.getProjectStats = getProjectStats;
const updateProjectTask = async (req, res) => {
    try {
        const { id: projectId, taskId } = req.params;
        // Validate that the project exists
        const project = await Project_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const task = await Task_1.default.findOneAndUpdate({ _id: taskId, project: projectId }, req.body, { new: true, runValidators: true }).populate('assignedTo', 'firstName lastName')
            .populate('assignedBy', 'firstName lastName');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // Create timeline event
        const userId = req.body.updatedBy || task.assignedBy?.toString();
        if (userId) {
            await (0, timelineHelper_1.createTimelineEvent)('task', task._id.toString(), 'updated', 'Task Updated', `Task "${task.title}" was updated`, userId);
        }
        // Transform task to include projectId for frontend compatibility
        const transformedTask = {
            ...task.toObject(),
            projectId: task.project.toString()
        };
        // Emit socket events
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('task:updated', transformedTask);
        await emitProjectStats();
        res.json(transformedTask);
    }
    catch (error) {
        console.error('Error updating project task:', error);
        res.status(400).json({ message: 'Error updating project task', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.updateProjectTask = updateProjectTask;
const deleteProjectTask = async (req, res) => {
    try {
        const { id: projectId, taskId } = req.params;
        // Validate that the project exists
        const project = await Project_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        // First find the task to get its data before deletion
        const task = await Task_1.default.findOne({ _id: taskId, project: projectId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        // Now delete the task
        await Task_1.default.findOneAndDelete({ _id: taskId, project: projectId });
        // Create timeline event
        const userId = req.body.deletedBy || task.assignedBy?.toString();
        if (userId) {
            await (0, timelineHelper_1.createTimelineEvent)('task', taskId, 'deleted', 'Task Deleted', `Task "${task.title}" was deleted`, userId);
        }
        // Emit socket events
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('task:deleted', { id: taskId });
        await emitProjectStats();
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting project task:', error);
        res.status(500).json({ message: 'Error deleting project task', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.deleteProjectTask = deleteProjectTask;
const getProjectTimeline = async (req, res) => {
    try {
        // Validate that the project exists
        const project = await Project_1.default.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const timeline = await (0, timelineHelper_1.getEntityTimeline)('project', req.params.id);
        res.json(timeline);
    }
    catch (error) {
        console.error('Error fetching project timeline:', error);
        res.status(500).json({ message: 'Error fetching project timeline', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getProjectTimeline = getProjectTimeline;
