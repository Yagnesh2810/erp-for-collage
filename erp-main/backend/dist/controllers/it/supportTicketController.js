"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTicketAnalytics = exports.deleteTicket = exports.closeTicket = exports.resolveTicket = exports.addComment = exports.assignTicket = exports.updateTicket = exports.createTicket = exports.getTicketById = exports.getAllTickets = void 0;
const SupportTicket_1 = __importDefault(require("../../models/it/SupportTicket"));
const numberGenerator_1 = require("../../utils/numberGenerator");
// Get all support tickets
const getAllTickets = async (req, res) => {
    try {
        const { customer, status, priority, assignedTo, category, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (customer)
            filter.customer = customer;
        if (status)
            filter.status = status;
        if (priority)
            filter.priority = priority;
        if (assignedTo)
            filter.assignedTo = assignedTo;
        if (category)
            filter.category = category;
        const tickets = await SupportTicket_1.default.find(filter)
            .populate('customer', 'name email')
            .populate('assignedTo', 'name email')
            .populate('product', 'name')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await SupportTicket_1.default.countDocuments(filter);
        res.json({
            success: true,
            data: tickets,
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
            message: 'Error fetching support tickets',
            error: error.message,
        });
    }
};
exports.getAllTickets = getAllTickets;
// Get ticket by ID
const getTicketById = async (req, res) => {
    try {
        const ticket = await SupportTicket_1.default.findById(req.params.id)
            .populate('customer')
            .populate('assignedTo', 'name email')
            .populate('product')
            .populate('comments.user', 'name email')
            .populate('createdBy', 'name email');
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found',
            });
        }
        res.json({
            success: true,
            data: ticket,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching support ticket',
            error: error.message,
        });
    }
};
exports.getTicketById = getTicketById;
// Create support ticket
const createTicket = async (req, res) => {
    try {
        const ticketNumber = await (0, numberGenerator_1.generateTicketNumber)();
        const ticketData = {
            ...req.body,
            ticketNumber,
            createdBy: req.user._id,
        };
        // Set SLA deadlines based on priority
        if (ticketData.priority) {
            const now = new Date();
            let responseTime = 0; // in minutes
            let resolutionTime = 0;
            switch (ticketData.priority) {
                case 'URGENT':
                    responseTime = 60; // 1 hour
                    resolutionTime = 240; // 4 hours
                    break;
                case 'HIGH':
                    responseTime = 240; // 4 hours
                    resolutionTime = 480; // 8 hours
                    break;
                case 'MEDIUM':
                    responseTime = 480; // 8 hours
                    resolutionTime = 1440; // 24 hours
                    break;
                case 'LOW':
                    responseTime = 1440; // 24 hours
                    resolutionTime = 4320; // 72 hours
                    break;
            }
            ticketData.sla = {
                responseTime,
                resolutionTime,
                responseDeadline: new Date(now.getTime() + responseTime * 60000),
                resolutionDeadline: new Date(now.getTime() + resolutionTime * 60000),
            };
        }
        const ticket = await SupportTicket_1.default.create(ticketData);
        res.status(201).json({
            success: true,
            message: 'Support ticket created successfully',
            data: ticket,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating support ticket',
            error: error.message,
        });
    }
};
exports.createTicket = createTicket;
// Update ticket
const updateTicket = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: req.user._id,
        };
        const ticket = await SupportTicket_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
            .populate('customer')
            .populate('assignedTo');
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found',
            });
        }
        res.json({
            success: true,
            message: 'Support ticket updated successfully',
            data: ticket,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating support ticket',
            error: error.message,
        });
    }
};
exports.updateTicket = updateTicket;
// Assign ticket
const assignTicket = async (req, res) => {
    try {
        const { assignedTo } = req.body;
        const ticket = await SupportTicket_1.default.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found',
            });
        }
        ticket.assignedTo = assignedTo;
        ticket.status = 'IN_PROGRESS';
        ticket.updatedBy = req.user._id;
        // Calculate response time if this is the first assignment
        if (!ticket.actualResponseTime && ticket.sla) {
            const now = new Date();
            const createdAt = new Date(ticket.createdAt);
            ticket.actualResponseTime = Math.round((now.getTime() - createdAt.getTime()) / 60000);
        }
        await ticket.save();
        res.json({
            success: true,
            message: 'Ticket assigned successfully',
            data: ticket,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error assigning ticket',
            error: error.message,
        });
    }
};
exports.assignTicket = assignTicket;
// Add comment to ticket
const addComment = async (req, res) => {
    try {
        const { comment, isInternal } = req.body;
        const ticket = await SupportTicket_1.default.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found',
            });
        }
        ticket.comments.push({
            user: req.user._id,
            comment,
            isInternal: isInternal || false,
            timestamp: new Date(),
        });
        ticket.updatedBy = req.user._id;
        await ticket.save();
        await ticket.populate('comments.user', 'name email');
        res.json({
            success: true,
            message: 'Comment added successfully',
            data: ticket,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message,
        });
    }
};
exports.addComment = addComment;
// Resolve ticket
const resolveTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket_1.default.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found',
            });
        }
        ticket.status = 'RESOLVED';
        ticket.resolvedAt = new Date();
        // Calculate resolution time
        if (ticket.sla) {
            const createdAt = new Date(ticket.createdAt);
            ticket.actualResolutionTime = Math.round((ticket.resolvedAt.getTime() - createdAt.getTime()) / 60000);
        }
        ticket.updatedBy = req.user._id;
        await ticket.save();
        res.json({
            success: true,
            message: 'Ticket resolved successfully',
            data: ticket,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resolving ticket',
            error: error.message,
        });
    }
};
exports.resolveTicket = resolveTicket;
// Close ticket
const closeTicket = async (req, res) => {
    try {
        const { satisfaction } = req.body;
        const ticket = await SupportTicket_1.default.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found',
            });
        }
        ticket.status = 'CLOSED';
        ticket.closedAt = new Date();
        if (satisfaction) {
            ticket.satisfaction = satisfaction;
        }
        ticket.updatedBy = req.user._id;
        await ticket.save();
        res.json({
            success: true,
            message: 'Ticket closed successfully',
            data: ticket,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error closing ticket',
            error: error.message,
        });
    }
};
exports.closeTicket = closeTicket;
// Delete ticket
const deleteTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket_1.default.findByIdAndDelete(req.params.id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found',
            });
        }
        res.json({
            success: true,
            message: 'Support ticket deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting support ticket',
            error: error.message,
        });
    }
};
exports.deleteTicket = deleteTicket;
// Get support ticket analytics
const getTicketAnalytics = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate)
                filter.createdAt.$gte = new Date(startDate);
            if (endDate)
                filter.createdAt.$lte = new Date(endDate);
        }
        const totalTickets = await SupportTicket_1.default.countDocuments(filter);
        const openTickets = await SupportTicket_1.default.countDocuments({ ...filter, status: { $in: ['OPEN', 'IN_PROGRESS', 'WAITING'] } });
        const resolvedTickets = await SupportTicket_1.default.countDocuments({ ...filter, status: 'RESOLVED' });
        const closedTickets = await SupportTicket_1.default.countDocuments({ ...filter, status: 'CLOSED' });
        const avgResolutionTime = await SupportTicket_1.default.aggregate([
            { $match: { ...filter, actualResolutionTime: { $exists: true } } },
            { $group: { _id: null, avgTime: { $avg: '$actualResolutionTime' } } },
        ]);
        const avgSatisfaction = await SupportTicket_1.default.aggregate([
            { $match: { ...filter, satisfaction: { $exists: true } } },
            { $group: { _id: null, avgRating: { $avg: '$satisfaction' } } },
        ]);
        const priorityBreakdown = await SupportTicket_1.default.aggregate([
            { $match: filter },
            { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]);
        res.json({
            success: true,
            data: {
                total: totalTickets,
                open: openTickets,
                resolved: resolvedTickets,
                closed: closedTickets,
                averageResolutionTime: avgResolutionTime[0]?.avgTime || 0,
                averageSatisfaction: avgSatisfaction[0]?.avgRating || 0,
                priorityBreakdown,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching ticket analytics',
            error: error.message,
        });
    }
};
exports.getTicketAnalytics = getTicketAnalytics;
