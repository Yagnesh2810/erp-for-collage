import mongoose, { Document, Schema } from 'mongoose';

export interface IPayrollItem {
    type: 'EARNING' | 'DEDUCTION';
    name: string;
    amount: number;
    isTaxable: boolean;
}

export interface IPayroll extends Document {
    payrollNumber: string;
    employee: mongoose.Types.ObjectId;
    period: {
        startDate: Date;
        endDate: Date;
    };
    basicSalary: number;
    earnings: IPayrollItem[];
    deductions: IPayrollItem[];
    grossPay: number;
    netPay: number;
    taxDeductions: {
        federalTax: number;
        stateTax: number;
        socialSecurity: number;
        medicare: number;
        other: number;
    };
    status: 'DRAFT' | 'APPROVED' | 'PAID' | 'CANCELLED';
    paymentDate?: Date;
    paymentMethod?: string;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    approvedBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PayrollItemSchema = new Schema<IPayrollItem>({
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

const PayrollSchema = new Schema<IPayroll>(
    {
        payrollNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        employee: {
            type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

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

export default mongoose.model<IPayroll>('Payroll', PayrollSchema);
