import mongoose, { Document, Schema } from 'mongoose';

export interface ITax extends Document {
    name: string;
    code: string;
    type: 'GST' | 'VAT' | 'SALES_TAX' | 'INCOME_TAX' | 'CUSTOM';
    rate: number; // Percentage
    applicableOn: 'PRODUCTS' | 'SERVICES' | 'BOTH';
    region?: string;
    country: string;
    isActive: boolean;
    effectiveFrom: Date;
    effectiveTo?: Date;
    description?: string;
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TaxSchema = new Schema<ITax>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['GST', 'VAT', 'SALES_TAX', 'INCOME_TAX', 'CUSTOM'],
            required: true,
        },
        rate: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        applicableOn: {
            type: String,
            enum: ['PRODUCTS', 'SERVICES', 'BOTH'],
            default: 'BOTH',
        },
        region: {
            type: String,
        },
        country: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        effectiveFrom: {
            type: Date,
            required: true,
            default: Date.now,
        },
        effectiveTo: {
            type: Date,
        },
        description: {
            type: String,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
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

TaxSchema.index({ code: 1 });
TaxSchema.index({ country: 1 });
TaxSchema.index({ isActive: 1 });

export default mongoose.model<ITax>('Tax', TaxSchema);
