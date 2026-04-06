import JournalEntry from '../../models/finance/JournalEntry';
import LedgerTransaction from '../../models/finance/LedgerTransaction';
import Account from '../../models/finance/Account';

export class JournalService {
  static async createJournalEntry(entryData: any) {
    const entry = new JournalEntry(entryData);
    await entry.save();
    
    // Post to ledger
    await this.postToLedger(entry);
    
    return entry;
  }

  static async postToLedger(entry: any) {
    for (const line of entry.lines) {
      const account = await Account.findById(line.accountId);
      if (!account) continue;

      // Update account balance
      if (line.debit > 0) {
        account.balance += line.debit;
      } else {
        account.balance -= line.credit;
      }
      await account.save();

      // Create ledger transaction
      const ledgerTransaction = new LedgerTransaction({
        accountId: line.accountId,
        journalEntryId: entry._id,
        date: entry.date,
        debit: line.debit,
        credit: line.credit,
        balance: account.balance,
        description: line.description,
        reference: entry.reference
      });
      await ledgerTransaction.save();
    }
  }
}