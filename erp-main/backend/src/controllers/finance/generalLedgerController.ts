import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Account from '../../models/finance/Account';
import JournalEntry from '../../models/finance/JournalEntry';

// Chart of Accounts
export const getAccounts = async (req: Request, res: Response) => {
  try {
    const { type, search, isActive = true } = req.query;
    
    let query: any = { isActive };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    
    const accounts = await Account.find(query)
      .populate('parentId', 'name code')
      .sort({ code: 1 });
    
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

export const getAccountById = async (req: Request, res: Response) => {
  try {
    const account = await Account.findById(req.params.id).populate('parentId');
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch account' });
  }
};

export const createAccount = async (req: Request, res: Response) => {
  try {
    const { code, name, type, parentId } = req.body;
    
    // Validate required fields
    if (!code || !name || !type) {
      return res.status(400).json({ error: 'Code, name, and type are required' });
    }
    
    // Check if account code already exists
    const existingAccount = await Account.findOne({ code });
    if (existingAccount) {
      return res.status(400).json({ error: 'Account code already exists' });
    }
    
    const account = new Account({ code, name, type, parentId });
    await account.save();
    
    const populatedAccount = await Account.findById(account._id).populate('parentId');
    res.status(201).json(populatedAccount);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create account' });
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Don't allow updating the account code if it would create a duplicate
    if (updates.code) {
      const existingAccount = await Account.findOne({ 
        code: updates.code, 
        _id: { $ne: id } 
      });
      if (existingAccount) {
        return res.status(400).json({ error: 'Account code already exists' });
      }
    }
    
    const account = await Account.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    ).populate('parentId');
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json(account);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update account' });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if account has transactions
    const hasTransactions = await JournalEntry.findOne({
      'lines.accountId': id,
      status: 'posted'
    });
    
    if (hasTransactions) {
      return res.status(400).json({ 
        error: 'Cannot delete account with posted transactions. Deactivate instead.' 
      });
    }
    
    // Check if account has child accounts
    const hasChildren = await Account.findOne({ parentId: id });
    if (hasChildren) {
      return res.status(400).json({ 
        error: 'Cannot delete account with child accounts' 
      });
    }
    
    const account = await Account.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
};

// Journal Entries
export const getJournalEntries = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo, status, accountId } = req.query;
    
    let query: any = {};
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom as string);
      if (dateTo) query.date.$lte = new Date(dateTo as string);
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (accountId) {
      query['lines.accountId'] = accountId;
    }
    
    const entries = await JournalEntry.find(query)
      .populate('lines.accountId', 'code name')
      .populate('createdBy', 'name email')
      .sort({ date: -1, createdAt: -1 });
    
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
};

export const getJournalEntryById = async (req: Request, res: Response) => {
  try {
    const entry = await JournalEntry.findById(req.params.id)
      .populate('lines.accountId', 'code name')
      .populate('createdBy', 'name email');
    
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
};

export const createJournalEntry = async (req: Request, res: Response) => {
  try {
    const { date, reference, description, lines } = req.body;
    
    // DOUBLE-ENTRY VALIDATION
    if (!date || !description || !lines || lines.length < 2) {
      return res.status(400).json({ 
        error: 'DOUBLE-ENTRY REQUIREMENT: Date, description, and minimum 2 lines required' 
      });
    }
    
    // Calculate totals and validate double-entry balance
    let totalDebit = 0;
    let totalCredit = 0;
    const doubleEntryErrors = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line.accountId) {
        doubleEntryErrors.push(`Line ${i + 1}: Account required`);
      }
      
      const debit = line.debit || 0;
      const credit = line.credit || 0;
      
      // Double-entry rule: Each line must have EITHER debit OR credit (not both)
      if (debit > 0 && credit > 0) {
        doubleEntryErrors.push(`Line ${i + 1}: Cannot have both debit and credit (violates double-entry)`);
      }
      if (debit === 0 && credit === 0) {
        doubleEntryErrors.push(`Line ${i + 1}: Must have either debit or credit amount`);
      }
      
      totalDebit += debit;
      totalCredit += credit;
    }
    
    // FUNDAMENTAL DOUBLE-ENTRY RULE: Debits must equal Credits
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      doubleEntryErrors.push(`DOUBLE-ENTRY VIOLATION: Debits (${totalDebit}) must equal Credits (${totalCredit})`);
    }
    
    if (doubleEntryErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Double-entry validation failed',
        details: doubleEntryErrors
      });
    }
    
    // Generate entry number
    const entryNumber = await (JournalEntry as any).generateEntryNumber();
    
    const entry = new JournalEntry({
      entryNumber,
      date,
      reference,
      description,
      lines,
      totalDebit,
      totalCredit,
      createdBy: req.user?.id || new mongoose.Types.ObjectId()
    });
    
    // Validate double-entry before saving
    const validation = (entry as any).validateDoubleEntry();
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Double-entry validation failed',
        details: validation.errors
      });
    }
    
    await entry.save();
    
    const populatedEntry = await JournalEntry.findById(entry._id)
      .populate('lines.accountId', 'code name type normalBalance')
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      ...populatedEntry.toObject(),
      doubleEntryValidation: {
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
        totalDebit,
        totalCredit,
        lineCount: lines.length
      }
    });
  } catch (error) {
    res.status(400).json({ 
      error: error.message || 'Failed to create journal entry'
    });
  }
};

export const updateJournalEntry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const entry = await JournalEntry.findById(id);
    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    if (entry.status === 'posted') {
      return res.status(400).json({ 
        error: 'Cannot update posted journal entry' 
      });
    }
    
    const updates = req.body;
    
    // Recalculate totals if lines are updated
    if (updates.lines) {
      let totalDebit = 0;
      let totalCredit = 0;
      
      for (const line of updates.lines) {
        totalDebit += line.debit || 0;
        totalCredit += line.credit || 0;
      }
      
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return res.status(400).json({ 
          error: 'Journal entry must be balanced' 
        });
      }
      
      updates.totalDebit = totalDebit;
      updates.totalCredit = totalCredit;
    }
    
    const updatedEntry = await JournalEntry.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('lines.accountId', 'code name');
    
    res.json(updatedEntry);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update journal entry' });
  }
};

export const postJournalEntry = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { id } = req.params;
    
    const entry = await JournalEntry.findById(id).session(session);
    if (!entry) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    if (entry.status === 'posted') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Journal entry already posted' });
    }
    
    // Update account balances
    for (const line of entry.lines) {
      const account = await Account.findById(line.accountId).session(session);
      if (!account) {
        await session.abortTransaction();
        return res.status(400).json({ 
          error: `Account ${line.accountId} not found` 
        });
      }
      
      // Calculate balance change based on account type
      let balanceChange = 0;
      if (['asset', 'expense'].includes(account.type)) {
        balanceChange = (line.debit || 0) - (line.credit || 0);
      } else {
        balanceChange = (line.credit || 0) - (line.debit || 0);
      }
      
      await Account.findByIdAndUpdate(
        line.accountId,
        { $inc: { balance: balanceChange } },
        { session }
      );
    }
    
    // Update journal entry status
    entry.status = 'posted';
    await entry.save({ session });
    
    await session.commitTransaction();
    
    const updatedEntry = await JournalEntry.findById(id)
      .populate('lines.accountId', 'code name');
    
    res.json(updatedEntry);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to post journal entry' });
  } finally {
    session.endSession();
  }
};

// Account Ledger
export const getAccountLedger = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { dateFrom, dateTo } = req.query;
    
    let query: any = {
      'lines.accountId': accountId,
      status: 'posted'
    };
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom as string);
      if (dateTo) query.date.$lte = new Date(dateTo as string);
    }
    
    const entries = await JournalEntry.find(query)
      .populate('lines.accountId', 'code name type')
      .sort({ date: 1, createdAt: 1 });
    
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Build ledger with running balance
    const ledger = [];
    let runningBalance = 0;
    
    for (const entry of entries) {
      for (const line of entry.lines) {
        if (line.accountId._id.toString() === accountId) {
          let balanceChange = 0;
          if (['asset', 'expense'].includes(account.type)) {
            balanceChange = (line.debit || 0) - (line.credit || 0);
          } else {
            balanceChange = (line.credit || 0) - (line.debit || 0);
          }
          
          runningBalance += balanceChange;
          
          ledger.push({
            id: entry._id,
            date: entry.date,
            reference: entry.reference || entry.entryNumber,
            description: line.description,
            debit: line.debit || 0,
            credit: line.credit || 0,
            balance: runningBalance
          });
        }
      }
    }
    
    res.json({
      account: {
        id: account._id,
        code: account.code,
        name: account.name,
        type: account.type
      },
      ledger
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch account ledger' });
  }
};

// Trial Balance
export const getTrialBalance = async (req: Request, res: Response) => {
  try {
    const { asOfDate } = req.query;
    
    const accounts = await Account.find({ isActive: true }).sort({ code: 1 });
    
    const trialBalance = accounts.map(account => {
      const debit = ['asset', 'expense'].includes(account.type) && account.balance > 0 
        ? account.balance : 0;
      const credit = ['liability', 'equity', 'revenue'].includes(account.type) && account.balance > 0 
        ? account.balance : 0;
      
      return {
        accountId: account._id,
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        debit,
        credit
      };
    });
    
    const totalDebits = trialBalance.reduce((sum, item) => sum + item.debit, 0);
    const totalCredits = trialBalance.reduce((sum, item) => sum + item.credit, 0);
    
    res.json({
      asOfDate: asOfDate || new Date(),
      accounts: trialBalance,
      totals: {
        debits: totalDebits,
        credits: totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate trial balance' });
  }
};

// Dashboard Stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalAccounts = await Account.countDocuments({ isActive: true });
    const totalJournalEntries = await JournalEntry.countDocuments();
    const postedEntries = await JournalEntry.countDocuments({ status: 'posted' });
    const draftEntries = await JournalEntry.countDocuments({ status: 'draft' });
    
    const accounts = await Account.find({ isActive: true });
    const totalAssets = accounts
      .filter(acc => acc.type === 'asset')
      .reduce((sum, acc) => sum + acc.balance, 0);
    
    const totalLiabilities = accounts
      .filter(acc => acc.type === 'liability')
      .reduce((sum, acc) => sum + acc.balance, 0);
    
    const totalEquity = accounts
      .filter(acc => acc.type === 'equity')
      .reduce((sum, acc) => sum + acc.balance, 0);
    
    res.json({
      totalAccounts,
      totalJournalEntries,
      postedEntries,
      draftEntries,
      totalAssets,
      totalLiabilities,
      totalEquity,
      isTrialBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};