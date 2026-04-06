import { Request, Response } from 'express';
import Account from '../../models/finance/Account';
import JournalEntry from '../../models/finance/JournalEntry';

// Double-entry transaction templates
export const getTransactionTemplates = async (req: Request, res: Response) => {
  try {
    const templates = [
      {
        id: 'cash_sale',
        name: 'Cash Sale',
        description: 'Record a cash sale transaction',
        lines: [
          { account: 'Cash', type: 'debit', description: 'Cash received from sale' },
          { account: 'Sales Revenue', type: 'credit', description: 'Revenue from sale' }
        ]
      },
      {
        id: 'purchase_inventory',
        name: 'Purchase Inventory',
        description: 'Purchase inventory with cash',
        lines: [
          { account: 'Inventory', type: 'debit', description: 'Inventory purchased' },
          { account: 'Cash', type: 'credit', description: 'Cash paid for inventory' }
        ]
      },
      {
        id: 'pay_expense',
        name: 'Pay Expense',
        description: 'Pay an expense with cash',
        lines: [
          { account: 'Expense Account', type: 'debit', description: 'Expense incurred' },
          { account: 'Cash', type: 'credit', description: 'Cash paid for expense' }
        ]
      },
      {
        id: 'receive_payment',
        name: 'Receive Payment',
        description: 'Receive payment from customer',
        lines: [
          { account: 'Cash', type: 'debit', description: 'Cash received' },
          { account: 'Accounts Receivable', type: 'credit', description: 'Customer payment received' }
        ]
      },
      {
        id: 'make_payment',
        name: 'Make Payment',
        description: 'Make payment to supplier',
        lines: [
          { account: 'Accounts Payable', type: 'debit', description: 'Payment to supplier' },
          { account: 'Cash', type: 'credit', description: 'Cash paid to supplier' }
        ]
      }
    ];
    
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction templates' });
  }
};

// Create double-entry transaction from template
export const createFromTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId, amount, date, description, accounts } = req.body;
    
    if (!templateId || !amount || !date || !accounts) {
      return res.status(400).json({
        error: 'Template ID, amount, date, and account mappings are required'
      });
    }
    
    // Validate accounts exist
    for (const accountId of Object.values(accounts)) {
      const account = await Account.findById(accountId);
      if (!account) {
        return res.status(400).json({
          error: `Account ${accountId} not found`
        });
      }
    }
    
    // Create journal lines based on template
    let lines = [];
    
    switch (templateId) {
      case 'cash_sale':
        lines = [
          {
            accountId: accounts.cash,
            debit: amount,
            credit: 0,
            description: description || 'Cash received from sale'
          },
          {
            accountId: accounts.revenue,
            debit: 0,
            credit: amount,
            description: description || 'Revenue from sale'
          }
        ];
        break;
        
      case 'purchase_inventory':
        lines = [
          {
            accountId: accounts.inventory,
            debit: amount,
            credit: 0,
            description: description || 'Inventory purchased'
          },
          {
            accountId: accounts.cash,
            debit: 0,
            credit: amount,
            description: description || 'Cash paid for inventory'
          }
        ];
        break;
        
      case 'pay_expense':
        lines = [
          {
            accountId: accounts.expense,
            debit: amount,
            credit: 0,
            description: description || 'Expense incurred'
          },
          {
            accountId: accounts.cash,
            debit: 0,
            credit: amount,
            description: description || 'Cash paid for expense'
          }
        ];
        break;
        
      case 'receive_payment':
        lines = [
          {
            accountId: accounts.cash,
            debit: amount,
            credit: 0,
            description: description || 'Cash received from customer'
          },
          {
            accountId: accounts.receivable,
            debit: 0,
            credit: amount,
            description: description || 'Customer payment received'
          }
        ];
        break;
        
      case 'make_payment':
        lines = [
          {
            accountId: accounts.payable,
            debit: amount,
            credit: 0,
            description: description || 'Payment to supplier'
          },
          {
            accountId: accounts.cash,
            debit: 0,
            credit: amount,
            description: description || 'Cash paid to supplier'
          }
        ];
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid template ID' });
    }
    
    // Generate entry number
    const entryNumber = await (JournalEntry as any).generateEntryNumber();
    
    // Create journal entry
    const entry = new JournalEntry({
      entryNumber,
      date: new Date(date),
      reference: `TEMPLATE-${templateId.toUpperCase()}`,
      description: description || `Transaction from ${templateId} template`,
      lines,
      totalDebit: amount,
      totalCredit: amount,
      createdBy: req.user?.id
    });
    
    await entry.save();
    
    const populatedEntry = await JournalEntry.findById(entry._id)
      .populate('lines.accountId', 'code name type normalBalance');
    
    res.status(201).json({
      ...populatedEntry.toObject(),
      template: templateId,
      doubleEntryValidation: {
        isBalanced: true,
        totalDebit: amount,
        totalCredit: amount,
        lineCount: 2
      }
    });
  } catch (error) {
    res.status(400).json({ 
      error: error.message || 'Failed to create transaction from template' 
    });
  }
};

// Validate double-entry transaction
export const validateDoubleEntry = async (req: Request, res: Response) => {
  try {
    const { lines } = req.body;
    
    if (!lines || !Array.isArray(lines)) {
      return res.status(400).json({
        error: 'Lines array is required'
      });
    }
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: {
        totalDebit: 0,
        totalCredit: 0,
        lineCount: lines.length,
        accountsAffected: []
      }
    };
    
    // Rule 1: Minimum 2 lines
    if (lines.length < 2) {
      validation.isValid = false;
      validation.errors.push('Double-entry requires minimum 2 lines');
    }
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const debit = line.debit || 0;
      const credit = line.credit || 0;
      
      // Rule 2: Each line must have either debit OR credit
      if (debit > 0 && credit > 0) {
        validation.isValid = false;
        validation.errors.push(`Line ${i + 1}: Cannot have both debit and credit`);
      }
      
      if (debit === 0 && credit === 0) {
        validation.isValid = false;
        validation.errors.push(`Line ${i + 1}: Must have either debit or credit amount`);
      }
      
      // Validate account exists
      if (line.accountId) {
        const account = await Account.findById(line.accountId);
        if (!account) {
          validation.isValid = false;
          validation.errors.push(`Line ${i + 1}: Account not found`);
        } else {
          validation.summary.accountsAffected.push({
            id: account._id,
            code: account.code,
            name: account.name,
            type: account.type,
            normalBalance: account.normalBalance
          });
          
          // Warning for unusual entries
          if ((account.normalBalance === 'debit' && credit > debit) ||
              (account.normalBalance === 'credit' && debit > credit)) {
            validation.warnings.push(
              `Line ${i + 1}: Entry opposite to account's normal balance (${account.normalBalance})`
            );
          }
        }
      }
      
      validation.summary.totalDebit += debit;
      validation.summary.totalCredit += credit;
    }
    
    // Rule 3: Debits must equal Credits
    const difference = Math.abs(validation.summary.totalDebit - validation.summary.totalCredit);
    if (difference > 0.01) {
      validation.isValid = false;
      validation.errors.push(
        `Debits (${validation.summary.totalDebit}) must equal Credits (${validation.summary.totalCredit}). Difference: ${difference}`
      );
    }
    
    (validation.summary as any).isBalanced = validation.isValid && difference < 0.01;
    
    res.json(validation);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to validate double-entry transaction' 
    });
  }
};

// Get double-entry audit report
export const getDoubleEntryAudit = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    let query: any = { status: 'posted' };
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom as string);
      if (dateTo) query.date.$lte = new Date(dateTo as string);
    }
    
    const entries = await JournalEntry.find(query)
      .populate('lines.accountId', 'code name type')
      .sort({ date: -1 });
    
    const audit = {
      period: {
        from: dateFrom || 'Beginning',
        to: dateTo || 'Current'
      },
      summary: {
        totalEntries: entries.length,
        totalDebits: 0,
        totalCredits: 0,
        balancedEntries: 0,
        unbalancedEntries: 0
      },
      entries: []
    };
    
    for (const entry of entries) {
      const validation = (entry as any).validateDoubleEntry();
      const entryAudit = {
        id: entry._id,
        entryNumber: entry.entryNumber,
        date: entry.date,
        description: entry.description,
        totalDebit: entry.totalDebit,
        totalCredit: entry.totalCredit,
        isBalanced: validation.isValid,
        errors: validation.errors,
        lines: entry.lines.map(line => ({
          account: {
            code: (line.accountId as any).code,
            name: (line.accountId as any).name,
            type: (line.accountId as any).type
          },
          debit: line.debit,
          credit: line.credit,
          description: line.description
        }))
      };
      
      audit.entries.push(entryAudit);
      audit.summary.totalDebits += entry.totalDebit;
      audit.summary.totalCredits += entry.totalCredit;
      
      if (validation.isValid) {
        audit.summary.balancedEntries++;
      } else {
        audit.summary.unbalancedEntries++;
      }
    }
    
    (audit.summary as any).systemIsBalanced = 
      Math.abs(audit.summary.totalDebits - audit.summary.totalCredits) < 0.01;
    
    res.json(audit);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate double-entry audit report' 
    });
  }
};