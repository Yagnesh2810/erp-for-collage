import mongoose, { Schema, Document } from 'mongoose';

export interface IAccount extends Document {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: mongoose.Types.ObjectId;
  balance: number;
  isActive: boolean;
  description?: string;
  normalBalance: 'debit' | 'credit';
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>({
  code: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    uppercase: true
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  type: { 
    type: String, 
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense'], 
    required: true 
  },
  parentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Account',
    validate: {
      validator: function(this: IAccount, value: mongoose.Types.ObjectId) {
        // Prevent self-reference
        return !value || value.toString() !== this._id?.toString();
      },
      message: 'Account cannot be its own parent'
    }
  },
  balance: { 
    type: Number, 
    default: 0,
    get: (v: number) => Math.round(v * 100) / 100 // Round to 2 decimal places
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  description: {
    type: String,
    trim: true
  },
  normalBalance: {
    type: String,
    enum: ['debit', 'credit'],
    default: function(this: IAccount) {
      return ['asset', 'expense'].includes(this.type) ? 'debit' : 'credit';
    }
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Indexes for better performance
AccountSchema.index({ code: 1 });
AccountSchema.index({ type: 1, isActive: 1 });
AccountSchema.index({ parentId: 1 });
AccountSchema.index({ name: 'text', code: 'text' });

// Pre-save middleware to set normal balance
AccountSchema.pre('save', function(next) {
  if (this.isModified('type')) {
    this.normalBalance = ['asset', 'expense'].includes(this.type) ? 'debit' : 'credit';
  }
  next();
});

// Virtual for account hierarchy path
AccountSchema.virtual('fullPath').get(async function(this: IAccount) {
  if (!this.parentId) return this.name;
  
  const parent = await mongoose.model('Account').findById(this.parentId);
  return parent ? `${parent.name} > ${this.name}` : this.name;
});

// Method to check if account can be deleted
AccountSchema.methods.canBeDeleted = async function(this: IAccount) {
  // Check for child accounts
  const childCount = await mongoose.model('Account').countDocuments({ parentId: this._id });
  if (childCount > 0) {
    return { canDelete: false, reason: 'Account has child accounts' };
  }
  
  // Check for journal entries
  const JournalEntry = mongoose.model('JournalEntry');
  const entryCount = await JournalEntry.countDocuments({
    'lines.accountId': this._id,
    status: 'posted'
  });
  
  if (entryCount > 0) {
    return { canDelete: false, reason: 'Account has posted transactions' };
  }
  
  return { canDelete: true };
};

export default mongoose.model<IAccount>('Account', AccountSchema);