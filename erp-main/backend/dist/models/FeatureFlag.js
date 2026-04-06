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
const FeatureFlagSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
// Indexes for faster queries
FeatureFlagSchema.index({ key: 1 });
FeatureFlagSchema.index({ module: 1 });
FeatureFlagSchema.index({ enabled: 1 });
exports.default = mongoose_1.default.model('FeatureFlag', FeatureFlagSchema);
