import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
    subscriptionNumber: string;
    customer: mongoose.Types.ObjectId;
    service: mongoose.Types.ObjectId;
    plan: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
    status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
    startDate: Date;
    endDate?: Date;
    nextBillingDate: Date;
    billingCycle: number; // in days
    price: number;
    currency: string;
    autoRenew: boolean;
    paymentMethod?: string;
    billingHistory: {
        date: Date;
        amount: number;
        status: 'SUCCESS' | 'FAILED' | 'PENDING';
        invoiceId?: mongoose.Types.ObjectId;
    }[];
    notes?: string;
    cancelledAt?: Date;
    cancelReason?: string;
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
    {
        subscriptionNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        service: {
            type: Schema.Types.ObjectId,
            ref: 'ServiceCatalog',
            required: true,
        },
        plan: {
            type: String,
            enum: ['MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM'],
            required: true,
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED'],
            default: 'ACTIVE',
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        endDate: {
            type: Date,
        },
        nextBillingDate: {
            type: Date,
            required: true,
        },
        billingCycle: {
            type: Number,
            required: true,
            min: 1,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            default: 'USD',
        },
        autoRenew: {
            type: Boolean,
            default: true,
        },
        paymentMethod: {
            type: String,
        },
        billingHistory: [{
            date: { type: Date, required: true },
            amount: { type: Number, required: true },
            status: {
                type: String,
                enum: ['SUCCESS', 'FAILED', 'PENDING'],
                required: true,
            },
            invoiceId: {
                type: Schema.Types.ObjectId,
                ref: 'Invoice',
            },
        }],
        notes: {
            type: String,
        },
        cancelledAt: {
            type: Date,
        },
        cancelReason: {
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

SubscriptionSchema.index({ subscriptionNumber: 1 });
SubscriptionSchema.index({ customer: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ nextBillingDate: 1 });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
