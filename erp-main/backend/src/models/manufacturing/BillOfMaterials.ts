import mongoose, { Document, Schema } from 'mongoose';

export interface IBOMComponent {
    product: mongoose.Types.ObjectId;
    quantity: number;
    unit: string;
    costPerUnit: number;
    scrapPercentage: number;
    notes?: string;
}

export interface IBillOfMaterials extends Document {
    bomNumber: string;
    product: mongoose.Types.ObjectId;
    version: number;
    name: string;
    description?: string;
    components: IBOMComponent[];
    totalCost: number;
    laborCost: number;
    overheadCost: number;
    isActive: boolean;
    isDefault: boolean;
    effectiveFrom: Date;
    effectiveTo?: Date;
    productionYield: number; // Percentage
    productionTime: number; // in minutes
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const BOMComponentSchema = new Schema<IBOMComponent>({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
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
    costPerUnit: {
        type: Number,
        required: true,
        min: 0,
    },
    scrapPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    notes: {
        type: String,
    },
});

const BillOfMaterialsSchema = new Schema<IBillOfMaterials>(
    {
        bomNumber: {
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
        version: {
            type: Number,
            default: 1,
            min: 1,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
        },
        components: [BOMComponentSchema],
        totalCost: {
            type: Number,
            default: 0,
            min: 0,
        },
        laborCost: {
            type: Number,
            default: 0,
            min: 0,
        },
        overheadCost: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        effectiveFrom: {
            type: Date,
            default: Date.now,
        },
        effectiveTo: {
            type: Date,
        },
        productionYield: {
            type: Number,
            default: 100,
            min: 0,
            max: 100,
        },
        productionTime: {
            type: Number,
            default: 0,
            min: 0,
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
BillOfMaterialsSchema.index({ bomNumber: 1 });
BillOfMaterialsSchema.index({ product: 1 });
BillOfMaterialsSchema.index({ isActive: 1 });
BillOfMaterialsSchema.index({ isDefault: 1 });

// Calculate total cost before saving
BillOfMaterialsSchema.pre('save', function (next) {
    if (this.components && this.components.length > 0) {
        const materialCost = this.components.reduce((total, component) => {
            const componentCost = component.quantity * component.costPerUnit;
            const scrapCost = componentCost * (component.scrapPercentage / 100);
            return total + componentCost + scrapCost;
        }, 0);

        this.totalCost = materialCost + this.laborCost + this.overheadCost;
    }
    next();
});

export default mongoose.models.BillOfMaterials || mongoose.model<IBillOfMaterials>('BillOfMaterials', BillOfMaterialsSchema);
