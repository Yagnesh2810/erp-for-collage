import { Request, Response } from 'express';
import TimeEntry from '../../models/it/TimeEntry';
import Employee from '../../models/Employee';

// Get all time entries
export const getAllTimeEntries = async (req: Request, res: Response) => {
    try {
        const { employee, project, task, status, startDate, endDate, page = 1, limit = 50 } = req.query;

        const filter: any = {};
        if (employee) filter.employee = employee;
        if (project) filter.project = project;
        if (task) filter.task = task;
        if (status) filter.status = status;

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate as string);
            if (endDate) filter.date.$lte = new Date(endDate as string);
        }

        const timeEntries = await TimeEntry.find(filter)
            .populate('employee', 'name email')
            .populate('project', 'name')
            .populate('task', 'title')
            .populate('approvedBy', 'name email')
            .sort({ date: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await TimeEntry.countDocuments(filter);

        res.json({
            success: true,
            data: timeEntries,
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
            message: 'Error fetching time entries',
            error: error.message,
        });
    }
};

// Get time entry by ID
export const getTimeEntryById = async (req: Request, res: Response) => {
    try {
        const timeEntry = await TimeEntry.findById(req.params.id)
            .populate('employee')
            .populate('project')
            .populate('task')
            .populate('approvedBy', 'name email')
            .populate('createdBy', 'name email');

        if (!timeEntry) {
            return res.status(404).json({
                success: false,
                message: 'Time entry not found',
            });
        }

        res.json({
            success: true,
            data: timeEntry,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching time entry',
            error: error.message,
        });
    }
};

// Create time entry
export const createTimeEntry = async (req: Request, res: Response) => {
    try {
        const timeEntryData = {
            ...req.body,
            createdBy: (req as any).user._id,
        };

        const timeEntry = await TimeEntry.create(timeEntryData);

        res.status(201).json({
            success: true,
            message: 'Time entry created successfully',
            data: timeEntry,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error creating time entry',
            error: error.message,
        });
    }
};

// Update time entry
export const updateTimeEntry = async (req: Request, res: Response) => {
    try {
        const timeEntry = await TimeEntry.findById(req.params.id);

        if (!timeEntry) {
            return res.status(404).json({
                success: false,
                message: 'Time entry not found',
            });
        }

        // Only allow updates if not approved or invoiced
        if (timeEntry.status === 'APPROVED' || timeEntry.status === 'INVOICED') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update approved or invoiced time entries',
            });
        }

        const updateData = {
            ...req.body,
            updatedBy: (req as any).user._id,
        };

        const updatedTimeEntry = await TimeEntry.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Time entry updated successfully',
            data: updatedTimeEntry,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error updating time entry',
            error: error.message,
        });
    }
};

// Submit time entry for approval
export const submitTimeEntry = async (req: Request, res: Response) => {
    try {
        const timeEntry = await TimeEntry.findById(req.params.id);

        if (!timeEntry) {
            return res.status(404).json({
                success: false,
                message: 'Time entry not found',
            });
        }

        if (timeEntry.status !== 'DRAFT') {
            return res.status(400).json({
                success: false,
                message: 'Only draft time entries can be submitted',
            });
        }

        timeEntry.status = 'SUBMITTED';
        timeEntry.updatedBy = (req as any).user._id;
        await timeEntry.save();

        res.json({
            success: true,
            message: 'Time entry submitted for approval',
            data: timeEntry,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error submitting time entry',
            error: error.message,
        });
    }
};

// Approve time entry
export const approveTimeEntry = async (req: Request, res: Response) => {
    try {
        const timeEntry = await TimeEntry.findById(req.params.id);

        if (!timeEntry) {
            return res.status(404).json({
                success: false,
                message: 'Time entry not found',
            });
        }

        if (timeEntry.status !== 'SUBMITTED') {
            return res.status(400).json({
                success: false,
                message: 'Only submitted time entries can be approved',
            });
        }

        timeEntry.status = 'APPROVED';
        timeEntry.approvedBy = (req as any).user._id;
        timeEntry.updatedBy = (req as any).user._id;
        await timeEntry.save();

        res.json({
            success: true,
            message: 'Time entry approved',
            data: timeEntry,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error approving time entry',
            error: error.message,
        });
    }
};

// Reject time entry
export const rejectTimeEntry = async (req: Request, res: Response) => {
    try {
        const timeEntry = await TimeEntry.findById(req.params.id);

        if (!timeEntry) {
            return res.status(404).json({
                success: false,
                message: 'Time entry not found',
            });
        }

        if (timeEntry.status !== 'SUBMITTED') {
            return res.status(400).json({
                success: false,
                message: 'Only submitted time entries can be rejected',
            });
        }

        timeEntry.status = 'REJECTED';
        timeEntry.notes = req.body.rejectionReason || timeEntry.notes;
        timeEntry.updatedBy = (req as any).user._id;
        await timeEntry.save();

        res.json({
            success: true,
            message: 'Time entry rejected',
            data: timeEntry,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting time entry',
            error: error.message,
        });
    }
};

// Delete time entry
export const deleteTimeEntry = async (req: Request, res: Response) => {
    try {
        const timeEntry = await TimeEntry.findById(req.params.id);

        if (!timeEntry) {
            return res.status(404).json({
                success: false,
                message: 'Time entry not found',
            });
        }

        // Only allow deletion of draft or rejected entries
        if (timeEntry.status !== 'DRAFT' && timeEntry.status !== 'REJECTED') {
            return res.status(400).json({
                success: false,
                message: 'Only draft or rejected time entries can be deleted',
            });
        }

        await TimeEntry.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Time entry deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error deleting time entry',
            error: error.message,
        });
    }
};

// Get time tracking summary
export const getTimeTrackingSummary = async (req: Request, res: Response) => {
    try {
        const { employee, project, startDate, endDate } = req.query;

        const filter: any = {};
        if (employee) filter.employee = employee;
        if (project) filter.project = project;

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate as string);
            if (endDate) filter.date.$lte = new Date(endDate as string);
        }

        const summary = await TimeEntry.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalHours: { $sum: { $divide: ['$duration', 60] } },
                    totalBillableHours: {
                        $sum: {
                            $cond: ['$billable', { $divide: ['$duration', 60] }, 0]
                        }
                    },
                    totalAmount: { $sum: '$totalAmount' },
                    entries: { $sum: 1 },
                },
            },
        ]);

        const statusBreakdown = await TimeEntry.aggregate([
            { $match: filter },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);

        res.json({
            success: true,
            data: {
                summary: summary[0] || {
                    totalHours: 0,
                    totalBillableHours: 0,
                    totalAmount: 0,
                    entries: 0,
                },
                statusBreakdown,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching time tracking summary',
            error: error.message,
        });
    }
};
