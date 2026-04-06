"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerService = void 0;
const LedgerTransaction_1 = __importDefault(require("../../models/finance/LedgerTransaction"));
const Account_1 = __importDefault(require("../../models/finance/Account"));
class LedgerService {
    static async getLedgerByAccount(accountId, startDate, endDate) {
        const query = { accountId };
        if (startDate || endDate) {
            query.date = {};
            if (startDate)
                query.date.$gte = startDate;
            if (endDate)
                query.date.$lte = endDate;
        }
        return await LedgerTransaction_1.default.find(query)
            .populate('accountId')
            .sort({ date: 1 });
    }
    static async getTrialBalance() {
        const accounts = await Account_1.default.find({ isActive: true });
        return accounts.map(account => ({
            accountCode: account.code,
            accountName: account.name,
            debit: account.type === 'asset' || account.type === 'expense' ? account.balance : 0,
            credit: account.type === 'liability' || account.type === 'equity' || account.type === 'revenue' ? account.balance : 0
        }));
    }
}
exports.LedgerService = LedgerService;
