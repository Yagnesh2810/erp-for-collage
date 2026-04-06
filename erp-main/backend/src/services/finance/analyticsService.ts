import Account from '../../models/finance/Account';
import FinanceMetric from '../../models/finance/FinanceMetric';

export class AnalyticsService {
  static async calculateFinancialRatios() {
    const assets = await Account.find({ type: 'asset', isActive: true });
    const liabilities = await Account.find({ type: 'liability', isActive: true });
    const equity = await Account.find({ type: 'equity', isActive: true });
    const revenue = await Account.find({ type: 'revenue', isActive: true });
    const expenses = await Account.find({ type: 'expense', isActive: true });

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
      await FinanceMetric.findOneAndUpdate(
        { name, type: 'ratio' },
        { value, period: new Date().toISOString().slice(0, 7) }, // YYYY-MM format
        { upsert: true }
      );
    }
  }
}