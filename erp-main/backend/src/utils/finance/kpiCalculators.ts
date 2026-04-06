import { FinancialCalculations } from './financialCalculations';

export class KPICalculators {
  static calculateLiquidityRatios(data: {
    currentAssets: number;
    currentLiabilities: number;
    cash: number;
    inventory: number;
  }) {
    return {
      currentRatio: FinancialCalculations.calculateCurrentRatio(data.currentAssets, data.currentLiabilities),
      quickRatio: FinancialCalculations.calculateCurrentRatio(
        data.currentAssets - data.inventory,
        data.currentLiabilities
      ),
      cashRatio: FinancialCalculations.calculateCurrentRatio(data.cash, data.currentLiabilities)
    };
  }

  static calculateProfitabilityRatios(data: {
    netIncome: number;
    revenue: number;
    totalAssets: number;
    totalEquity: number;
  }) {
    return {
      profitMargin: FinancialCalculations.calculateProfitMargin(data.netIncome, data.revenue),
      returnOnAssets: FinancialCalculations.calculateReturnOnAssets(data.netIncome, data.totalAssets),
      returnOnEquity: FinancialCalculations.calculateReturnOnEquity(data.netIncome, data.totalEquity)
    };
  }

  static calculateEfficiencyRatios(data: {
    revenue: number;
    totalAssets: number;
    inventory: number;
    accountsReceivable: number;
    costOfGoodsSold: number;
  }) {
    return {
      assetTurnover: data.totalAssets === 0 ? 0 : data.revenue / data.totalAssets,
      inventoryTurnover: data.inventory === 0 ? 0 : data.costOfGoodsSold / data.inventory,
      receivablesTurnover: data.accountsReceivable === 0 ? 0 : data.revenue / data.accountsReceivable
    };
  }

  static calculateLeverageRatios(data: {
    totalDebt: number;
    totalEquity: number;
    totalAssets: number;
    interestExpense: number;
    ebit: number;
  }) {
    return {
      debtToEquity: FinancialCalculations.calculateDebtToEquityRatio(data.totalDebt, data.totalEquity),
      debtToAssets: data.totalAssets === 0 ? 0 : data.totalDebt / data.totalAssets,
      timesInterestEarned: data.interestExpense === 0 ? 0 : data.ebit / data.interestExpense
    };
  }
}