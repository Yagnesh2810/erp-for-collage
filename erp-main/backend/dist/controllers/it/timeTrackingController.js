"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeTrackingSummary = exports.deleteTimeEntry = exports.rejectTimeEntry = exports.approveTimeEntry = exports.submitTimeEntry = exports.updateTimeEntry = exports.createTimeEntry = exports.getTimeEntryById = exports.getAllTimeEntries = void 0;
const TimeEntry_1 = __importDefault(require("../../models/it/TimeEntry"));
// Get all time entries
const getAllTimeEntries = async (req, res) => {
    try {
        const { employee, project, task, status, startDate, endDate, page = 1, limit = 50 } = req.query;
        const filter = {};
        if (employee)
            filter.employee = employee;
        if (project)
            filter.project = project;
        if (task)
            filter.task = task;
        if (status)
            filter.status = status;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate)
                filter.date.$gte = new Date(startDate);
            if (endDate)
                filter.date.$lte = new Date(endDate);
        }
        const timeEntries = await TimeEntry_1.default.find(filter)
            .populate('employee', 'name email')
            .populate('project', 'name')
            .populate('task', 'title')
            .populate('approvedBy', 'name email')
            .sort({ date: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await TimeEntry_1.default.countDocuments(filter);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching time entries',
            error: error.message,
        });
    }
};
exports.getAllTimeEntries = getAllTimeEntries;
// Get time entry by ID
const getTimeEntryById = async (req, res) => {
    try {
        const timeEntry = await TimeEntry_1.default.findById(req.params.id)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching time entry',
            error: error.message,
        });
    }
};
exports.getTimeEntryById = getTimeEntryById;
// Create time entry
const createTimeEntry = async (req, res) => {
    try {
        const timeEntryData = {
            ...req.body,
            createdBy: req.user._id,
        };
        const timeEntry = await TimeEntry_1.default.create(timeEntryData);
        res.status(201).json({
            success: true,
            message: 'Time entry created successfully',
            data: timeEntry,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating time entry',
            error: error.message,
        });
    }
};
exports.createTimeEntry = createTimeEntry;
// Update time entry
const updateTimeEntry = async (req, res) => {
    try {
        const timeEntry = await TimeEntry_1.default.findById(req.params.id);
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
            updatedBy: req.user._id,
        };
        const updatedTimeEntry = await TimeEntry_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        res.json({
            success: true,
            message: 'Time entry updated successfully',
            data: updatedTimeEntry,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating time entry',
            error: error.message,
        });
    }
};
exports.updateTimeEntry = updateTimeEntry;
// Submit time entry for approval
const submitTimeEntry = async (req, res) => {
    try {
        const timeEntry = await TimeEntry_1.default.findById(req.params.id);
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
        timeEntry.updatedBy = req.user._id;
        await timeEntry.save();
        res.json({
            success: true,
            message: 'Time entry submitted for approval',
            data: timeEntry,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error submitting time entry',
            error: error.message,
        });
    }
};
exports.submitTimeEntry = submitTimeEntry;
// Approve time entry
const approveTimeEntry = async (req, res) => {
    try {
        const timeEntry = await TimeEntry_1.default.findById(req.params.id);
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
        timeEntry.approvedBy = req.user._id;
        timeEntry.updatedBy = req.user._id;
        await timeEntry.save();
        res.json({
            success: true,
            message: 'Time entry approved',
            data: timeEntry,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error approving time entry',
            error: error.message,
        });
    }
};
exports.approveTimeEntry = approveTimeEntry;
// Reject time entry
const rejectTimeEntry = async (req, res) => {
    try {
        const timeEntry = await TimeEntry_1.default.findById(req.params.id);
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
        timeEntry.updatedBy = req.user._id;
        await timeEntry.save();
        res.json({
            success: true,
            message: 'Time entry rejected',
            data: timeEntry,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error rejecting time entry',
            error: error.message,
        });
    }
};
exports.rejectTimeEntry = rejectTimeEntry;
// Delete time entry
const deleteTimeEntry = async (req, res) => {
    try {
        const timeEntry = await TimeEntry_1.default.findById(req.params.id);
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
        await TimeEntry_1.default.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: 'Time entry deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting time entry',
            error: error.message,
        });
    }
};
exports.deleteTimeEntry = deleteTimeEntry;
// Get time tracking summary
const getTimeTrackingSummary = async (req, res) => {
    try {
        const { employee, project, startDate, endDate } = req.query;
        const filter = {};
        if (employee)
            filter.employee = employee;
        if (project)
            filter.project = project;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate)
                filter.date.$gte = new Date(startDate);
            if (endDate)
                filter.date.$lte = new Date(endDate);
        }
        const summary = await TimeEntry_1.default.aggregate([
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
        const statusBreakdown = await TimeEntry_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching time tracking summary',
            error: error.message,
        });
    }
};
exports.getTimeTrackingSummary = getTimeTrackingSummary;
