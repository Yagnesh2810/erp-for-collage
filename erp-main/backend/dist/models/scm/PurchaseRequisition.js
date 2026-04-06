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
const PurchaseRequisitionSchema = new mongoose_1.Schema({
    requisitionNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    requestedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM',
    },
    requestDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    requiredBy: {
        type: Date,
        required: true,
    },
    items: [{
            product: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Product',
            },
            description: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            unit: { type: String, required: true },
            estimatedPrice: { type: Number, required: true, min: 0 },
            purpose: { type: String },
        }],
    totalEstimatedCost: {
        type: Number,
        default: 0,
        min: 0,
    },
    status: {
        type: String,
        enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CONVERTED', 'CANCELLED'],
        default: 'DRAFT',
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    approvedAt: {
        type: Date,
    },
    rejectedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    rejectedAt: {
        type: Date,
    },
    rejectionReason: {
        type: String,
    },
    purchaseOrder: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'PurchaseOrder',
    },
    notes: {
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
PurchaseRequisitionSchema.index({ requisitionNumber: 1 });
PurchaseRequisitionSchema.index({ requestedBy: 1 });
PurchaseRequisitionSchema.index({ status: 1 });
PurchaseRequisitionSchema.index({ requestDate: 1 });
// Calculate total estimated cost
PurchaseRequisitionSchema.pre('save', function (next) {
    if (this.items && this.items.length > 0) {
        this.totalEstimatedCost = this.items.reduce((sum, item) => {
            return sum + (item.quantity * item.estimatedPrice);
        }, 0);
    }
    next();
});
exports.default = mongoose_1.default.model('PurchaseRequisition', PurchaseRequisitionSchema);
