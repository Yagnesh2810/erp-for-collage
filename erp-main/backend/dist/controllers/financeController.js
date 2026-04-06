"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFinanceSettings = exports.getFinanceSettings = exports.updateFinanceSummary = exports.getFinanceDashboard = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Finance_1 = __importDefault(require("../models/Finance"));
const Account_1 = __importDefault(require("../models/finance/Account"));
const getFinanceDashboard = async (req, res) => {
    try {
        const finance = await Finance_1.default.findOne({ isActive: true });
        if (!finance) {
            // Create default finance record
            const newFinance = new Finance_1.default({
                companyId: new mongoose_1.default.Types.ObjectId(),
                fiscalYear: new Date().getFullYear(),
                currentPeriod: 'Q1'
            });
            await newFinance.save();
            return res.json(newFinance);
        }
        res.json(finance);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch finance dashboard' });
    }
};
exports.getFinanceDashboard = getFinanceDashboard;
const updateFinanceSummary = async (req, res) => {
    try {
        const assets = await Account_1.default.find({ type: 'asset', isActive: true });
        const liabilities = await Account_1.default.find({ type: 'liability', isActive: true });
        const equity = await Account_1.default.find({ type: 'equity', isActive: true });
        const revenue = await Account_1.default.find({ type: 'revenue', isActive: true });
        const expenses = await Account_1.default.find({ type: 'expense', isActive: true });
        const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
        const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
        const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0);
        const totalRevenue = revenue.reduce((sum, acc) => sum + acc.balance, 0);
        const totalExpenses = expenses.reduce((sum, acc) => sum + acc.balance, 0);
        const netIncome = totalRevenue - totalExpenses;
        const finance = await Finance_1.default.findOneAndUpdate({ isActive: true }, {
            'summary.totalAssets': totalAssets,
            'summary.totalLiabilities': totalLiabilities,
            'summary.totalEquity': totalEquity,
            'summary.totalRevenue': totalRevenue,
            'summary.totalExpenses': totalExpenses,
            'summary.netIncome': netIncome,
            'summary.lastUpdated': new Date()
        }, { new: true });
        res.json(finance);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update finance summary' });
    }
};
exports.updateFinanceSummary = updateFinanceSummary;
const getFinanceSettings = async (req, res) => {
    try {
        const finance = await Finance_1.default.findOne({ isActive: true });
        res.json(finance?.settings || {});
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch finance settings' });
    }
};
exports.getFinanceSettings = getFinanceSettings;
const updateFinanceSettings = async (req, res) => {
    try {
        const finance = await Finance_1.default.findOneAndUpdate({ isActive: true }, { settings: req.body }, { new: true });
        res.json(finance);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update finance settings' });
    }
};
exports.updateFinanceSettings = updateFinanceSettings;
