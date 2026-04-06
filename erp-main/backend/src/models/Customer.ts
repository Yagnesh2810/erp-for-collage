// project\backend\src\models\Customer.ts

import mongoose, { Schema, Document } from 'mongoose';

interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  address: IAddress;
  contactPerson?: string;
  customerType: 'regular' | 'wholesale' | 'vip';
  taxId?: string;
  notes?: string;
  active: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  // Purchase history tracking
  lastPurchaseDate?: Date;
  totalOrders?: number;
  totalSpent?: number;
  creditLimit?: number;
  creditStatus?: 'good' | 'review' | 'hold';
  // Add the loyaltyPoints field
  loyaltyPoints?: number;
}

const CustomerSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required']
      },
      city: {
        type: String,
        required: [true, 'City is required']
      },
      state: {
        type: String,
        required: [true, 'State is required']
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required']
      },
      country: {
        type: String,
        required: [true, 'Country is required']
      }
    },
    contactPerson: {
      type: String,
      trim: true
    },
    customerType: {
      type: String,
      enum: ['regular', 'wholesale', 'vip'],
      default: 'regular'
    },
    taxId: {
      type: String,
      trim: true
    },
    notes: {
      type: String
    },
    active: {
      type: Boolean,
      default: true
    },
    tags: [String],
    // Purchase history tracking fields
    lastPurchaseDate: {
      type: Date
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    creditLimit: {
      type: Number,
      default: 5000 // Default credit limit
    },
    creditStatus: {
      type: String,
      enum: ['good', 'review', 'hold'],
      default: 'good'
    },
    // Add loyaltyPoints field to schema
    loyaltyPoints: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Add an index for faster searching
CustomerSchema.index({ name: 'text', email: 'text', 'address.city': 'text' });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);