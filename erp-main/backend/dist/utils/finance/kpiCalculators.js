"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KPICalculators = void 0;
const financialCalculations_1 = require("./financialCalculations");
class KPICalculators {
    static calculateLiquidityRatios(data) {
        return {
            currentRatio: financialCalculations_1.FinancialCalculations.calculateCurrentRatio(data.currentAssets, data.currentLiabilities),
            quickRatio: financialCalculations_1.FinancialCalculations.calculateCurrentRatio(data.currentAssets - data.inventory, data.currentLiabilities),
            cashRatio: financialCalculations_1.FinancialCalculations.calculateCurrentRatio(data.cash, data.currentLiabilities)
        };
    }
    static calculateProfitabilityRatios(data) {
        return {
            profitMargin: financialCalculations_1.FinancialCalculations.calculateProfitMargin(data.netIncome, data.revenue),
            returnOnAssets: financialCalculations_1.FinancialCalculations.calculateReturnOnAssets(data.netIncome, data.totalAssets),
            returnOnEquity: financialCalculations_1.FinancialCalculations.calculateReturnOnEquity(data.netIncome, data.totalEquity)
        };
    }
    static calculateEfficiencyRatios(data) {
        return {
            assetTurnover: data.totalAssets === 0 ? 0 : data.revenue / data.totalAssets,
            inventoryTurnover: data.inventory === 0 ? 0 : data.costOfGoodsSold / data.inventory,
            receivablesTurnover: data.accountsReceivable === 0 ? 0 : data.revenue / data.accountsReceivable
        };
    }
    static calculateLeverageRatios(data) {
        return {
            debtToEquity: financialCalculations_1.FinancialCalculations.calculateDebtToEquityRatio(data.totalDebt, data.totalEquity),
            debtToAssets: data.totalAssets === 0 ? 0 : data.totalDebt / data.totalAssets,
            timesInterestEarned: data.interestExpense === 0 ? 0 : data.ebit / data.interestExpense
        };
    }
}
exports.KPICalculators = KPICalculators;
