"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDateRange = exports.validatePriority = exports.validateProjectStatus = exports.validateTaskStatus = exports.validateRequiredFields = exports.validateObjectId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];
        if (!id) {
            return res.status(400).json({ message: `${paramName} parameter is required` });
        }
        // Check for common invalid values
        if (id === 'undefined' || id === 'null' || id === '') {
            return res.status(400).json({ message: `Invalid ${paramName}: ${id}` });
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: `Invalid ${paramName} format` });
        }
        next();
    };
};
exports.validateObjectId = validateObjectId;
const validateRequiredFields = (fields) => {
    return (req, res, next) => {
        const missingFields = fields.filter(field => {
            const value = req.body[field];
            return value === undefined || value === null || value === '';
        });
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        next();
    };
};
exports.validateRequiredFields = validateRequiredFields;
const validateTaskStatus = (req, res, next) => {
    const validStatuses = ['todo', 'in-progress', 'review', 'completed'];
    const { status } = req.body;
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
    }
    next();
};
exports.validateTaskStatus = validateTaskStatus;
const validateProjectStatus = (req, res, next) => {
    const validStatuses = ['planning', 'active', 'on-hold', 'completed', 'cancelled'];
    const { status } = req.body;
    if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
    }
    next();
};
exports.validateProjectStatus = validateProjectStatus;
const validatePriority = (req, res, next) => {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const { priority } = req.body;
    if (priority && !validPriorities.includes(priority)) {
        return res.status(400).json({
            message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
        });
    }
    next();
};
exports.validatePriority = validatePriority;
const validateDateRange = (req, res, next) => {
    const { startDate, endDate } = req.body;
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            return res.status(400).json({
                message: 'Start date must be before end date'
            });
        }
    }
    next();
};
exports.validateDateRange = validateDateRange;
