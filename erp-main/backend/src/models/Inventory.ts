//project\backend\src\models\Inventory.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  location: string;
  lastUpdated: Date;
  minimumStockLevel: number;
  maximumStockLevel: number;
  reorderPoint: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  batchNumber?: string;
  expiryDate?: Date;
  notes?: string;
}

const InventorySchema: Schema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    location: {
      type: String,
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    minimumStockLevel: {
      type: Number,
      default: 5,
      min: 0,
    },
    maximumStockLevel: {
      type: Number,
      default: 100,
      min: 0,
    },
    reorderPoint: {
      type: Number,
      default: 10,
      min: 0,
    },
    status: {
      type: String,
      enum: ['in-stock', 'low-stock', 'out-of-stock'],
      default: 'in-stock',
    },
    batchNumber: {
      type: String,
    },
    expiryDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to update status based on quantity and reorderPoint
InventorySchema.pre('save', function (next) {
  if (this.quantity <= 0) {
    this.status = 'out-of-stock';
  } else if (this.quantity <= this.reorderPoint) {
    this.status = 'low-stock';
  } else {
    this.status = 'in-stock';
  }
  this.lastUpdated = new Date();
  next();
});

// Create a compound index for productId and location to ensure uniqueness
InventorySchema.index({ productId: 1, location: 1 }, { unique: true });

const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);

export default Inventory;