import mongoose, { Document, Schema } from 'mongoose';

export interface IBatchLot extends Document {
    batchNumber: string;
    product: mongoose.Types.ObjectId;
    workOrder?: mongoose.Types.ObjectId;
    quantity: number;
    unit: string;
    productionDate: Date;
    expiryDate?: Date;
    status: 'ACTIVE' | 'QUARANTINE' | 'RELEASED' | 'EXPIRED' | 'RECALLED';
    location: string;
    qcRecords: mongoose.Types.ObjectId[];
    traceability: {
        rawMaterialBatches: string[];
        productionSteps: {
            step: string;
            timestamp: Date;
            operator: mongoose.Types.ObjectId;
            notes?: string;
        }[];
    };
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const BatchLotSchema = new Schema<IBatchLot>(
    {
        batchNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        workOrder: {
            type: Schema.Types.ObjectId,
            ref: 'WorkOrder',
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        unit: {
            type: String,
            required: true,
            default: 'pcs',
        },
        productionDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        expiryDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'QUARANTINE', 'RELEASED', 'EXPIRED', 'RECALLED'],
            default: 'ACTIVE',
        },
        location: {
            type: String,
            required: true,
        },
        qcRecords: [{
            type: Schema.Types.ObjectId,
            ref: 'QualityControl',
        }],
        traceability: {
            rawMaterialBatches: [{
                type: String,
            }],
            productionSteps: [{
                step: { type: String, required: true },
                timestamp: { type: Date, required: true },
                operator: {
                    type: Schema.Types.ObjectId,
                    ref: 'Employee',
                    required: true,
                },
                notes: { type: String },
            }],
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

// Indexes
BatchLotSchema.index({ batchNumber: 1 });
BatchLotSchema.index({ product: 1 });
BatchLotSchema.index({ workOrder: 1 });
BatchLotSchema.index({ status: 1 });
BatchLotSchema.index({ productionDate: 1 });

export default mongoose.models.BatchLot || mongoose.model<IBatchLot>('BatchLot', BatchLotSchema);
