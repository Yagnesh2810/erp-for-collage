"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkExpenseApprovalRights = void 0;
const Expense_1 = __importDefault(require("../../models/finance/Expense"));
const checkExpenseApprovalRights = async (req, res, next) => {
    try {
        const { id } = req.params;
        const expense = await Expense_1.default.findById(id).populate('employeeId');
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        // Check if expense is in submittable status
        if (expense.status !== 'submitted') {
            return res.status(400).json({ error: 'Expense is not in submitted status' });
        }
        // Add expense to request for controller use
        req.body.expense = expense;
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Expense approval validation failed' });
    }
};
exports.checkExpenseApprovalRights = checkExpenseApprovalRights;
