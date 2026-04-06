import mongoose, { Document, Schema } from 'mongoose';

export interface IQualityControl extends Document {
    qcNumber: string;
    workOrder?: mongoose.Types.ObjectId;
    product: mongoose.Types.ObjectId;
    inspectionType: 'INCOMING' | 'IN_PROCESS' | 'FINAL' | 'RANDOM';
    status: 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'CONDITIONAL';
    inspectionDate: Date;
    inspector: mongoose.Types.ObjectId;
    quantityInspected: number;
    quantityPassed: number;
    quantityFailed: number;
    defects: {
        defectType: string;
        severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
        quantity: number;
        description: string;
    }[];
    measurements: {
        parameter: string;
        specification: string;
        actual: string;
        status: 'PASS' | 'FAIL';
    }[];
    notes?: string;
    attachments?: string[];
    correctiveAction?: string;
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const QualityControlSchema = new Schema<IQualityControl>(
    {
        qcNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        workOrder: {
            type: Schema.Types.ObjectId,
            ref: 'WorkOrder',
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        inspectionType: {
            type: String,
            enum: ['INCOMING', 'IN_PROCESS', 'FINAL', 'RANDOM'],
            required: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'CONDITIONAL'],
            default: 'PENDING',
        },
        inspectionDate: {
            type: Date,
            default: Date.now,
        },
        inspector: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
        },
        quantityInspected: {
            type: Number,
            required: true,
            min: 0,
        },
        quantityPassed: {
            type: Number,
            default: 0,
            min: 0,
        },
        quantityFailed: {
            type: Number,
            default: 0,
            min: 0,
        },
        defects: [{
            defectType: { type: String, required: true },
            severity: {
                type: String,
                enum: ['CRITICAL', 'MAJOR', 'MINOR'],
                required: true,
            },
            quantity: { type: Number, required: true, min: 0 },
            description: { type: String },
        }],
        measurements: [{
            parameter: { type: String, required: true },
            specification: { type: String, required: true },
            actual: { type: String, required: true },
            status: {
                type: String,
                enum: ['PASS', 'FAIL'],
                required: true,
            },
        }],
        notes: {
            type: String,
        },
        attachments: [{
            type: String,
        }],
        correctiveAction: {
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
QualityControlSchema.index({ qcNumber: 1 });
QualityControlSchema.index({ workOrder: 1 });
QualityControlSchema.index({ product: 1 });
QualityControlSchema.index({ status: 1 });
QualityControlSchema.index({ inspectionDate: 1 });

export default mongoose.models.QualityControl || mongoose.model<IQualityControl>('QualityControl', QualityControlSchema);
