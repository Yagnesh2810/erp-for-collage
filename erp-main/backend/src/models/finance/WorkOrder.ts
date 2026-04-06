import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkOrder extends Document {
  orderNumber: string;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
}

const WorkOrderSchema = new Schema<IWorkOrder>({
  orderNumber: { type: String, required: true, unique: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['planned', 'in_progress', 'completed', 'cancelled'], default: 'planned' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  materialCost: { type: Number, default: 0 },
  laborCost: { type: Number, default: 0 },
  overheadCost: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema);