"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceSummary = exports.getDepartmentSummary = exports.getEmployeeReport = void 0;
const Employee_1 = __importDefault(require("../models/Employee"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Leave_1 = __importDefault(require("../models/Leave"));
const getEmployeeReport = async (req, res) => {
    try {
        const { startDate, endDate, department } = req.query;
        const filter = {};
        if (department)
            filter.department = department;
        const employees = await Employee_1.default.find(filter);
        const report = await Promise.all(employees.map(async (emp) => {
            const attendanceFilter = { employee: emp._id };
            if (startDate && endDate) {
                attendanceFilter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
            }
            const attendance = await Attendance_1.default.find(attendanceFilter);
            const leaves = await Leave_1.default.find({ employee: emp._id, status: 'approved', ...attendanceFilter });
            return {
                employee: {
                    _id: emp._id,
                    employeeId: emp.employeeId,
                    name: `${emp.firstName} ${emp.lastName}`,
                    department: emp.department,
                    position: emp.position,
                    salary: emp.salary
                },
                attendance: {
                    totalDays: attendance.length,
                    presentDays: attendance.filter(a => a.status === 'present').length,
                    lateDays: attendance.filter(a => a.status === 'late').length,
                    totalHours: attendance.reduce((sum, a) => sum + a.totalHours, 0)
                },
                leaves: {
                    totalLeaves: leaves.reduce((sum, l) => sum + l.totalDays, 0),
                    leavesByType: leaves.reduce((acc, l) => {
                        acc[l.leaveType] = (acc[l.leaveType] || 0) + l.totalDays;
                        return acc;
                    }, {})
                },
            };
        }));
        res.json(report);
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating employee report', error });
    }
};
exports.getEmployeeReport = getEmployeeReport;
const getDepartmentSummary = async (req, res) => {
    try {
        const departments = await Employee_1.default.aggregate([
            { $group: { _id: '$department', count: { $sum: 1 }, avgSalary: { $avg: '$salary' } } },
            { $sort: { count: -1 } }
        ]);
        res.json(departments);
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating department summary', error });
    }
};
exports.getDepartmentSummary = getDepartmentSummary;
const getAttendanceSummary = async (req, res) => {
    try {
        const { month, year } = req.query;
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        const summary = await Attendance_1.default.aggregate([
            { $match: { date: { $gte: startDate, $lte: endDate } } },
            { $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalHours: { $sum: '$totalHours' }
                } }
        ]);
        res.json(summary);
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating attendance summary', error });
    }
};
exports.getAttendanceSummary = getAttendanceSummary;
