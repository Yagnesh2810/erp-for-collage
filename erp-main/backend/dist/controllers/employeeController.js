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
exports.getEmployeeUserCredentials = exports.getEmployeeTaskStats = exports.getEmployeeTasks = exports.deleteEmployee = exports.updateEmployee = exports.createEmployee = exports.getEmployeeById = exports.getAllEmployees = void 0;
const Employee_1 = __importDefault(require("../models/Employee"));
const Task_1 = __importDefault(require("../models/Task"));
const User_1 = __importStar(require("../models/User"));
// Socket will be imported dynamically to avoid circular dependency
const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee_1.default.find().populate('manager', 'firstName lastName');
        res.json(employees);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching employees', error });
    }
};
exports.getAllEmployees = getAllEmployees;
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee_1.default.findById(req.params.id).populate('manager', 'firstName lastName');
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching employee', error });
    }
};
exports.getEmployeeById = getEmployeeById;
const createEmployee = async (req, res) => {
    try {
        const employeeData = req.body;
        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'department', 'position', 'salary', 'hireDate'];
        const missingFields = requiredFields.filter(field => !employeeData[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: 'Missing required fields',
                missingFields,
                error: `Please provide: ${missingFields.join(', ')}`
            });
        }
        // Check if email already exists
        const existingEmployee = await Employee_1.default.findOne({ email: employeeData.email });
        if (existingEmployee) {
            return res.status(400).json({
                message: 'Employee with this email already exists',
                error: 'Email must be unique'
            });
        }
        const lastEmployee = await Employee_1.default.findOne().sort({ employeeId: -1 });
        const nextId = lastEmployee ?
            `EMP${(parseInt(lastEmployee.employeeId.slice(3)) + 1).toString().padStart(4, '0')}` :
            'EMP0001';
        employeeData.employeeId = nextId;
        const employee = new Employee_1.default(employeeData);
        await employee.save();
        // Create user account for the employee with normal role
        let userCreated = false;
        try {
            const existingUser = await User_1.default.findOne({ email: employee.email });
            if (!existingUser) {
                const defaultPassword = `${employee.firstName.toLowerCase()}123`; // Simple default password
                await User_1.default.create({
                    name: `${employee.firstName} ${employee.lastName}`,
                    email: employee.email,
                    password: defaultPassword,
                    role: User_1.UserRole.NORMAL
                });
                userCreated = true;
            }
        }
        catch (userError) {
            console.warn('Failed to create user account for employee:', userError);
            // Continue with employee creation even if user creation fails
        }
        // Emit socket events
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('employee:created', employee);
        io.emit('dashboard:refresh'); // Trigger dashboard refresh
        res.status(201).json({
            employee,
            userCreated,
            message: userCreated ?
                `Employee created successfully. User account created with email: ${employee.email} and default password: ${employee.firstName.toLowerCase()}123` :
                'Employee created successfully. User account already exists or creation failed.'
        });
    }
    catch (error) {
        console.error('Employee creation error:', error);
        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: 'Validation failed',
                error: validationErrors.join(', '),
                details: error.errors
            });
        }
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                message: `Duplicate ${field}`,
                error: `${field} already exists`
            });
        }
        res.status(400).json({
            message: 'Error creating employee',
            error: error.message || 'Unknown error occurred'
        });
    }
};
exports.createEmployee = createEmployee;
const updateEmployee = async (req, res) => {
    try {
        const oldEmployee = await Employee_1.default.findById(req.params.id);
        const employee = await Employee_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        // Update corresponding user account if email or name changed
        if (oldEmployee && (oldEmployee.email !== employee.email ||
            oldEmployee.firstName !== employee.firstName ||
            oldEmployee.lastName !== employee.lastName)) {
            try {
                await User_1.default.findOneAndUpdate({ email: oldEmployee.email }, {
                    email: employee.email,
                    name: `${employee.firstName} ${employee.lastName}`
                });
            }
            catch (userError) {
                console.warn('Failed to update user account for employee:', userError);
            }
        }
        // Emit socket events
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('employee:updated', employee);
        io.emit('dashboard:refresh'); // Trigger dashboard refresh
        res.json(employee);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating employee', error });
    }
};
exports.updateEmployee = updateEmployee;
const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee_1.default.findByIdAndDelete(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        // Delete corresponding user account
        try {
            await User_1.default.findOneAndDelete({ email: employee.email });
        }
        catch (userError) {
            console.warn('Failed to delete user account for employee:', userError);
        }
        // Emit socket event
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('employee:deleted', { id: req.params.id });
        res.json({ message: 'Employee and associated user account deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting employee', error });
    }
};
exports.deleteEmployee = deleteEmployee;
const getEmployeeTasks = async (req, res) => {
    try {
        const tasks = await Task_1.default.find({ assignedTo: req.params.id })
            .populate('project', 'name')
            .populate('assignedBy', 'firstName lastName');
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching employee tasks', error });
    }
};
exports.getEmployeeTasks = getEmployeeTasks;
const getEmployeeTaskStats = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const totalTasks = await Task_1.default.countDocuments({ assignedTo: employeeId });
        const completedTasks = await Task_1.default.countDocuments({ assignedTo: employeeId, status: 'completed' });
        const inProgressTasks = await Task_1.default.countDocuments({ assignedTo: employeeId, status: 'in-progress' });
        const overdueTasks = await Task_1.default.countDocuments({
            assignedTo: employeeId,
            dueDate: { $lt: new Date() },
            status: { $ne: 'completed' }
        });
        const stats = {
            totalTasks,
            completedTasks,
            inProgressTasks,
            overdueTasks,
            todoTasks: await Task_1.default.countDocuments({ assignedTo: employeeId, status: 'todo' }),
            reviewTasks: await Task_1.default.countDocuments({ assignedTo: employeeId, status: 'review' })
        };
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching employee task stats', error });
    }
};
exports.getEmployeeTaskStats = getEmployeeTaskStats;
const getEmployeeUserCredentials = async (req, res) => {
    try {
        const employee = await Employee_1.default.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        const user = await User_1.default.findOne({ email: employee.email }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User account not found for this employee' });
        }
        // Return user info and default password pattern
        const defaultPassword = `${employee.firstName.toLowerCase()}123`;
        res.json({
            user: {
                email: user.email,
                role: user.role,
                status: user.status
            },
            defaultPassword,
            message: 'Employee can login with email and default password. Recommend changing password after first login.'
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching employee user credentials', error });
    }
};
exports.getEmployeeUserCredentials = getEmployeeUserCredentials;
