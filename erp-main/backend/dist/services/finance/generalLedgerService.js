"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralLedgerService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Account_1 = __importDefault(require("../../models/finance/Account"));
const JournalEntry_1 = __importDefault(require("../../models/finance/JournalEntry"));
class GeneralLedgerService {
    // Account Services
    static async createChartOfAccounts() {
        const defaultAccounts = [
            // Assets
            { code: '1000', name: 'Cash', type: 'asset' },
            { code: '1100', name: 'Accounts Receivable', type: 'asset' },
            { code: '1200', name: 'Inventory', type: 'asset' },
            { code: '1500', name: 'Equipment', type: 'asset' },
            { code: '1600', name: 'Accumulated Depreciation - Equipment', type: 'asset' },
            // Liabilities
            { code: '2000', name: 'Accounts Payable', type: 'liability' },
            { code: '2100', name: 'Accrued Expenses', type: 'liability' },
            { code: '2200', name: 'Notes Payable', type: 'liability' },
            // Equity
            { code: '3000', name: 'Owner Equity', type: 'equity' },
            { code: '3100', name: 'Retained Earnings', type: 'equity' },
            // Revenue
            { code: '4000', name: 'Sales Revenue', type: 'revenue' },
            { code: '4100', name: 'Service Revenue', type: 'revenue' },
            // Expenses
            { code: '5000', name: 'Cost of Goods Sold', type: 'expense' },
            { code: '5100', name: 'Salaries Expense', type: 'expense' },
            { code: '5200', name: 'Rent Expense', type: 'expense' },
            { code: '5300', name: 'Utilities Expense', type: 'expense' },
            { code: '5400', name: 'Office Supplies Expense', type: 'expense' },
            { code: '5500', name: 'Depreciation Expense', type: 'expense' }
        ];
        const createdAccounts = [];
        for (const accountData of defaultAccounts) {
            const existingAccount = await Account_1.default.findOne({ code: accountData.code });
            if (!existingAccount) {
                const account = new Account_1.default(accountData);
                await account.save();
                createdAccounts.push(account);
            }
        }
        return createdAccounts;
    }
    static async validateAccountHierarchy(accountId, parentId) {
        if (!parentId)
            return true;
        // Check if parent exists
        const parent = await Account_1.default.findById(parentId);
        if (!parent)
            return false;
        // Check for circular reference
        let currentParent = parent;
        while (currentParent.parentId) {
            if (currentParent.parentId.toString() === accountId) {
                return false; // Circular reference detected
            }
            currentParent = await Account_1.default.findById(currentParent.parentId);
            if (!currentParent)
                break;
        }
        return true;
    }
    static async getAccountBalance(accountId, asOfDate) {
        const account = await Account_1.default.findById(accountId);
        if (!account)
            throw new Error('Account not found');
        let query = {
            'lines.accountId': accountId,
            status: 'posted'
        };
        if (asOfDate) {
            query.date = { $lte: asOfDate };
        }
        const entries = await JournalEntry_1.default.find(query);
        let balance = 0;
        for (const entry of entries) {
            for (const line of entry.lines) {
                if (line.accountId.toString() === accountId) {
                    if (['asset', 'expense'].includes(account.type)) {
                        balance += (line.debit || 0) - (line.credit || 0);
                    }
                    else {
                        balance += (line.credit || 0) - (line.debit || 0);
                    }
                }
            }
        }
        return Math.round(balance * 100) / 100;
    }
    // Journal Entry Services
    static async validateJournalEntry(entryData) {
        const errors = [];
        // Check required fields
        if (!entryData.date)
            errors.push('Date is required');
        if (!entryData.description)
            errors.push('Description is required');
        if (!entryData.lines || entryData.lines.length < 2) {
            errors.push('At least 2 journal lines are required');
        }
        // Validate lines
        if (entryData.lines) {
            let totalDebit = 0;
            let totalCredit = 0;
            for (let i = 0; i < entryData.lines.length; i++) {
                const line = entryData.lines[i];
                if (!line.accountId) {
                    errors.push(`Line ${i + 1}: Account is required`);
                }
                else {
                    // Check if account exists
                    const account = await Account_1.default.findById(line.accountId);
                    if (!account) {
                        errors.push(`Line ${i + 1}: Account not found`);
                    }
                    else if (!account.isActive) {
                        errors.push(`Line ${i + 1}: Account is inactive`);
                    }
                }
                if (!line.description) {
                    errors.push(`Line ${i + 1}: Description is required`);
                }
                const debit = line.debit || 0;
                const credit = line.credit || 0;
                if (debit < 0)
                    errors.push(`Line ${i + 1}: Debit amount cannot be negative`);
                if (credit < 0)
                    errors.push(`Line ${i + 1}: Credit amount cannot be negative`);
                if (debit > 0 && credit > 0) {
                    errors.push(`Line ${i + 1}: Cannot have both debit and credit amounts`);
                }
                if (debit === 0 && credit === 0) {
                    errors.push(`Line ${i + 1}: Must have either debit or credit amount`);
                }
                totalDebit += debit;
                totalCredit += credit;
            }
            // Check if entry is balanced
            if (Math.abs(totalDebit - totalCredit) > 0.01) {
                errors.push('Journal entry must be balanced (total debits must equal total credits)');
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    static async postJournalEntry(entryId, userId) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const entry = await JournalEntry_1.default.findById(entryId).session(session);
            if (!entry) {
                throw new Error('Journal entry not found');
            }
            if (entry.status !== 'draft') {
                throw new Error('Only draft entries can be posted');
            }
            // Validate entry before posting
            const validation = await this.validateJournalEntry(entry);
            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            // Update account balances
            for (const line of entry.lines) {
                const account = await Account_1.default.findById(line.accountId).session(session);
                if (!account) {
                    throw new Error(`Account ${line.accountId} not found`);
                }
                let balanceChange = 0;
                if (['asset', 'expense'].includes(account.type)) {
                    balanceChange = (line.debit || 0) - (line.credit || 0);
                }
                else {
                    balanceChange = (line.credit || 0) - (line.debit || 0);
                }
                await Account_1.default.findByIdAndUpdate(line.accountId, { $inc: { balance: balanceChange } }, { session });
            }
            // Update entry status
            entry.status = 'posted';
            entry.postedBy = new mongoose_1.default.Types.ObjectId(userId);
            entry.postedAt = new Date();
            await entry.save({ session });
            await session.commitTransaction();
            return entry;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    static async reverseJournalEntry(entryId, userId, reason) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const originalEntry = await JournalEntry_1.default.findById(entryId).session(session);
            if (!originalEntry) {
                throw new Error('Journal entry not found');
            }
            if (originalEntry.status !== 'posted') {
                throw new Error('Only posted entries can be reversed');
            }
            // Create reversal entry
            const reversalLines = originalEntry.lines.map(line => ({
                accountId: line.accountId,
                debit: line.credit || 0,
                credit: line.debit || 0,
                description: `Reversal: ${line.description}`
            }));
            const reversalEntryNumber = await JournalEntry_1.default.generateEntryNumber();
            const reversalEntry = new JournalEntry_1.default({
                entryNumber: reversalEntryNumber,
                date: new Date(),
                reference: `REV-${originalEntry.entryNumber}`,
                description: `Reversal of ${originalEntry.entryNumber}: ${reason}`,
                lines: reversalLines,
                totalDebit: originalEntry.totalCredit,
                totalCredit: originalEntry.totalDebit,
                status: 'posted',
                createdBy: userId,
                postedBy: userId,
                postedAt: new Date()
            });
            await reversalEntry.save({ session });
            // Update account balances for reversal
            for (const line of reversalEntry.lines) {
                const account = await Account_1.default.findById(line.accountId).session(session);
                if (!account) {
                    throw new Error(`Account ${line.accountId} not found`);
                }
                let balanceChange = 0;
                if (['asset', 'expense'].includes(account.type)) {
                    balanceChange = (line.debit || 0) - (line.credit || 0);
                }
                else {
                    balanceChange = (line.credit || 0) - (line.debit || 0);
                }
                await Account_1.default.findByIdAndUpdate(line.accountId, { $inc: { balance: balanceChange } }, { session });
            }
            // Mark original entry as reversed
            originalEntry.status = 'reversed';
            originalEntry.reversedBy = new mongoose_1.default.Types.ObjectId(userId);
            originalEntry.reversedAt = new Date();
            originalEntry.reversalReason = reason;
            await originalEntry.save({ session });
            await session.commitTransaction();
            return reversalEntry;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    // Reporting Services
    static async generateTrialBalance(asOfDate) {
        const accounts = await Account_1.default.find({ isActive: true }).sort({ code: 1 });
        const trialBalance = [];
        let totalDebits = 0;
        let totalCredits = 0;
        for (const account of accounts) {
            const balance = await this.getAccountBalance(account._id.toString(), asOfDate);
            let debit = 0;
            let credit = 0;
            if (balance !== 0) {
                if (['asset', 'expense'].includes(account.type)) {
                    if (balance > 0) {
                        debit = balance;
                    }
                    else {
                        credit = Math.abs(balance);
                    }
                }
                else {
                    if (balance > 0) {
                        credit = balance;
                    }
                    else {
                        debit = Math.abs(balance);
                    }
                }
            }
            totalDebits += debit;
            totalCredits += credit;
            trialBalance.push({
                accountId: account._id,
                accountCode: account.code,
                accountName: account.name,
                accountType: account.type,
                debit,
                credit,
                balance
            });
        }
        return {
            asOfDate: asOfDate || new Date(),
            accounts: trialBalance,
            totals: {
                debits: Math.round(totalDebits * 100) / 100,
                credits: Math.round(totalCredits * 100) / 100,
                isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
            }
        };
    }
    static async getAccountLedger(accountId, dateFrom, dateTo) {
        const account = await Account_1.default.findById(accountId);
        if (!account) {
            throw new Error('Account not found');
        }
        let query = {
            'lines.accountId': accountId,
            status: 'posted'
        };
        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom)
                query.date.$gte = dateFrom;
            if (dateTo)
                query.date.$lte = dateTo;
        }
        const entries = await JournalEntry_1.default.find(query)
            .populate('lines.accountId', 'code name type')
            .sort({ date: 1, createdAt: 1 });
        const ledger = [];
        let runningBalance = 0;
        for (const entry of entries) {
            for (const line of entry.lines) {
                if (line.accountId._id.toString() === accountId) {
                    let balanceChange = 0;
                    if (['asset', 'expense'].includes(account.type)) {
                        balanceChange = (line.debit || 0) - (line.credit || 0);
                    }
                    else {
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
                        balance: Math.round(runningBalance * 100) / 100,
                        entryNumber: entry.entryNumber,
                        status: entry.status
                    });
                }
            }
        }
        return {
            account: {
                id: account._id,
                code: account.code,
                name: account.name,
                type: account.type,
                normalBalance: account.normalBalance
            },
            ledger,
            summary: {
                openingBalance: ledger.length > 0 ? ledger[0].balance - (ledger[0].debit - ledger[0].credit) : 0,
                closingBalance: runningBalance,
                totalDebits: ledger.reduce((sum, item) => sum + item.debit, 0),
                totalCredits: ledger.reduce((sum, item) => sum + item.credit, 0),
                transactionCount: ledger.length
            }
        };
    }
}
exports.GeneralLedgerService = GeneralLedgerService;
