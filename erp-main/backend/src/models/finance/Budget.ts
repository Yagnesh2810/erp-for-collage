import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  name: string;
  fiscalYear: number;
  status: 'draft' | 'approved' | 'active' | 'closed';
  totalAmount: number;
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
}

const BudgetSchema = new Schema<IBudget>({
  name: { type: String, required: true },
  fiscalYear: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'approved', 'active', 'closed'], default: 'draft' },
  totalAmount: { type: Number, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<IBudget>('Budget', BudgetSchema);