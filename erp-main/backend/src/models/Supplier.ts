import mongoose from 'mongoose';

export interface ISupplier {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  products?: mongoose.Types.ObjectId[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const supplierSchema = new mongoose.Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Supplier email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Supplier phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Supplier address is required'],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
    },
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],

    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);

export default Supplier;