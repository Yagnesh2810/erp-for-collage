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
const PayrollItemSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['EARNING', 'DEDUCTION'],
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    isTaxable: {
        type: Boolean,
        default: true,
    },
});
const PayrollSchema = new mongoose_1.Schema({
    payrollNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    employee: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    period: {
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    basicSalary: {
        type: Number,
        required: true,
        min: 0,
    },
    earnings: [PayrollItemSchema],
    deductions: [PayrollItemSchema],
    grossPay: {
        type: Number,
        default: 0,
        min: 0,
    },
    netPay: {
        type: Number,
        default: 0,
        min: 0,
    },
    taxDeductions: {
        federalTax: { type: Number, default: 0 },
        stateTax: { type: Number, default: 0 },
        socialSecurity: { type: Number, default: 0 },
        medicare: { type: Number, default: 0 },
        other: { type: Number, default: 0 },
    },
    status: {
        type: String,
        enum: ['DRAFT', 'APPROVED', 'PAID', 'CANCELLED'],
        default: 'DRAFT',
    },
    paymentDate: {
        type: Date,
    },
    paymentMethod: {
        type: String,
    },
    notes: {
        type: String,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});
PayrollSchema.index({ payrollNumber: 1 });
PayrollSchema.index({ employee: 1 });
PayrollSchema.index({ status: 1 });
PayrollSchema.index({ 'period.startDate': 1 });
// Calculate gross and net pay before saving
PayrollSchema.pre('save', function (next) {
    // Calculate gross pay
    const totalEarnings = this.earnings.reduce((sum, item) => sum + item.amount, 0);
    this.grossPay = this.basicSalary + totalEarnings;
    // Calculate total deductions
    const totalDeductions = this.deductions.reduce((sum, item) => sum + item.amount, 0);
    const totalTaxes = Object.values(this.taxDeductions).reduce((sum, tax) => sum + tax, 0);
    // Calculate net pay
    this.netPay = this.grossPay - totalDeductions - totalTaxes;
    next();
});
exports.default = mongoose_1.default.model('Payroll', PayrollSchema);
