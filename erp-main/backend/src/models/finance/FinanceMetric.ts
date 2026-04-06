import mongoose, { Schema, Document } from 'mongoose';

export interface IFinanceMetric extends Document {
  name: string;
  type: 'kpi' | 'ratio' | 'trend';
  value: number;
  target?: number;
  unit: string;
  period: string;
  calculationMethod: string;
  isActive: boolean;
}

const FinanceMetricSchema = new Schema<IFinanceMetric>({
  name: { type: String, required: true },
  type: { type: String, enum: ['kpi', 'ratio', 'trend'], required: true },
  value: { type: Number, required: true },
  target: { type: Number },
  unit: { type: String, required: true },
  period: { type: String, required: true },
  calculationMethod: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IFinanceMetric>('FinanceMetric', FinanceMetricSchema);