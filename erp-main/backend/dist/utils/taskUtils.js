"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasksByUser = exports.getTasksByProject = exports.getTaskStats = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const getTaskStats = async () => {
    try {
        const totalTasks = await Task_1.default.countDocuments();
        const completedTasks = await Task_1.default.countDocuments({ status: 'completed' });
        const inProgressTasks = await Task_1.default.countDocuments({ status: 'in-progress' });
        const todoTasks = await Task_1.default.countDocuments({ status: 'todo' });
        const reviewTasks = await Task_1.default.countDocuments({ status: 'review' });
        const overdueTasks = await Task_1.default.countDocuments({
            dueDate: { $lt: new Date() },
            status: { $ne: 'completed' }
        });
        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            todoTasks,
            reviewTasks,
            overdueTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
    }
    catch (error) {
        console.error('Error calculating task stats:', error);
        return null;
    }
};
exports.getTaskStats = getTaskStats;
const getTasksByProject = async (projectId) => {
    try {
        return await Task_1.default.find({ project: projectId })
            .populate('assignedTo', 'firstName lastName')
            .populate('assignedBy', 'firstName lastName')
            .sort({ createdAt: -1 });
    }
    catch (error) {
        console.error('Error fetching tasks by project:', error);
        return [];
    }
};
exports.getTasksByProject = getTasksByProject;
const getTasksByUser = async (userId) => {
    try {
        return await Task_1.default.find({ assignedTo: userId })
            .populate('project', 'name')
            .populate('assignedBy', 'firstName lastName')
            .sort({ dueDate: 1 });
    }
    catch (error) {
        console.error('Error fetching tasks by user:', error);
        return [];
    }
};
exports.getTasksByUser = getTasksByUser;
