import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Finance from '../models/Finance';
import Account from '../models/finance/Account';

export const getFinanceDashboard = async (req: Request, res: Response) => {
  try {
    const finance = await Finance.findOne({ isActive: true });
    
    if (!finance) {
      // Create default finance record
      const newFinance = new Finance({
        companyId: new mongoose.Types.ObjectId(),
        fiscalYear: new Date().getFullYear(),
        currentPeriod: 'Q1'
      });
      await newFinance.save();
      return res.json(newFinance);
    }

    res.json(finance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch finance dashboard' });
  }
};

export const updateFinanceSummary = async (req: Request, res: Response) => {
  try {
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
    const netIncome = totalRevenue - totalExpenses;

    const finance = await Finance.findOneAndUpdate(
      { isActive: true },
      {
        'summary.totalAssets': totalAssets,
        'summary.totalLiabilities': totalLiabilities,
        'summary.totalEquity': totalEquity,
        'summary.totalRevenue': totalRevenue,
        'summary.totalExpenses': totalExpenses,
        'summary.netIncome': netIncome,
        'summary.lastUpdated': new Date()
      },
      { new: true }
    );

    res.json(finance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update finance summary' });
  }
};

export const getFinanceSettings = async (req: Request, res: Response) => {
  try {
    const finance = await Finance.findOne({ isActive: true });
    res.json(finance?.settings || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch finance settings' });
  }
};

export const updateFinanceSettings = async (req: Request, res: Response) => {
  try {
    const finance = await Finance.findOneAndUpdate(
      { isActive: true },
      { settings: req.body },
      { new: true }
    );
    res.json(finance);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update finance settings' });
  }
};