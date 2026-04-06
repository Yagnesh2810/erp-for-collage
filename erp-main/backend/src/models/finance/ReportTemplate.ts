import mongoose, { Schema, Document } from 'mongoose';

export interface IReportTemplate extends Document {
  name: string;
  type: 'balance_sheet' | 'profit_loss' | 'cash_flow' | 'custom';
  structure: any;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const ReportTemplateSchema = new Schema<IReportTemplate>({
  name: { type: String, required: true },
  type: { type: String, enum: ['balance_sheet', 'profit_loss', 'cash_flow', 'custom'], required: true },
  structure: { type: Schema.Types.Mixed, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IReportTemplate>('ReportTemplate', ReportTemplateSchema);