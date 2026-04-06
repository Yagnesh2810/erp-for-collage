import { Request, Response } from 'express';
import SupportTicket from '../../models/it/SupportTicket';
import { generateTicketNumber } from '../../utils/numberGenerator';

// Get all support tickets
export const getAllTickets = async (req: Request, res: Response) => {
    try {
        const { customer, status, priority, assignedTo, category, page = 1, limit = 20 } = req.query;

        const filter: any = {};
        if (customer) filter.customer = customer;
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (category) filter.category = category;

        const tickets = await SupportTicket.find(filter)
            .populate('customer', 'name email')
            .populate('assignedTo', 'name email')
            .populate('product', 'name')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await SupportTicket.countDocuments(filter);

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching support tickets',
            error: error.message,
        });
    }
};

// Get ticket by ID
export const getTicketById = async (req: Request, res: Response) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching support ticket',
            error: error.message,
        });
    }
};

// Create support ticket
export const createTicket = async (req: Request, res: Response) => {
    try {
        const ticketNumber = await generateTicketNumber();

        const ticketData = {
            ...req.body,
            ticketNumber,
            createdBy: (req as any).user._id,
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

        const ticket = await SupportTicket.create(ticketData);

        res.status(201).json({
            success: true,
            message: 'Support ticket created successfully',
            data: ticket,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error creating support ticket',
            error: error.message,
        });
    }
};

// Update ticket
export const updateTicket = async (req: Request, res: Response) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: (req as any).user._id,
        };

        const ticket = await SupportTicket.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error updating support ticket',
            error: error.message,
        });
    }
};

// Assign ticket
export const assignTicket = async (req: Request, res: Response) => {
    try {
        const { assignedTo } = req.body;

        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found',
            });
        }

        ticket.assignedTo = assignedTo;
        ticket.status = 'IN_PROGRESS';
        ticket.updatedBy = (req as any).user._id;

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error assigning ticket',
            error: error.message,
        });
    }
};

// Add comment to ticket
export const addComment = async (req: Request, res: Response) => {
    try {
        const { comment, isInternal } = req.body;

        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Support ticket not found',
            });
        }

        ticket.comments.push({
            user: (req as any).user._id,
            comment,
            isInternal: isInternal || false,
            timestamp: new Date(),
        });

        ticket.updatedBy = (req as any).user._id;
        await ticket.save();

        await ticket.populate('comments.user', 'name email');

        res.json({
            success: true,
            message: 'Comment added successfully',
            data: ticket,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error adding comment',
            error: error.message,
        });
    }
};

// Resolve ticket
export const resolveTicket = async (req: Request, res: Response) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);

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

        ticket.updatedBy = (req as any).user._id;
        await ticket.save();

        res.json({
            success: true,
            message: 'Ticket resolved successfully',
            data: ticket,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error resolving ticket',
            error: error.message,
        });
    }
};

// Close ticket
export const closeTicket = async (req: Request, res: Response) => {
    try {
        const { satisfaction } = req.body;

        const ticket = await SupportTicket.findById(req.params.id);

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

        ticket.updatedBy = (req as any).user._id;
        await ticket.save();

        res.json({
            success: true,
            message: 'Ticket closed successfully',
            data: ticket,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error closing ticket',
            error: error.message,
        });
    }
};

// Delete ticket
export const deleteTicket = async (req: Request, res: Response) => {
    try {
        const ticket = await SupportTicket.findByIdAndDelete(req.params.id);

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error deleting support ticket',
            error: error.message,
        });
    }
};

// Get support ticket analytics
export const getTicketAnalytics = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        const filter: any = {};
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate as string);
            if (endDate) filter.createdAt.$lte = new Date(endDate as string);
        }

        const totalTickets = await SupportTicket.countDocuments(filter);
        const openTickets = await SupportTicket.countDocuments({ ...filter, status: { $in: ['OPEN', 'IN_PROGRESS', 'WAITING'] } });
        const resolvedTickets = await SupportTicket.countDocuments({ ...filter, status: 'RESOLVED' });
        const closedTickets = await SupportTicket.countDocuments({ ...filter, status: 'CLOSED' });

        const avgResolutionTime = await SupportTicket.aggregate([
            { $match: { ...filter, actualResolutionTime: { $exists: true } } },
            { $group: { _id: null, avgTime: { $avg: '$actualResolutionTime' } } },
        ]);

        const avgSatisfaction = await SupportTicket.aggregate([
            { $match: { ...filter, satisfaction: { $exists: true } } },
            { $group: { _id: null, avgRating: { $avg: '$satisfaction' } } },
        ]);

        const priorityBreakdown = await SupportTicket.aggregate([
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching ticket analytics',
            error: error.message,
        });
    }
};
