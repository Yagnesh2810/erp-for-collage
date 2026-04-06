import mongoose, { Schema, Document } from 'mongoose';

export interface IFinance extends Document {
  companyId: mongoose.Types.ObjectId;
  fiscalYear: number;
  currentPeriod: string;
  baseCurrency: string;
  settings: {
    autoPostJournals: boolean;
    requireApproval: boolean;
    allowNegativeInventory: boolean;
    decimalPlaces: number;
  };
  summary: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    lastUpdated: Date;
  };
  isActive: boolean;
}

const FinanceSchema = new Schema<IFinance>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  fiscalYear: { type: Number, required: true },
  currentPeriod: { type: String, required: true },
  baseCurrency: { type: String, default: 'USD' },
  settings: {
    autoPostJournals: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: true },
    allowNegativeInventory: { type: Boolean, default: false },
    decimalPlaces: { type: Number, default: 2 }
  },
  summary: {
    totalAssets: { type: Number, default: 0 },
    totalLiabilities: { type: Number, default: 0 },
    totalEquity: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    netIncome: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IFinance>('Finance', FinanceSchema);