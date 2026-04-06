import LedgerTransaction from '../../models/finance/LedgerTransaction';
import Account from '../../models/finance/Account';

export class LedgerService {
  static async getLedgerByAccount(accountId: string, startDate?: Date, endDate?: Date) {
    const query: any = { accountId };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    return await LedgerTransaction.find(query)
      .populate('accountId')
      .sort({ date: 1 });
  }

  static async getTrialBalance() {
    const accounts = await Account.find({ isActive: true });
    
    return accounts.map(account => ({
      accountCode: account.code,
      accountName: account.name,
      debit: account.type === 'asset' || account.type === 'expense' ? account.balance : 0,
      credit: account.type === 'liability' || account.type === 'equity' || account.type === 'revenue' ? account.balance : 0
    }));
  }
}