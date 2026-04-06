"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalService = void 0;
const JournalEntry_1 = __importDefault(require("../../models/finance/JournalEntry"));
const LedgerTransaction_1 = __importDefault(require("../../models/finance/LedgerTransaction"));
const Account_1 = __importDefault(require("../../models/finance/Account"));
class JournalService {
    static async createJournalEntry(entryData) {
        const entry = new JournalEntry_1.default(entryData);
        await entry.save();
        // Post to ledger
        await this.postToLedger(entry);
        return entry;
    }
    static async postToLedger(entry) {
        for (const line of entry.lines) {
            const account = await Account_1.default.findById(line.accountId);
            if (!account)
                continue;
            // Update account balance
            if (line.debit > 0) {
                account.balance += line.debit;
            }
            else {
                account.balance -= line.credit;
            }
            await account.save();
            // Create ledger transaction
            const ledgerTransaction = new LedgerTransaction_1.default({
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
exports.JournalService = JournalService;
