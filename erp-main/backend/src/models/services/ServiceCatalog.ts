import mongoose, { Document, Schema } from 'mongoose';

export interface IServiceCatalog extends Document {
    serviceCode: string;
    name: string;
    category: string;
    description: string;
    duration: number; // in minutes
    price: number;
    currency: string;
    available: boolean;
    requirements?: string[];
    inclusions?: string[];
    exclusions?: string[];
    providers: mongoose.Types.ObjectId[]; // Employees who can provide this service
    images?: string[];
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ServiceCatalogSchema = new Schema<IServiceCatalog>(
    {
        serviceCode: {
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
        category: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
            min: 0,
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
        available: {
            type: Boolean,
            default: true,
        },
        requirements: [{
            type: String,
        }],
        inclusions: [{
            type: String,
        }],
        exclusions: [{
            type: String,
        }],
        providers: [{
            type: Schema.Types.ObjectId,
            ref: 'Employee',
        }],
        images: [{
            type: String,
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

ServiceCatalogSchema.index({ serviceCode: 1 });
ServiceCatalogSchema.index({ category: 1 });
ServiceCatalogSchema.index({ available: 1 });

export default mongoose.model<IServiceCatalog>('ServiceCatalog', ServiceCatalogSchema);
