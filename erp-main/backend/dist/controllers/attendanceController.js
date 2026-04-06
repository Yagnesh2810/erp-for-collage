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
exports.deleteAttendance = exports.updateAttendance = exports.markAttendance = exports.getAttendanceStats = exports.checkOut = exports.checkIn = exports.getAttendanceById = exports.getAllAttendance = exports.getTodayStats = void 0;
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Employee_1 = __importDefault(require("../models/Employee"));
// Socket will be imported dynamically to avoid circular dependency
// Add a new endpoint for today's dashboard stats
const getTodayStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Get today's attendance
        const todayAttendance = await Attendance_1.default.find({
            date: { $gte: today, $lt: tomorrow }
        }).populate('employee', 'firstName lastName employeeId');
        // Get total active employees
        const totalEmployees = await Employee_1.default.countDocuments({ status: 'active' });
        const stats = {
            totalEmployees,
            presentToday: todayAttendance.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half-day').length,
            lateArrivals: todayAttendance.filter(a => a.status === 'late').length,
            totalHours: todayAttendance.reduce((sum, a) => sum + a.totalHours, 0),
            avgHours: todayAttendance.length > 0 ?
                todayAttendance.reduce((sum, a) => sum + a.totalHours, 0) / todayAttendance.length : 0,
            attendanceRecords: todayAttendance
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching today stats:', error);
        res.status(500).json({ message: 'Error fetching today stats', error });
    }
};
exports.getTodayStats = getTodayStats;
const getAllAttendance = async (req, res) => {
    try {
        const { startDate, endDate, employee } = req.query;
        const filter = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Set start to beginning of day
            start.setHours(0, 0, 0, 0);
            // Set end to end of day
            end.setHours(23, 59, 59, 999);
            filter.date = { $gte: start, $lte: end };
        }
        else {
            // Default to today if no date range specified
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            filter.date = { $gte: today, $lt: tomorrow };
        }
        if (employee) {
            filter.employee = employee;
        }
        console.log('Attendance filter:', filter);
        const attendance = await Attendance_1.default.find(filter)
            .populate('employee', 'firstName lastName employeeId')
            .sort({ date: -1, checkIn: -1 });
        console.log('Found attendance records:', attendance.length);
        res.json(attendance);
    }
    catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ message: 'Error fetching attendance', error });
    }
};
exports.getAllAttendance = getAllAttendance;
const getAttendanceById = async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await Attendance_1.default.findById(id)
            .populate('employee', 'firstName lastName employeeId');
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching attendance record', error });
    }
};
exports.getAttendanceById = getAttendanceById;
const checkIn = async (req, res) => {
    try {
        const { employee } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingAttendance = await Attendance_1.default.findOne({
            employee,
            date: today
        });
        if (existingAttendance) {
            return res.status(400).json({ message: 'Already checked in today' });
        }
        const checkInTime = new Date();
        const workStartTime = new Date(today);
        workStartTime.setHours(9, 0, 0, 0); // 9 AM
        let status = 'present';
        if (checkInTime > workStartTime) {
            const lateMinutes = (checkInTime.getTime() - workStartTime.getTime()) / (1000 * 60);
            if (lateMinutes > 15) { // Changed from 30 to 15 minutes for better tracking
                status = 'late';
            }
        }
        const attendance = new Attendance_1.default({
            employee,
            date: today,
            checkIn: checkInTime,
            status,
            totalHours: 0,
            breakTime: 0
        });
        await attendance.save();
        await attendance.populate('employee', 'firstName lastName employeeId');
        // Emit socket event for real-time updates
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('attendance:checkin', attendance);
        io.emit('attendance:updated', attendance);
        res.status(201).json(attendance);
    }
    catch (error) {
        console.error('Check-in error:', error);
        res.status(400).json({ message: 'Error checking in', error: error.message });
    }
};
exports.checkIn = checkIn;
const checkOut = async (req, res) => {
    try {
        const { employee } = req.body;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = await Attendance_1.default.findOne({
            employee,
            date: today
        });
        if (!attendance) {
            return res.status(404).json({ message: 'No check-in record found for today' });
        }
        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out today' });
        }
        const checkOutTime = new Date();
        const totalMilliseconds = checkOutTime.getTime() - attendance.checkIn.getTime();
        const totalHours = totalMilliseconds / (1000 * 60 * 60);
        const breakTimeHours = (attendance.breakTime || 0) / 60;
        attendance.checkOut = checkOutTime;
        attendance.totalHours = Math.max(0, totalHours - breakTimeHours);
        // Update status based on total hours worked
        if (attendance.totalHours < 4) {
            attendance.status = 'half-day';
        }
        else if (attendance.status !== 'late') {
            attendance.status = 'present';
        }
        await attendance.save();
        await attendance.populate('employee', 'firstName lastName employeeId');
        // Emit socket events for real-time updates
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('attendance:checkout', attendance);
        io.emit('attendance:updated', attendance);
        res.json(attendance);
    }
    catch (error) {
        console.error('Check-out error:', error);
        res.status(400).json({ message: 'Error checking out', error: error.message });
    }
};
exports.checkOut = checkOut;
const getAttendanceStats = async (req, res) => {
    try {
        const { employeeId, month, year } = req.query;
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        const filter = { date: { $gte: startDate, $lte: endDate } };
        if (employeeId)
            filter.employee = employeeId;
        const attendance = await Attendance_1.default.find(filter);
        // Get today's stats for real-time dashboard
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayFilter = { date: { $gte: today, $lt: tomorrow } };
        if (employeeId)
            todayFilter.employee = employeeId;
        const todayAttendance = await Attendance_1.default.find(todayFilter);
        const stats = {
            // Monthly stats
            totalDays: attendance.length,
            presentDays: attendance.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half-day').length,
            lateDays: attendance.filter(a => a.status === 'late').length,
            halfDays: attendance.filter(a => a.status === 'half-day').length,
            totalHours: attendance.reduce((sum, a) => sum + a.totalHours, 0),
            averageHours: attendance.length > 0 ? attendance.reduce((sum, a) => sum + a.totalHours, 0) / attendance.length : 0,
            // Today's real-time stats
            todayPresent: todayAttendance.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half-day').length,
            todayLate: todayAttendance.filter(a => a.status === 'late').length,
            todayTotalHours: todayAttendance.reduce((sum, a) => sum + a.totalHours, 0),
            todayAvgHours: todayAttendance.length > 0 ? todayAttendance.reduce((sum, a) => sum + a.totalHours, 0) / todayAttendance.length : 0
        };
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching attendance stats', error });
    }
};
exports.getAttendanceStats = getAttendanceStats;
const markAttendance = async (req, res) => {
    try {
        const { employee, date, status, checkIn, checkOut, notes } = req.body;
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);
        let attendance = await Attendance_1.default.findOne({
            employee,
            date: attendanceDate
        });
        const checkInTime = new Date(checkIn);
        const checkOutTime = checkOut ? new Date(checkOut) : undefined;
        if (attendance) {
            // Update existing attendance
            attendance.status = status;
            attendance.checkIn = checkInTime;
            attendance.checkOut = checkOutTime;
            if (notes !== undefined)
                attendance.notes = notes;
            // Calculate total hours if both check-in and check-out are present
            if (attendance.checkOut && attendance.checkIn) {
                const totalMilliseconds = attendance.checkOut.getTime() - attendance.checkIn.getTime();
                const totalHours = totalMilliseconds / (1000 * 60 * 60);
                const breakTimeHours = (attendance.breakTime || 0) / 60;
                attendance.totalHours = Math.max(0, totalHours - breakTimeHours);
            }
            else {
                attendance.totalHours = 0;
            }
        }
        else {
            // Create new attendance record
            let calculatedTotalHours = 0;
            if (checkOutTime && checkInTime) {
                const totalMilliseconds = checkOutTime.getTime() - checkInTime.getTime();
                const totalHours = totalMilliseconds / (1000 * 60 * 60);
                calculatedTotalHours = Math.max(0, totalHours);
            }
            attendance = new Attendance_1.default({
                employee,
                date: attendanceDate,
                checkIn: checkInTime,
                checkOut: checkOutTime,
                status,
                notes: notes || '',
                totalHours: calculatedTotalHours,
                breakTime: 0
            });
        }
        await attendance.save();
        await attendance.populate('employee', 'firstName lastName employeeId');
        // Emit socket events for real-time updates
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('attendance:marked', attendance);
        io.emit('attendance:updated', attendance);
        res.json(attendance);
    }
    catch (error) {
        console.error('Error marking attendance:', error);
        res.status(400).json({ message: 'Error marking attendance', error: error.message });
    }
};
exports.markAttendance = markAttendance;
const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, checkIn, checkOut, notes } = req.body;
        const attendance = await Attendance_1.default.findById(id);
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }
        // Update fields if provided
        if (status)
            attendance.status = status;
        if (checkIn)
            attendance.checkIn = new Date(checkIn);
        if (checkOut)
            attendance.checkOut = new Date(checkOut);
        if (notes !== undefined)
            attendance.notes = notes;
        // Recalculate total hours if both times are present
        if (attendance.checkOut && attendance.checkIn) {
            const totalMilliseconds = attendance.checkOut.getTime() - attendance.checkIn.getTime();
            const totalHours = totalMilliseconds / (1000 * 60 * 60);
            const breakTimeHours = attendance.breakTime / 60;
            attendance.totalHours = Math.max(0, totalHours - breakTimeHours);
        }
        await attendance.save();
        await attendance.populate('employee', 'firstName lastName employeeId');
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('attendance:updated', attendance);
        res.json(attendance);
    }
    catch (error) {
        console.error('Error updating attendance:', error);
        res.status(400).json({ message: 'Error updating attendance', error: error.message });
    }
};
exports.updateAttendance = updateAttendance;
const deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await Attendance_1.default.findByIdAndDelete(id);
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('attendance:deleted', { id });
        io.emit('attendance:updated', { deleted: id });
        res.json({ message: 'Attendance record deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting attendance:', error);
        res.status(400).json({ message: 'Error deleting attendance', error: error.message });
    }
};
exports.deleteAttendance = deleteAttendance;
