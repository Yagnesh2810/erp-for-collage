"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const logActivity = async (params) => {
    try {
        const activityLog = new ActivityLog_1.default({
            user: params.userId,
            action: params.action,
            resource: params.resource,
            details: params.details,
            status: params.status || 'success',
            ipAddress: params.ipAddress || '127.0.0.1'
        });
        await activityLog.save();
    }
    catch (error) {
        console.error('Error logging activity:', error);
    }
};
exports.logActivity = logActivity;
