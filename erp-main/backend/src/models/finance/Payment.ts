import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  projectId: mongoose.Types.ObjectId;
  paymentNumber: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  date: Date;
  method: 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'paypal';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference: string;
  linkedInvoiceId?: mongoose.Types.ObjectId;
  clientName?: string;
  vendorName?: string;
  createdBy: mongoose.Types.ObjectId;
}

const PaymentSchema = new Schema<IPayment>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  paymentNumber: { type: String, required: true, unique: true },
  type: { type: String, enum: ['incoming', 'outgoing'], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  method: { type: String, enum: ['bank_transfer', 'credit_card', 'cash', 'check', 'paypal'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' },
  description: { type: String, required: true },
  reference: { type: String, required: true },
  linkedInvoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
  clientName: { type: String },
  vendorName: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IPayment>('Payment', PaymentSchema);