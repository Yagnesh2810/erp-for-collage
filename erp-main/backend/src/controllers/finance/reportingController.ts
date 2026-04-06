import { Request, Response } from 'express';
import ReportTemplate from '../../models/finance/ReportTemplate';
import Account from '../../models/finance/Account';

export const getBalanceSheet = async (req: Request, res: Response) => {
  try {
    const assets = await Account.find({ type: 'asset', isActive: true });
    const liabilities = await Account.find({ type: 'liability', isActive: true });
    const equity = await Account.find({ type: 'equity', isActive: true });
    
    const balanceSheet = {
      assets: { items: assets, total: assets.reduce((sum, acc) => sum + acc.balance, 0) },
      liabilities: { items: liabilities, total: liabilities.reduce((sum, acc) => sum + acc.balance, 0) },
      equity: { items: equity, total: equity.reduce((sum, acc) => sum + acc.balance, 0) }
    };
    
    res.json(balanceSheet);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate balance sheet' });
  }
};

export const getProfitLoss = async (req: Request, res: Response) => {
  try {
    const revenue = await Account.find({ type: 'revenue', isActive: true });
    const expenses = await Account.find({ type: 'expense', isActive: true });
    
    const totalRevenue = revenue.reduce((sum, acc) => sum + acc.balance, 0);
    const totalExpenses = expenses.reduce((sum, acc) => sum + acc.balance, 0);
    
    const profitLoss = {
      revenue: totalRevenue,
      expenses: totalExpenses,
      netIncome: totalRevenue - totalExpenses
    };
    
    res.json(profitLoss);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate profit & loss statement' });
  }
};