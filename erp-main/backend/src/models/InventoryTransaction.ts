//project\backend\src\models\InventoryTransaction.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IInventoryTransaction extends Document {
  inventoryId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  type: 'receive' | 'issue' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  referenceId?: mongoose.Types.ObjectId; // Can link to orders, purchases, etc.
  referenceType?: string; // 'Order', 'Purchase', etc.
  performedBy: mongoose.Types.ObjectId; // User who performed the transaction
  date: Date;
  notes?: string;
}

const InventoryTransactionSchema: Schema = new Schema(
  {
    inventoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      enum: ['receive', 'issue', 'adjustment', 'transfer', 'return'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
    },
    referenceType: {
      type: String,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const InventoryTransaction = mongoose.model<IInventoryTransaction>(
  'InventoryTransaction',
  InventoryTransactionSchema
);

export default InventoryTransaction;