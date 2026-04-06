"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBudgetRules = void 0;
const Budget_1 = __importDefault(require("../../models/finance/Budget"));
const validateBudgetRules = async (req, res, next) => {
    try {
        const { fiscalYear, totalAmount } = req.body;
        // Check if budget already exists for fiscal year
        const existingBudget = await Budget_1.default.findOne({ fiscalYear, status: { $in: ['approved', 'active'] } });
        if (existingBudget) {
            return res.status(400).json({ error: 'Active budget already exists for this fiscal year' });
        }
        // Validate total amount
        if (totalAmount <= 0) {
            return res.status(400).json({ error: 'Budget amount must be greater than zero' });
        }
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Budget validation failed' });
    }
};
exports.validateBudgetRules = validateBudgetRules;
