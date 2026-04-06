"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivities = exports.getBatchActivities = void 0;
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const getBatchActivities = async (req, res) => {
    try {
        const activities = await ActivityLog_1.default.find()
            .sort({ timestamp: -1 })
            .limit(50)
            .populate('userId', 'name email');
        res.status(200).json({
            success: true,
            data: activities
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching activities',
            error
        });
    }
};
exports.getBatchActivities = getBatchActivities;
const getActivities = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const activities = await ActivityLog_1.default.find()
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('userId', 'name email');
        const total = await ActivityLog_1.default.countDocuments();
        res.status(200).json({
            success: true,
            data: activities,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching activities',
            error
        });
    }
};
exports.getActivities = getActivities;
