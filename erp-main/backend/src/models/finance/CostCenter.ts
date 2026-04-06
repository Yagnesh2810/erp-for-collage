import mongoose, { Schema, Document } from 'mongoose';

export interface ICostCenter extends Document {
  code: string;
  name: string;
  description: string;
  projectId?: mongoose.Types.ObjectId;
  managerId: mongoose.Types.ObjectId;
  manager: string;
  parentId?: mongoose.Types.ObjectId;
  budget: number;
  spent: number;
  remaining: number;
  actualCosts: number;
  variance: number;
  employees: number;
  department: string;
  status: 'active' | 'inactive' | 'over-budget';
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const CostCenterSchema = new Schema<ICostCenter>({
  code: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  managerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  manager: { type: String, required: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'CostCenter' },
  budget: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
  actualCosts: { type: Number, default: 0 },
  variance: { type: Number, default: 0 },
  employees: { type: Number, default: 0 },
  department: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive', 'over-budget'], default: 'active' },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<ICostCenter>('CostCenter', CostCenterSchema);