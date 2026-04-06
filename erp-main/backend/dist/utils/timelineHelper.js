"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEntityTimeline = exports.createTimelineEvent = void 0;
const Timeline_1 = __importDefault(require("../models/Timeline"));
const mongoose_1 = __importDefault(require("mongoose"));
const createTimelineEvent = async (entityType, entityId, eventType, title, description, userId, metadata) => {
    try {
        // Validate required parameters
        if (!entityType || !entityId || !eventType || !title || !description || !userId) {
            throw new Error('Missing required parameters for timeline event');
        }
        // Validate ObjectId format
        if (!mongoose_1.default.Types.ObjectId.isValid(entityId)) {
            throw new Error(`Invalid entityId format: ${entityId}`);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            throw new Error(`Invalid userId format: ${userId}`);
        }
        const timelineEvent = new Timeline_1.default({
            entityType,
            entityId: new mongoose_1.default.Types.ObjectId(entityId),
            eventType,
            title,
            description,
            user: new mongoose_1.default.Types.ObjectId(userId),
            metadata
        });
        await timelineEvent.save();
        return timelineEvent;
    }
    catch (error) {
        console.error('Error creating timeline event:', error);
        throw error; // Re-throw to let caller handle
    }
};
exports.createTimelineEvent = createTimelineEvent;
const getEntityTimeline = async (entityType, entityId) => {
    try {
        // Validate parameters
        if (!entityType || !entityId) {
            throw new Error('Missing required parameters for timeline fetch');
        }
        // Validate ObjectId format
        if (!mongoose_1.default.Types.ObjectId.isValid(entityId)) {
            throw new Error(`Invalid entityId format: ${entityId}`);
        }
        const timeline = await Timeline_1.default.find({
            entityType,
            entityId: new mongoose_1.default.Types.ObjectId(entityId)
        })
            .populate('user', 'firstName lastName')
            .sort({ createdAt: -1 });
        return timeline;
    }
    catch (error) {
        console.error('Error fetching timeline:', error);
        throw error; // Re-throw to let caller handle
    }
};
exports.getEntityTimeline = getEntityTimeline;
