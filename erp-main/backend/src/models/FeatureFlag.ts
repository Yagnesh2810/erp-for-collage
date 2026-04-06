import mongoose, { Document, Schema } from 'mongoose';

export interface IFeatureFlag extends Document {
    name: string;
    key: string;
    description: string;
    enabled: boolean;
    module: string;
    environments: string[];
    rolloutPercentage: number;
    conditions: {
        industryTypes?: string[];
        subscriptionPlans?: string[];
        minVersion?: string;
    };
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const FeatureFlagSchema = new Schema<IFeatureFlag>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },
        description: {
            type: String,
            required: true,
        },
        enabled: {
            type: Boolean,
            default: false,
        },
        module: {
            type: String,
            required: true,
            enum: ['MANUFACTURING', 'IT', 'SERVICE', 'FINANCE', 'HR', 'SCM', 'CRM', 'INVENTORY', 'PROJECTS', 'CORE'],
        },
        environments: {
            type: [String],
            default: ['production'],
            enum: ['development', 'staging', 'production'],
        },
        rolloutPercentage: {
            type: Number,
            default: 100,
            min: 0,
            max: 100,
        },
        conditions: {
            industryTypes: {
                type: [String],
                enum: ['IT', 'MANUFACTURING', 'SERVICE', 'HYBRID', 'GENERAL'],
            },
            subscriptionPlans: {
                type: [String],
                enum: ['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE'],
            },
            minVersion: {
                type: String,
            },
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries
FeatureFlagSchema.index({ key: 1 });
FeatureFlagSchema.index({ module: 1 });
FeatureFlagSchema.index({ enabled: 1 });

export default mongoose.model<IFeatureFlag>('FeatureFlag', FeatureFlagSchema);
