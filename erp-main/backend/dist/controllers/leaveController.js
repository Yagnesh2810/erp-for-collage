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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaveBalance = exports.updateLeaveStatus = exports.createLeave = exports.getAllLeaves = void 0;
const Leave_1 = __importDefault(require("../models/Leave"));
const getAllLeaves = async (req, res) => {
    try {
        const { status, employee, startDate, endDate } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (employee)
            filter.employee = employee;
        // Check if someone is on leave on a specific date (for today's leave check)
        if (startDate && endDate && startDate === endDate) {
            const checkDate = new Date(startDate);
            filter.startDate = { $lte: checkDate };
            filter.endDate = { $gte: checkDate };
        }
        else if (startDate && endDate) {
            filter.startDate = { $gte: new Date(startDate) };
            filter.endDate = { $lte: new Date(endDate) };
        }
        const leaves = await Leave_1.default.find(filter)
            .populate('employee', 'firstName lastName employeeId')
            .populate('approvedBy', 'firstName lastName')
            .sort({ appliedDate: -1 });
        res.json(leaves);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching leaves', error });
    }
};
exports.getAllLeaves = getAllLeaves;
const createLeave = async (req, res) => {
    try {
        const leaveData = req.body;
        const startDate = new Date(leaveData.startDate);
        const endDate = new Date(leaveData.endDate);
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const leave = new Leave_1.default({
            ...leaveData,
            totalDays,
            appliedDate: new Date()
        });
        await leave.save();
        await leave.populate('employee', 'firstName lastName employeeId');
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('leave:created', leave);
        res.status(201).json(leave);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating leave request', error });
    }
};
exports.createLeave = createLeave;
const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, approvedBy, rejectionReason } = req.body;
        const updateData = { status };
        if (status === 'approved') {
            updateData.approvedBy = approvedBy;
            updateData.approvedDate = new Date();
        }
        else if (status === 'rejected') {
            updateData.rejectionReason = rejectionReason;
        }
        const leave = await Leave_1.default.findByIdAndUpdate(id, updateData, { new: true })
            .populate('employee', 'firstName lastName employeeId')
            .populate('approvedBy', 'firstName lastName');
        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('leave:updated', leave);
        res.json(leave);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating leave status', error });
    }
};
exports.updateLeaveStatus = updateLeaveStatus;
const getLeaveBalance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const currentYear = new Date().getFullYear();
        const leaves = await Leave_1.default.find({
            employee: employeeId,
            status: 'approved',
            startDate: { $gte: new Date(`${currentYear}-01-01`) },
            endDate: { $lte: new Date(`${currentYear}-12-31`) }
        });
        const balance = {
            sick: { used: 0, total: 12 },
            vacation: { used: 0, total: 21 },
            personal: { used: 0, total: 5 },
            maternity: { used: 0, total: 90 },
            paternity: { used: 0, total: 15 },
            emergency: { used: 0, total: 3 }
        };
        leaves.forEach(leave => {
            if (balance[leave.leaveType]) {
                balance[leave.leaveType].used += leave.totalDays;
            }
        });
        res.json(balance);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching leave balance', error });
    }
};
exports.getLeaveBalance = getLeaveBalance;
