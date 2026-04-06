"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const Account_1 = __importDefault(require("../../models/finance/Account"));
const FinanceMetric_1 = __importDefault(require("../../models/finance/FinanceMetric"));
class AnalyticsService {
    static async calculateFinancialRatios() {
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
        return {
            currentRatio: totalAssets / totalLiabilities,
            debtToEquity: totalLiabilities / totalEquity,
            profitMargin: (totalRevenue - totalExpenses) / totalRevenue,
            returnOnAssets: (totalRevenue - totalExpenses) / totalAssets,
            returnOnEquity: (totalRevenue - totalExpenses) / totalEquity
        };
    }
    static async updateKPIs() {
        const ratios = await this.calculateFinancialRatios();
        // Update or create KPI metrics
        for (const [name, value] of Object.entries(ratios)) {
            await FinanceMetric_1.default.findOneAndUpdate({ name, type: 'ratio' }, { value, period: new Date().toISOString().slice(0, 7) }, // YYYY-MM format
            { upsert: true });
        }
    }
}
exports.AnalyticsService = AnalyticsService;
