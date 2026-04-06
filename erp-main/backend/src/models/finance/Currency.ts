import mongoose, { Document, Schema } from 'mongoose';

export interface ICurrency extends Document {
    code: string; // ISO 4217 code (USD, EUR, etc.)
    name: string;
    symbol: string;
    exchangeRate: number; // Rate compared to base currency
    isBaseCurrency: boolean;
    isActive: boolean;
    decimalPlaces: number;
    lastUpdated: Date;
    createdAt: Date;
    updatedAt: Date;
}

const CurrencySchema = new Schema<ICurrency>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            length: 3,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        symbol: {
            type: String,
            required: true,
        },
        exchangeRate: {
            type: Number,
            required: true,
            default: 1,
            min: 0,
        },
        isBaseCurrency: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        decimalPlaces: {
            type: Number,
            default: 2,
            min: 0,
            max: 4,
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

CurrencySchema.index({ code: 1 });
CurrencySchema.index({ isActive: 1 });
CurrencySchema.index({ isBaseCurrency: 1 });

export default mongoose.model<ICurrency>('Currency', CurrencySchema);
