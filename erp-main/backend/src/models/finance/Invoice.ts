import mongoose, { Schema, Document } from 'mongoose';

export interface IInvoice extends Document {
  projectId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  description: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  createdBy: mongoose.Types.ObjectId;
}

const InvoiceSchema = new Schema<IInvoice>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  clientName: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], default: 'draft' },
  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  description: { type: String, required: true },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true }
  }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IInvoice>('Invoice', InvoiceSchema);