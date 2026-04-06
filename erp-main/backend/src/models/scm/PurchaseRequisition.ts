import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchaseRequisition extends Document {
    requisitionNumber: string;
    requestedBy: mongoose.Types.ObjectId;
    department: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    requestDate: Date;
    requiredBy: Date;
    items: {
        product?: mongoose.Types.ObjectId;
        description: string;
        quantity: number;
        unit: string;
        estimatedPrice: number;
        purpose: string;
    }[];
    totalEstimatedCost: number;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONVERTED' | 'CANCELLED';
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    rejectedBy?: mongoose.Types.ObjectId;
    rejectedAt?: Date;
    rejectionReason?: string;
    purchaseOrder?: mongoose.Types.ObjectId;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PurchaseRequisitionSchema = new Schema<IPurchaseRequisition>(
    {
        requisitionNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        requestedBy: {
            type: Schema.Types.ObjectId,
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
                type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        approvedAt: {
            type: Date,
        },
        rejectedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        rejectedAt: {
            type: Date,
        },
        rejectionReason: {
            type: String,
        },
        purchaseOrder: {
            type: Schema.Types.ObjectId,
            ref: 'PurchaseOrder',
        },
        notes: {
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

export default mongoose.model<IPurchaseRequisition>('PurchaseRequisition', PurchaseRequisitionSchema);
