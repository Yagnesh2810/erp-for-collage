import { Request, Response } from 'express';
import Account from '../../models/finance/Account';
import ChartOfAccounts from '../../models/finance/ChartOfAccounts';

export const getChartOfAccounts = async (req: Request, res: Response) => {
  try {
    const chart = await ChartOfAccounts.findOne({ isActive: true }).populate('accounts');
    res.json(chart);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chart of accounts' });
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const account = await Account.findByIdAndUpdate(id, req.body, { new: true });
    res.json(account);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update account' });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Account.findByIdAndUpdate(id, { isActive: false });
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete account' });
  }
};