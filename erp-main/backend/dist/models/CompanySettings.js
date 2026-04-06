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
const CompanySettingsSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
// Index for faster queries
CompanySettingsSchema.index({ companyName: 1 });
exports.default = mongoose_1.default.model('CompanySettings', CompanySettingsSchema);
