"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialCalculations = void 0;
class FinancialCalculations {
    static calculatePercentage(value, total) {
        return total === 0 ? 0 : (value / total) * 100;
    }
    static calculateVariance(actual, budget) {
        const amount = actual - budget;
        const percentage = budget === 0 ? 0 : (amount / budget) * 100;
        return { amount, percentage };
    }
    static calculateCompoundGrowthRate(startValue, endValue, periods) {
        if (startValue <= 0 || periods <= 0)
            return 0;
        return Math.pow(endValue / startValue, 1 / periods) - 1;
    }
    static calculateCurrentRatio(currentAssets, currentLiabilities) {
        return currentLiabilities === 0 ? 0 : currentAssets / currentLiabilities;
    }
    static calculateDebtToEquityRatio(totalDebt, totalEquity) {
        return totalEquity === 0 ? 0 : totalDebt / totalEquity;
    }
    static calculateReturnOnAssets(netIncome, totalAssets) {
        return totalAssets === 0 ? 0 : netIncome / totalAssets;
    }
    static calculateReturnOnEquity(netIncome, totalEquity) {
        return totalEquity === 0 ? 0 : netIncome / totalEquity;
    }
    static calculateProfitMargin(netIncome, revenue) {
        return revenue === 0 ? 0 : netIncome / revenue;
    }
}
exports.FinancialCalculations = FinancialCalculations;
