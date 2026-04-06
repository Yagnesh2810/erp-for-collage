"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const JournalLineSchema = new mongoose_1.Schema({
    accountId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    debit: {
        type: Number,
        default: 0,
        min: [0, 'Debit amount cannot be negative'],
        get: (v) => Math.round(v * 100) / 100
    },
    credit: {
        type: Number,
        default: 0,
        min: [0, 'Credit amount cannot be negative'],
        get: (v) => Math.round(v * 100) / 100
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
JournalLineSchema.pre('validate', function (next) {
    if (this.debit > 0 && this.credit > 0) {
        next(new Error('A journal line cannot have both debit and credit amounts'));
    }
    else if (this.debit === 0 && this.credit === 0) {
        next(new Error('A journal line must have either a debit or credit amount'));
    }
    else {
        next();
    }
});
const JournalEntrySchema = new mongoose_1.Schema({
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
            validator: function (value) {
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
            validator: function (lines) {
                return lines && lines.length >= 2;
            },
            message: 'Journal entry must have at least 2 lines'
        }
    },
    totalDebit: {
        type: Number,
        required: true,
        get: (v) => Math.round(v * 100) / 100
    },
    totalCredit: {
        type: Number,
        required: true,
        get: (v) => Math.round(v * 100) / 100
    },
    status: {
        type: String,
        enum: ['draft', 'posted', 'reversed'],
        default: 'draft'
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    postedAt: {
        type: Date
    },
    reversedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
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
JournalEntrySchema.pre('save', function (next) {
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
JournalEntrySchema.methods.validateDoubleEntry = function () {
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
JournalEntrySchema.pre('save', function (next) {
    if (this.isModified('status')) {
        if (this.status === 'posted' && !this.postedAt) {
            this.postedAt = new Date();
        }
        else if (this.status === 'reversed' && !this.reversedAt) {
            this.reversedAt = new Date();
        }
    }
    next();
});
// Method to check if entry can be modified
JournalEntrySchema.methods.canBeModified = function () {
    return this.status === 'draft';
};
// Method to check if entry can be posted
JournalEntrySchema.methods.canBePosted = function () {
    return this.status === 'draft' && Math.abs(this.totalDebit - this.totalCredit) < 0.01;
};
// Method to check if entry can be reversed
JournalEntrySchema.methods.canBeReversed = function () {
    return this.status === 'posted';
};
// Static method to generate next entry number
JournalEntrySchema.statics.generateEntryNumber = async function () {
    const currentYear = new Date().getFullYear();
    const yearPrefix = currentYear.toString().slice(-2);
    const lastEntry = await this.findOne({ entryNumber: { $regex: `^JE${yearPrefix}` } }, {}, { sort: { entryNumber: -1 } });
    let nextNumber = 1;
    if (lastEntry) {
        const lastNumber = parseInt(lastEntry.entryNumber.slice(4));
        nextNumber = lastNumber + 1;
    }
    return `JE${yearPrefix}${nextNumber.toString().padStart(4, '0')}`;
};
exports.default = mongoose_1.default.model('JournalEntry', JournalEntrySchema);
