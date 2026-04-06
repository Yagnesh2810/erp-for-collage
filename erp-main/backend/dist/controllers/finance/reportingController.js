"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfitLoss = exports.getBalanceSheet = void 0;
const Account_1 = __importDefault(require("../../models/finance/Account"));
const getBalanceSheet = async (req, res) => {
    try {
        const assets = await Account_1.default.find({ type: 'asset', isActive: true });
        const liabilities = await Account_1.default.find({ type: 'liability', isActive: true });
        const equity = await Account_1.default.find({ type: 'equity', isActive: true });
        const balanceSheet = {
            assets: { items: assets, total: assets.reduce((sum, acc) => sum + acc.balance, 0) },
            liabilities: { items: liabilities, total: liabilities.reduce((sum, acc) => sum + acc.balance, 0) },
            equity: { items: equity, total: equity.reduce((sum, acc) => sum + acc.balance, 0) }
        };
        res.json(balanceSheet);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate balance sheet' });
    }
};
exports.getBalanceSheet = getBalanceSheet;
const getProfitLoss = async (req, res) => {
    try {
        const revenue = await Account_1.default.find({ type: 'revenue', isActive: true });
        const expenses = await Account_1.default.find({ type: 'expense', isActive: true });
        const totalRevenue = revenue.reduce((sum, acc) => sum + acc.balance, 0);
        const totalExpenses = expenses.reduce((sum, acc) => sum + acc.balance, 0);
        const profitLoss = {
            revenue: totalRevenue,
            expenses: totalExpenses,
            netIncome: totalRevenue - totalExpenses
        };
        res.json(profitLoss);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate profit & loss statement' });
    }
};
exports.getProfitLoss = getProfitLoss;
