export class FinancialCalculations {
  static calculatePercentage(value: number, total: number): number {
    return total === 0 ? 0 : (value / total) * 100;
  }

  static calculateVariance(actual: number, budget: number): { amount: number; percentage: number } {
    const amount = actual - budget;
    const percentage = budget === 0 ? 0 : (amount / budget) * 100;
    return { amount, percentage };
  }

  static calculateCompoundGrowthRate(startValue: number, endValue: number, periods: number): number {
    if (startValue <= 0 || periods <= 0) return 0;
    return Math.pow(endValue / startValue, 1 / periods) - 1;
  }

  static calculateCurrentRatio(currentAssets: number, currentLiabilities: number): number {
    return currentLiabilities === 0 ? 0 : currentAssets / currentLiabilities;
  }

  static calculateDebtToEquityRatio(totalDebt: number, totalEquity: number): number {
    return totalEquity === 0 ? 0 : totalDebt / totalEquity;
  }

  static calculateReturnOnAssets(netIncome: number, totalAssets: number): number {
    return totalAssets === 0 ? 0 : netIncome / totalAssets;
  }

  static calculateReturnOnEquity(netIncome: number, totalEquity: number): number {
    return totalEquity === 0 ? 0 : netIncome / totalEquity;
  }

  static calculateProfitMargin(netIncome: number, revenue: number): number {
    return revenue === 0 ? 0 : netIncome / revenue;
  }
}