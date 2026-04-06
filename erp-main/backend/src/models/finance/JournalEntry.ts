import mongoose, { Schema, Document } from 'mongoose';

export interface IJournalLine {
  _id?: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  debit: number;
  credit: number;
  description: string;
}

export interface IJournalEntry extends Document {
  entryNumber: string;
  date: Date;
  reference?: string;
  description: string;
  lines: IJournalLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'reversed';
  createdBy: mongoose.Types.ObjectId;
  postedBy?: mongoose.Types.ObjectId;
  postedAt?: Date;
  reversedBy?: mongoose.Types.ObjectId;
  reversedAt?: Date;
  reversalReason?: string;
  attachments?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const JournalLineSchema = new Schema<IJournalLine>({
  accountId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Account', 
    required: true 
  },
  debit: { 
    type: Number, 
    default: 0,
    min: [0, 'Debit amount cannot be negative'],
    get: (v: number) => Math.round(v * 100) / 100
  },
  credit: { 
    type: Number, 
    default: 0,
    min: [0, 'Credit amount cannot be negative'],
    get: (v: number) => Math.round(v * 100) / 100
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  }
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Validation to ensure either debit or credit (but not both) has a value
JournalLineSchema.pre('validate', function(next) {
  if (this.debit > 0 && this.credit > 0) {
    next(new Error('A journal line cannot have both debit and credit amounts'));
  } else if (this.debit === 0 && this.credit === 0) {
    next(new Error('A journal line must have either a debit or credit amount'));
  } else {
    next();
  }
});

const JournalEntrySchema = new Schema<IJournalEntry>({
  entryNumber: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    uppercase: true
  },
  date: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(value: Date) {
        // Don't allow future dates beyond today
        return value <= new Date();
      },
      message: 'Journal entry date cannot be in the future'
    }
  },
  reference: { 
    type: String,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  lines: {
    type: [JournalLineSchema],
    validate: {
      validator: function(lines: IJournalLine[]) {
        return lines && lines.length >= 2;
      },
      message: 'Journal entry must have at least 2 lines'
    }
  },
  totalDebit: { 
    type: Number, 
    required: true,
    get: (v: number) => Math.round(v * 100) / 100
  },
  totalCredit: { 
    type: Number, 
    required: true,
    get: (v: number) => Math.round(v * 100) / 100
  },
  status: { 
    type: String, 
    enum: ['draft', 'posted', 'reversed'], 
    default: 'draft' 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  postedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  postedAt: { 
    type: Date 
  },
  reversedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reversedAt: { 
    type: Date 
  },
  reversalReason: {
    type: String,
    trim: true
  },
  attachments: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Indexes for better performance
JournalEntrySchema.index({ entryNumber: 1 });
JournalEntrySchema.index({ date: -1, createdAt: -1 });
JournalEntrySchema.index({ status: 1, date: -1 });
JournalEntrySchema.index({ 'lines.accountId': 1, status: 1 });
JournalEntrySchema.index({ createdBy: 1 });
JournalEntrySchema.index({ reference: 1 });

// Double-entry bookkeeping validation
JournalEntrySchema.pre('save', function(next) {
  // Calculate totals from lines
  this.totalDebit = this.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  this.totalCredit = this.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  
  // Round to avoid floating point precision issues
  this.totalDebit = Math.round(this.totalDebit * 100) / 100;
  this.totalCredit = Math.round(this.totalCredit * 100) / 100;
  
  // DOUBLE-ENTRY RULE: Debits must equal Credits
  if (Math.abs(this.totalDebit - this.totalCredit) > 0.01) {
    return next(new Error('DOUBLE-ENTRY VIOLATION: Total debits must equal total credits'));
  }
  
  // Ensure minimum 2 lines for double-entry
  if (this.lines.length < 2) {
    return next(new Error('DOUBLE-ENTRY REQUIREMENT: Minimum 2 accounts required'));
  }
  
  next();
});

// Method to validate double-entry rules
JournalEntrySchema.methods.validateDoubleEntry = function(this: IJournalEntry) {
  const errors = [];
  
  // Rule 1: At least 2 lines
  if (this.lines.length < 2) {
    errors.push('Double-entry requires at least 2 accounts');
  }
  
  // Rule 2: Debits = Credits
  if (Math.abs(this.totalDebit - this.totalCredit) > 0.01) {
    errors.push(`Debits (${this.totalDebit}) must equal Credits (${this.totalCredit})`);
  }
  
  // Rule 3: Each line must have either debit OR credit (not both)
  this.lines.forEach((line, index) => {
    if (line.debit > 0 && line.credit > 0) {
      errors.push(`Line ${index + 1}: Cannot have both debit and credit`);
    }
    if (line.debit === 0 && line.credit === 0) {
      errors.push(`Line ${index + 1}: Must have either debit or credit amount`);
    }
  });
  
  return { isValid: errors.length === 0, errors };
};

// Pre-save middleware to set posted/reversed timestamps
JournalEntrySchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'posted' && !this.postedAt) {
      this.postedAt = new Date();
    } else if (this.status === 'reversed' && !this.reversedAt) {
      this.reversedAt = new Date();
    }
  }
  next();
});

// Method to check if entry can be modified
JournalEntrySchema.methods.canBeModified = function(this: IJournalEntry) {
  return this.status === 'draft';
};

// Method to check if entry can be posted
JournalEntrySchema.methods.canBePosted = function(this: IJournalEntry) {
  return this.status === 'draft' && Math.abs(this.totalDebit - this.totalCredit) < 0.01;
};

// Method to check if entry can be reversed
JournalEntrySchema.methods.canBeReversed = function(this: IJournalEntry) {
  return this.status === 'posted';
};

// Static method to generate next entry number
JournalEntrySchema.statics.generateEntryNumber = async function() {
  const currentYear = new Date().getFullYear();
  const yearPrefix = currentYear.toString().slice(-2);
  
  const lastEntry = await this.findOne(
    { entryNumber: { $regex: `^JE${yearPrefix}` } },
    {},
    { sort: { entryNumber: -1 } }
  );
  
  let nextNumber = 1;
  if (lastEntry) {
    const lastNumber = parseInt(lastEntry.entryNumber.slice(4));
    nextNumber = lastNumber + 1;
  }
  
  return `JE${yearPrefix}${nextNumber.toString().padStart(4, '0')}`;
};

export default mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);