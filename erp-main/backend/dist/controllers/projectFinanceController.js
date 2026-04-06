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
exports.getProjectFinanceReports = exports.updateProjectBudget = exports.deleteProjectExpense = exports.updateProjectExpense = exports.createProjectExpense = exports.getProjectFinance = void 0;
const Project_1 = __importDefault(require("../models/Project"));
const Expense_1 = __importDefault(require("../models/finance/Expense"));
const Invoice_1 = __importDefault(require("../models/finance/Invoice"));
// Get project finance overview
const getProjectFinance = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const expenses = await Expense_1.default.find({
            projectId,
            status: { $in: ['approved', 'reimbursed'] }
        }).populate('employeeId', 'firstName lastName');
        const invoices = await Invoice_1.default.find({ projectId }).sort({ createdAt: -1 });
        const financeData = {
            budget: project.budget,
            totalExpenses: project.finance?.totalExpenses || 0,
            totalRevenue: project.finance?.totalRevenue || 0,
            profitLoss: project.finance?.profitLoss || 0,
            remainingBudget: project.budget - (project.finance?.totalExpenses || 0),
            expenses: expenses,
            invoices: invoices
        };
        res.json(financeData);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching project finance data', error });
    }
};
exports.getProjectFinance = getProjectFinance;
// Create project expense
const createProjectExpense = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const expenseData = {
            ...req.body,
            projectId,
            sourceModule: 'PMS'
        };
        const expense = new Expense_1.default(expenseData);
        await expense.save();
        await expense.populate('employeeId', 'firstName lastName');
        // Update project expense references
        await Project_1.default.findByIdAndUpdate(projectId, {
            $push: { 'finance.expenseIds': expense._id }
        });
        // Emit socket event
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('project:finance:updated', { projectId, expense });
        res.status(201).json(expense);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating project expense', error });
    }
};
exports.createProjectExpense = createProjectExpense;
// Update project expense
const updateProjectExpense = async (req, res) => {
    try {
        const { projectId, expenseId } = req.params;
        const expense = await Expense_1.default.findOneAndUpdate({ _id: expenseId, projectId }, req.body, { new: true, runValidators: true }).populate('employeeId', 'firstName lastName');
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        // Emit socket event
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('project:finance:updated', { projectId, expense });
        res.json(expense);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating project expense', error });
    }
};
exports.updateProjectExpense = updateProjectExpense;
// Delete project expense
const deleteProjectExpense = async (req, res) => {
    try {
        const { projectId, expenseId } = req.params;
        const expense = await Expense_1.default.findOneAndDelete({ _id: expenseId, projectId });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        // Remove from project expense references
        await Project_1.default.findByIdAndUpdate(projectId, {
            $pull: { 'finance.expenseIds': expenseId }
        });
        // Emit socket event
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('project:finance:updated', { projectId, deletedExpenseId: expenseId });
        res.json({ message: 'Expense deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting project expense', error });
    }
};
exports.deleteProjectExpense = deleteProjectExpense;
// Update project budget
const updateProjectBudget = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { budget } = req.body;
        const project = await Project_1.default.findByIdAndUpdate(projectId, { budget }, { new: true, runValidators: true });
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        // Emit socket event
        const { io } = await Promise.resolve().then(() => __importStar(require('../server')));
        io.emit('project:finance:updated', { projectId, budget });
        res.json({ budget: project.budget });
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating project budget', error });
    }
};
exports.updateProjectBudget = updateProjectBudget;
// Get project financial reports
const getProjectFinanceReports = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await Project_1.default.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const expenses = await Expense_1.default.find({
            projectId,
            status: { $in: ['approved', 'reimbursed'] }
        }).populate('employeeId', 'firstName lastName');
        // Group expenses by category
        const expensesByCategory = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});
        // Monthly expense breakdown
        const monthlyExpenses = expenses.reduce((acc, expense) => {
            const month = new Date(expense.date).toISOString().slice(0, 7);
            acc[month] = (acc[month] || 0) + expense.amount;
            return acc;
        }, {});
        const reports = {
            summary: {
                budget: project.budget,
                totalExpenses: project.finance?.totalExpenses || 0,
                remainingBudget: project.budget - (project.finance?.totalExpenses || 0),
                budgetUtilization: ((project.finance?.totalExpenses || 0) / project.budget) * 100
            },
            expensesByCategory,
            monthlyExpenses,
            recentExpenses: expenses.slice(-10)
        };
        res.json(reports);
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating project finance reports', error });
    }
};
exports.getProjectFinanceReports = getProjectFinanceReports;
