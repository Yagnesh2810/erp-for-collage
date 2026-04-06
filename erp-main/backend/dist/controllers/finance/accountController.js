"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.updateAccount = exports.getChartOfAccounts = void 0;
const Account_1 = __importDefault(require("../../models/finance/Account"));
const ChartOfAccounts_1 = __importDefault(require("../../models/finance/ChartOfAccounts"));
const getChartOfAccounts = async (req, res) => {
    try {
        const chart = await ChartOfAccounts_1.default.findOne({ isActive: true }).populate('accounts');
        res.json(chart);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch chart of accounts' });
    }
};
exports.getChartOfAccounts = getChartOfAccounts;
const updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const account = await Account_1.default.findByIdAndUpdate(id, req.body, { new: true });
        res.json(account);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update account' });
    }
};
exports.updateAccount = updateAccount;
const deleteAccount = async (req, res) => {
    try {
        const { id } = req.params;
        await Account_1.default.findByIdAndUpdate(id, { isActive: false });
        res.json({ message: 'Account deactivated successfully' });
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete account' });
    }
};
exports.deleteAccount = deleteAccount;
