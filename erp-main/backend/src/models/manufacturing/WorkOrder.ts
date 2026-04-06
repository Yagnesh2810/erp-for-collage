import mongoose, { Document, Schema } from 'mongoose';

export interface IMaterialConsumption {
    product: mongoose.Types.ObjectId;
    plannedQuantity: number;
    actualQuantity: number;
    unit: string;
    cost: number;
}

export interface IWorkOrder extends Document {
    workOrderNumber: string;
    product: mongoose.Types.ObjectId;
    bom: mongoose.Types.ObjectId;
    quantity: number;
    unit: string;
    status: 'PLANNED' | 'RELEASED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    scheduledStartDate: Date;
    scheduledEndDate: Date;
    actualStartDate?: Date;
    actualEndDate?: Date;
    assignedTo: mongoose.Types.ObjectId[];
    materialConsumption: IMaterialConsumption[];
    plannedCost: number;
    actualCost: number;
    completedQuantity: number;
    rejectedQuantity: number;
    scrapQuantity: number;
    productionYield: number;
    notes?: string;
    qualityChecks: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MaterialConsumptionSchema = new Schema<IMaterialConsumption>({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    plannedQuantity: {
        type: Number,
        required: true,
        min: 0,
    },
    actualQuantity: {
        type: Number,
        default: 0,
        min: 0,
    },
    unit: {
        type: String,
        required: true,
    },
    cost: {
        type: Number,
        default: 0,
        min: 0,
    },
});

const WorkOrderSchema = new Schema<IWorkOrder>(
    {
        workOrderNumber: {
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
        bom: {
            type: Schema.Types.ObjectId,
            ref: 'BillOfMaterials',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        unit: {
            type: String,
            required: true,
            default: 'pcs',
        },
        status: {
            type: String,
            enum: ['PLANNED', 'RELEASED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'],
            default: 'PLANNED',
        },
        priority: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
            default: 'MEDIUM',
        },
        scheduledStartDate: {
            type: Date,
            required: true,
        },
        scheduledEndDate: {
            type: Date,
            required: true,
        },
        actualStartDate: {
            type: Date,
        },
        actualEndDate: {
            type: Date,
        },
        assignedTo: [{
            type: Schema.Types.ObjectId,
            ref: 'Employee',
        }],
        materialConsumption: [MaterialConsumptionSchema],
        plannedCost: {
            type: Number,
            default: 0,
            min: 0,
        },
        actualCost: {
            type: Number,
            default: 0,
            min: 0,
        },
        completedQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },
        rejectedQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },
        scrapQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },
        productionYield: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        notes: {
            type: String,
        },
        qualityChecks: [{
            type: Schema.Types.ObjectId,
            ref: 'QualityControl',
        }],
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
WorkOrderSchema.index({ workOrderNumber: 1 });
WorkOrderSchema.index({ product: 1 });
WorkOrderSchema.index({ status: 1 });
WorkOrderSchema.index({ priority: 1 });
WorkOrderSchema.index({ scheduledStartDate: 1 });

// Calculate production yield before saving
WorkOrderSchema.pre('save', function (next) {
    if (this.quantity > 0) {
        this.productionYield = (this.completedQuantity / this.quantity) * 100;
    }
    next();
});

export default mongoose.models.WorkOrder || mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema);
