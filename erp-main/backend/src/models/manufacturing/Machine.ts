import mongoose, { Document, Schema } from 'mongoose';

export interface IMachine extends Document {
    machineNumber: string;
    name: string;
    type: string;
    manufacturer: string;
    modelName: string;
    serialNumber: string;
    purchaseDate: Date;
    warrantyExpiry?: Date;
    status: 'OPERATIONAL' | 'MAINTENANCE' | 'DOWN' | 'RETIRED';
    location: string;
    specifications: {
        capacity: string;
        powerRating: string;
        dimensions: string;
        weight: string;
    };
    maintenanceSchedule: {
        type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
        lastMaintenance?: Date;
        nextMaintenance?: Date;
    };
    operatingHours: number;
    efficiency: number;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MachineSchema = new Schema<IMachine>(
    {
        machineNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            required: true,
        },
        manufacturer: {
            type: String,
            required: true,
        },
        modelName: {
            type: String,
            required: true,
        },
        serialNumber: {
            type: String,
            required: true,
            unique: true,
        },
        purchaseDate: {
            type: Date,
            required: true,
        },
        warrantyExpiry: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['OPERATIONAL', 'MAINTENANCE', 'DOWN', 'RETIRED'],
            default: 'OPERATIONAL',
        },
        location: {
            type: String,
            required: true,
        },
        specifications: {
            capacity: { type: String },
            powerRating: { type: String },
            dimensions: { type: String },
            weight: { type: String },
        },
        maintenanceSchedule: {
            type: {
                type: String,
                enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
            },
            lastMaintenance: { type: Date },
            nextMaintenance: { type: Date },
        },
        operatingHours: {
            type: Number,
            default: 0,
            min: 0,
        },
        efficiency: {
            type: Number,
            default: 100,
            min: 0,
            max: 100,
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
MachineSchema.index({ machineNumber: 1 });
MachineSchema.index({ status: 1 });
MachineSchema.index({ serialNumber: 1 });

export default mongoose.models.Machine || mongoose.model<IMachine>('Machine', MachineSchema);
