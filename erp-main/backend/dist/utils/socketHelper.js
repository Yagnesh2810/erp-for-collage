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
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitProjectStats = exports.safeEmitToRoom = exports.safeEmit = void 0;
const logger_1 = require("./logger");
const safeEmit = async (event, data) => {
    try {
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit(event, data);
        logger_1.logger.info(`Socket event emitted: ${event}`);
    }
    catch (error) {
        logger_1.logger.error(`Failed to emit socket event ${event}:`, error);
    }
};
exports.safeEmit = safeEmit;
const safeEmitToRoom = async (room, event, data) => {
    try {
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.to(room).emit(event, data);
        logger_1.logger.info(`Socket event emitted to room ${room}: ${event}`);
    }
    catch (error) {
        logger_1.logger.error(`Failed to emit socket event ${event} to room ${room}:`, error);
    }
};
exports.safeEmitToRoom = safeEmitToRoom;
const emitProjectStats = async () => {
    try {
        const Project = (await Promise.resolve().then(() => __importStar(require('../models/Project')))).default;
        const Task = (await Promise.resolve().then(() => __importStar(require('../models/Task')))).default;
        const totalProjects = await Project.countDocuments();
        const activeProjects = await Project.countDocuments({ status: 'active' });
        const completedProjects = await Project.countDocuments({ status: 'completed' });
        const overdueTasks = await Task.countDocuments({
            dueDate: { $lt: new Date() },
            status: { $ne: 'completed' }
        });
        const stats = {
            totalProjects,
            activeProjects,
            completedProjects,
            overdueTasks,
            totalTasks: await Task.countDocuments(),
            completedTasks: await Task.countDocuments({ status: 'completed' })
        };
        await (0, exports.safeEmit)('project:stats', stats);
        return stats;
    }
    catch (error) {
        logger_1.logger.error('Error emitting project stats:', error);
        return null;
    }
};
exports.emitProjectStats = emitProjectStats;
