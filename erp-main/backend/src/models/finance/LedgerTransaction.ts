import mongoose, { Schema, Document } from 'mongoose';

export interface ILedgerTransaction extends Document {
  accountId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  journalEntryId?: mongoose.Types.ObjectId;
  type: 'income' | 'expense' | 'transfer' | 'adjustment';
  category: string;
  amount: number;
  date: Date;
  debit: number;
  credit: number;
  balance: number;
  description: string;
  reference: string;
  employee: string;
  status: 'completed' | 'pending' | 'cancelled';
  ledgerAccount: string;
  accountCode: string;
  balanceAfter: number;
  createdBy: mongoose.Types.ObjectId;
}

const LedgerTransactionSchema = new Schema<ILedgerTransaction>({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account' },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  journalEntryId: { type: Schema.Types.ObjectId, ref: 'JournalEntry' },
  type: { type: String, enum: ['income', 'expense', 'transfer', 'adjustment'], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  description: { type: String, required: true },
  reference: { type: String, required: true },
  employee: { type: String, default: 'System' },
  status: { type: String, enum: ['completed', 'pending', 'cancelled'], default: 'completed' },
  ledgerAccount: { type: String, required: true },
  accountCode: { type: String, required: true },
  balanceAfter: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<ILedgerTransaction>('LedgerTransaction', LedgerTransactionSchema);