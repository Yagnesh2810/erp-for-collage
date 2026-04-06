"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveExpense = exports.createExpense = exports.getExpenses = exports.getExpenseSummary = void 0;
const Expense_1 = __importDefault(require("../../models/finance/Expense"));
// Get expense summary for a project
const getExpenseSummary = async (req, res) => {
    try {
        const { projectId } = req.params;
        const expenses = await Expense_1.default.find({ projectId });
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const approvedExpenses = expenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0);
        const pendingExpenses = expenses.filter(exp => exp.status === 'submitted').reduce((sum, exp) => sum + exp.amount, 0);
        const rejectedExpenses = expenses.filter(exp => exp.status === 'rejected').reduce((sum, exp) => sum + exp.amount, 0);
        const expensesByCategory = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});
        const expensesByStatus = {
            draft: expenses.filter(exp => exp.status === 'draft').reduce((sum, exp) => sum + exp.amount, 0),
            submitted: expenses.filter(exp => exp.status === 'submitted').reduce((sum, exp) => sum + exp.amount, 0),
            approved: expenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0),
            rejected: expenses.filter(exp => exp.status === 'rejected').reduce((sum, exp) => sum + exp.amount, 0),
            reimbursed: expenses.filter(exp => exp.status === 'reimbursed').reduce((sum, exp) => sum + exp.amount, 0)
        };
        res.json({
            success: true,
            data: {
                totalExpenses,
                approvedExpenses,
                pendingExpenses,
                rejectedExpenses,
                expensesByCategory,
                expensesByStatus
            }
        });
    }
    catch (error) {
        console.error('Error getting expense summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get expense summary'
        });
    }
};
exports.getExpenseSummary = getExpenseSummary;
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense_1.default.find().populate('employeeId approvedBy');
        res.json(expenses);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};
exports.getExpenses = getExpenses;
const createExpense = async (req, res) => {
    try {
        const expense = new Expense_1.default(req.body);
        await expense.save();
        res.status(201).json(expense);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create expense' });
    }
};
exports.createExpense = createExpense;
const approveExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvedBy } = req.body;
        const expense = await Expense_1.default.findByIdAndUpdate(id, {
            status: 'approved',
            approvedBy,
            approvedAt: new Date()
        }, { new: true });
        res.json(expense);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to approve expense' });
    }
};
exports.approveExpense = approveExpense;
