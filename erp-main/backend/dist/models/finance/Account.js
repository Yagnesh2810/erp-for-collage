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
const AccountSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Account',
        validate: {
            validator: function (value) {
                // Prevent self-reference
                return !value || value.toString() !== this._id?.toString();
            },
            message: 'Account cannot be its own parent'
        }
    },
    balance: {
        type: Number,
        default: 0,
        get: (v) => Math.round(v * 100) / 100 // Round to 2 decimal places
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
        default: function () {
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
AccountSchema.pre('save', function (next) {
    if (this.isModified('type')) {
        this.normalBalance = ['asset', 'expense'].includes(this.type) ? 'debit' : 'credit';
    }
    next();
});
// Virtual for account hierarchy path
AccountSchema.virtual('fullPath').get(async function () {
    if (!this.parentId)
        return this.name;
    const parent = await mongoose_1.default.model('Account').findById(this.parentId);
    return parent ? `${parent.name} > ${this.name}` : this.name;
});
// Method to check if account can be deleted
AccountSchema.methods.canBeDeleted = async function () {
    // Check for child accounts
    const childCount = await mongoose_1.default.model('Account').countDocuments({ parentId: this._id });
    if (childCount > 0) {
        return { canDelete: false, reason: 'Account has child accounts' };
    }
    // Check for journal entries
    const JournalEntry = mongoose_1.default.model('JournalEntry');
    const entryCount = await JournalEntry.countDocuments({
        'lines.accountId': this._id,
        status: 'posted'
    });
    if (entryCount > 0) {
        return { canDelete: false, reason: 'Account has posted transactions' };
    }
    return { canDelete: true };
};
exports.default = mongoose_1.default.model('Account', AccountSchema);
