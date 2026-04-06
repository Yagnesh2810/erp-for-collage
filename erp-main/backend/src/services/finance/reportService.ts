import Account from '../../models/finance/Account';
import ReportTemplate from '../../models/finance/ReportTemplate';

export class ReportService {
  static async generateBalanceSheet(asOfDate?: Date) {
    const assets = await Account.find({ type: 'asset', isActive: true });
    const liabilities = await Account.find({ type: 'liability', isActive: true });
    const equity = await Account.find({ type: 'equity', isActive: true });

    const currentAssets = assets.filter(acc => acc.name.toLowerCase().includes('current'));
    const nonCurrentAssets = assets.filter(acc => !acc.name.toLowerCase().includes('current'));
    const currentLiabilities = liabilities.filter(acc => acc.name.toLowerCase().includes('current'));
    const nonCurrentLiabilities = liabilities.filter(acc => !acc.name.toLowerCase().includes('current'));

    return {
      assets: {
        current: currentAssets,
        nonCurrent: nonCurrentAssets,
        total: assets.reduce((sum, acc) => sum + acc.balance, 0)
      },
      liabilities: {
        current: currentLiabilities,
        nonCurrent: nonCurrentLiabilities,
        total: liabilities.reduce((sum, acc) => sum + acc.balance, 0)
      },
      equity: {
        items: equity,
        total: equity.reduce((sum, acc) => sum + acc.balance, 0)
      },
      asOfDate: asOfDate || new Date()
    };
  }

  static async generateProfitLoss(startDate?: Date, endDate?: Date) {
    const revenue = await Account.find({ type: 'revenue', isActive: true });
    const expenses = await Account.find({ type: 'expense', isActive: true });

    const totalRevenue = revenue.reduce((sum, acc) => sum + acc.balance, 0);
    const totalExpenses = expenses.reduce((sum, acc) => sum + acc.balance, 0);

    return {
      revenue: totalRevenue,
      expenses: expenses.map(exp => ({ name: exp.name, amount: exp.balance })),
      totalExpenses,
      grossProfit: totalRevenue,
      netIncome: totalRevenue - totalExpenses,
      period: { startDate, endDate }
    };
  }
}