import mongoose, { Schema, Document } from 'mongoose';

export interface IFiscalPeriod extends Document {
  year: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isClosed: boolean;
  periods: {
    name: string;
    startDate: Date;
    endDate: Date;
    isClosed: boolean;
  }[];
}

const FiscalPeriodSchema = new Schema<IFiscalPeriod>({
  year: { type: Number, required: true, unique: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: false },
  isClosed: { type: Boolean, default: false },
  periods: [{
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isClosed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

export default mongoose.model<IFiscalPeriod>('FiscalPeriod', FiscalPeriodSchema);