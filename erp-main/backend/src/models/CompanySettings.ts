import mongoose, { Document, Schema } from 'mongoose';

export interface ICompanySettings extends Document {
    companyName: string;
    industryType: 'IT' | 'MANUFACTURING' | 'SERVICE' | 'HYBRID' | 'GENERAL';
    activeModules: {
        manufacturing: boolean;
        it: boolean;
        services: boolean;
        finance: boolean;
        hr: boolean;
        scm: boolean;
        crm: boolean;
        inventory: boolean;
        projects: boolean;
    };
    companyProfile: {
        logo?: string;
        email: string;
        phone: string;
        website?: string;
        address: {
            street: string;
            city: string;
            state: string;
            country: string;
            postalCode: string;
        };
        taxId?: string;
        registrationNumber?: string;
    };
    regionalSettings: {
        currency: string;
        currencySymbol: string;
        timezone: string;
        dateFormat: string;
        timeFormat: string;
        locale: string;
        language: string;
    };
    fiscalYear: {
        startMonth: number; // 1-12
        startDay: number; // 1-31
    };
    features: {
        multiCurrency: boolean;
        multiLocation: boolean;
        advancedReporting: boolean;
        mobileApp: boolean;
        apiAccess: boolean;
    };
    subscription: {
        plan: 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE';
        startDate: Date;
        endDate?: Date;
        maxUsers: number;
        maxStorage: number; // in GB
    };
    createdAt: Date;
    updatedAt: Date;
}

const CompanySettingsSchema = new Schema<ICompanySettings>(
    {
        companyName: {
            type: String,
            required: true,
            trim: true,
        },
        industryType: {
            type: String,
            enum: ['IT', 'MANUFACTURING', 'SERVICE', 'HYBRID', 'GENERAL'],
            default: 'GENERAL',
            required: true,
        },
        activeModules: {
            manufacturing: { type: Boolean, default: true },
            it: { type: Boolean, default: true },
            services: { type: Boolean, default: true },
            finance: { type: Boolean, default: true },
            hr: { type: Boolean, default: true },
            scm: { type: Boolean, default: true },
            crm: { type: Boolean, default: true },
            inventory: { type: Boolean, default: true },
            projects: { type: Boolean, default: true },
        },
        companyProfile: {
            logo: { type: String },
            email: { type: String, required: true },
            phone: { type: String, required: true },
            website: { type: String },
            address: {
                street: { type: String, required: true },
                city: { type: String, required: true },
                state: { type: String, required: true },
                country: { type: String, required: true },
                postalCode: { type: String, required: true },
            },
            taxId: { type: String },
            registrationNumber: { type: String },
        },
        regionalSettings: {
            currency: { type: String, default: 'USD' },
            currencySymbol: { type: String, default: '$' },
            timezone: { type: String, default: 'UTC' },
            dateFormat: { type: String, default: 'YYYY-MM-DD' },
            timeFormat: { type: String, default: '24h' },
            locale: { type: String, default: 'en-US' },
            language: { type: String, default: 'en' },
        },
        fiscalYear: {
            startMonth: { type: Number, default: 1, min: 1, max: 12 },
            startDay: { type: Number, default: 1, min: 1, max: 31 },
        },
        features: {
            multiCurrency: { type: Boolean, default: false },
            multiLocation: { type: Boolean, default: false },
            advancedReporting: { type: Boolean, default: true },
            mobileApp: { type: Boolean, default: false },
            apiAccess: { type: Boolean, default: false },
        },
        subscription: {
            plan: {
                type: String,
                enum: ['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE'],
                default: 'PROFESSIONAL',
            },
            startDate: { type: Date, default: Date.now },
            endDate: { type: Date },
            maxUsers: { type: Number, default: 50 },
            maxStorage: { type: Number, default: 100 },
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
CompanySettingsSchema.index({ companyName: 1 });

export default mongoose.model<ICompanySettings>('CompanySettings', CompanySettingsSchema);
