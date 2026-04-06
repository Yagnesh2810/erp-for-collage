"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBudgetAllocations = exports.createBudget = exports.getBudgets = void 0;
const Budget_1 = __importDefault(require("../../models/finance/Budget"));
const BudgetAllocation_1 = __importDefault(require("../../models/finance/BudgetAllocation"));
const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget_1.default.find().populate('createdBy approvedBy');
        res.json(budgets);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
};
exports.getBudgets = getBudgets;
const createBudget = async (req, res) => {
    try {
        const budget = new Budget_1.default(req.body);
        await budget.save();
        res.status(201).json(budget);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create budget' });
    }
};
exports.createBudget = createBudget;
const getBudgetAllocations = async (req, res) => {
    try {
        const { budgetId } = req.params;
        const allocations = await BudgetAllocation_1.default.find({ budgetId }).populate('accountId costCenterId');
        res.json(allocations);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch budget allocations' });
    }
};
exports.getBudgetAllocations = getBudgetAllocations;
