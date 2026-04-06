"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBudgetLimits = exports.checkProjectFinanceAccess = exports.validateQueryParams = exports.validateProjectId = exports.validateCostCenter = exports.validateExpenseApproval = exports.validateExpense = exports.validateBudgetAllocation = void 0;
const Project_1 = __importDefault(require("../../models/Project"));
// Validation rules for budget allocation
exports.validateBudgetAllocation = [
    (req, res, next) => {
        const { category, allocatedAmount, description, period } = req.body;
        const errors = [];
        if (!category)
            errors.push({ field: 'category', message: 'Category is required' });
        if (!allocatedAmount || isNaN(allocatedAmount))
            errors.push({ field: 'allocatedAmount', message: 'Allocated amount must be a number' });
        if (!description)
            errors.push({ field: 'description', message: 'Description is required' });
        if (!period)
            errors.push({ field: 'period', message: 'Period is required' });
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        next();
    }
];
// Validation rules for expense creation
exports.validateExpense = [
    (req, res, next) => {
        const { category, amount, date, description, employeeId } = req.body;
        const errors = [];
        if (!category)
            errors.push({ field: 'category', message: 'Category is required' });
        if (!amount || isNaN(amount))
            errors.push({ field: 'amount', message: 'Amount must be a number' });
        if (!date)
            errors.push({ field: 'date', message: 'Valid date is required' });
        if (!description)
            errors.push({ field: 'description', message: 'Description is required' });
        if (!employeeId)
            errors.push({ field: 'employeeId', message: 'Valid employee ID is required' });
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        next();
    }
];
// Validation rules for expense approval
exports.validateExpenseApproval = [
    (req, res, next) => {
        const { status } = req.body;
        const errors = [];
        if (!status || !['approved', 'rejected'].includes(status)) {
            errors.push({ field: 'status', message: 'Status must be approved or rejected' });
        }
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        next();
    }
];
// Validation rules for cost center
exports.validateCostCenter = [
    (req, res, next) => {
        const { name, code, description, manager, budget, department } = req.body;
        const errors = [];
        if (!name)
            errors.push({ field: 'name', message: 'Name is required' });
        if (!code)
            errors.push({ field: 'code', message: 'Code is required' });
        if (!description)
            errors.push({ field: 'description', message: 'Description is required' });
        if (!manager)
            errors.push({ field: 'manager', message: 'Manager is required' });
        if (!budget || isNaN(budget))
            errors.push({ field: 'budget', message: 'Budget must be a number' });
        if (!department)
            errors.push({ field: 'department', message: 'Department is required' });
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        next();
    }
];
// Validation for project ID parameter
exports.validateProjectId = [
    async (req, res, next) => {
        try {
            const { projectId } = req.params;
            if (!projectId) {
                return res.status(400).json({ message: 'Valid project ID is required' });
            }
            const project = await Project_1.default.findById(projectId);
            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }
            next();
        }
        catch (error) {
            return res.status(500).json({ message: 'Error validating project', error });
        }
    }
];
// Validation for query parameters
exports.validateQueryParams = [
    (req, res, next) => {
        const { page, limit } = req.query;
        const errors = [];
        if (page && (isNaN(Number(page)) || Number(page) < 1)) {
            errors.push({ field: 'page', message: 'Page must be a positive integer' });
        }
        if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
            errors.push({ field: 'limit', message: 'Limit must be between 1 and 100' });
        }
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        next();
    }
];
// Check if user has permission to access project finance
const checkProjectFinanceAccess = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?.id;
        const project = await Project_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        // Check if user is project manager or team member
        const isManager = project.manager.toString() === userId;
        const isTeamMember = project.team.some(member => member.toString() === userId);
        const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
        if (!isManager && !isTeamMember && !isAdmin) {
            return res.status(403).json({ message: 'Access denied to project finance' });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ message: 'Error checking project access', error });
    }
};
exports.checkProjectFinanceAccess = checkProjectFinanceAccess;
// Check budget limits before expense approval
const checkBudgetLimits = async (req, res, next) => {
    try {
        const { projectId, expenseId } = req.params;
        const { status } = req.body;
        if (status !== 'approved') {
            return next();
        }
        const project = await Project_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        // Get expense details
        const Expense = require('../../models/finance/Expense').default;
        const expense = await Expense.findById(expenseId);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        // Check if approving this expense would exceed budget
        const currentSpent = project.finance?.totalExpenses || 0;
        const newTotal = currentSpent + expense.amount;
        if (newTotal > project.budget) {
            return res.status(400).json({
                message: 'Approving this expense would exceed project budget',
                budgetExceeded: newTotal - project.budget
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({ message: 'Error checking budget limits', error });
    }
};
exports.checkBudgetLimits = checkBudgetLimits;
