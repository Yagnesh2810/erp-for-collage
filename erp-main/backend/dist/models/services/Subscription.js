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
const SubscriptionSchema = new mongoose_1.Schema({
    subscriptionNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    customer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    service: {
        type: mongoose_1.Schema.Types.ObjectId,
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
                type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});
SubscriptionSchema.index({ subscriptionNumber: 1 });
SubscriptionSchema.index({ customer: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ nextBillingDate: 1 });
exports.default = mongoose_1.default.model('Subscription', SubscriptionSchema);
