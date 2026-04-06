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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ExpenseSchema = new mongoose_1.Schema({
    employeeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee', required: true },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project' },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    receipts: [{ type: String }],
    status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected', 'reimbursed'], default: 'draft' },
    approvedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    reimbursedAt: { type: Date },
    sourceModule: { type: String, enum: ['PMS', 'FINANCE'], default: 'FINANCE' }
}, { timestamps: true });
// Update project finance totals when expense is saved
ExpenseSchema.post('save', async function () {
    if (this.projectId && this.status === 'approved') {
        const Project = require('../Project').default;
        await updateProjectFinanceTotals(this.projectId);
    }
});
// Update project finance totals when expense is updated
ExpenseSchema.post('findOneAndUpdate', async function () {
    const expense = await mongoose_1.default.model('Expense').findOne(this.getQuery());
    if (expense && expense.projectId) {
        await updateProjectFinanceTotals(expense.projectId);
    }
});
// Helper function to update project finance totals
async function updateProjectFinanceTotals(projectId) {
    const Project = require('../Project').default;
    const expenses = await mongoose_1.default.model('Expense').find({
        projectId,
        status: 'approved'
    });
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    await Project.findByIdAndUpdate(projectId, {
        'finance.totalExpenses': totalExpenses,
        'finance.profitLoss': 0 - totalExpenses,
        spentBudget: totalExpenses
    });
}
exports.default = mongoose_1.default.model('Expense', ExpenseSchema);
