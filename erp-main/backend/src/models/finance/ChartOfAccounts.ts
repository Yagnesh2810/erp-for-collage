import mongoose, { Schema, Document } from 'mongoose';

export interface IChartOfAccounts extends Document {
  name: string;
  version: string;
  isActive: boolean;
  accounts: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const ChartOfAccountsSchema = new Schema<IChartOfAccounts>({
  name: { type: String, required: true },
  version: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  accounts: [{ type: Schema.Types.ObjectId, ref: 'Account' }]
}, { timestamps: true });

export default mongoose.model<IChartOfAccounts>('ChartOfAccounts', ChartOfAccountsSchema);