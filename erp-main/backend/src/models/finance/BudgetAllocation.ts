import mongoose, { Schema, Document } from 'mongoose';

export interface IBudgetAllocation extends Document {
  budgetId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  accountId?: mongoose.Types.ObjectId;
  costCenterId?: mongoose.Types.ObjectId;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  period: string;
  actualAmount: number;
  variance: number;
  status: 'active' | 'exceeded' | 'completed' | 'inactive';
  description: string;
  createdBy: mongoose.Types.ObjectId;
}

const BudgetAllocationSchema = new Schema<IBudgetAllocation>({
  budgetId: { type: Schema.Types.ObjectId, ref: 'Budget' },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  accountId: { type: Schema.Types.ObjectId, ref: 'Account' },
  costCenterId: { type: Schema.Types.ObjectId, ref: 'CostCenter' },
  category: { type: String, required: true },
  allocatedAmount: { type: Number, required: true },
  spentAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, default: 0 },
  period: { type: String, required: true },
  actualAmount: { type: Number, default: 0 },
  variance: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'exceeded', 'completed', 'inactive'], default: 'active' },
  description: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IBudgetAllocation>('BudgetAllocation', BudgetAllocationSchema);