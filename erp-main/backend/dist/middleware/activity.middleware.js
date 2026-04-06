"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const logActivity = (action, resource) => {
    return async (req, res, next) => {
        // Store original res.json to intercept response
        const originalJson = res.json;
        res.json = function (body) {
            // Determine status based on response
            const status = res.statusCode >= 400 ? 'error' : 'success';
            // Log the activity asynchronously
            setImmediate(async () => {
                try {
                    await ActivityLog_1.default.create({
                        user: req.user?.name || req.user?.email || 'Unknown',
                        action,
                        resource,
                        status,
                        details: `${action} ${resource} - ${status}`,
                        ipAddress: req.ip || req.connection.remoteAddress || 'unknown'
                    });
                }
                catch (error) {
                    console.error('Failed to log activity:', error);
                }
            });
            // Call original json method
            return originalJson.call(this, body);
        };
        next();
    };
};
exports.logActivity = logActivity;
