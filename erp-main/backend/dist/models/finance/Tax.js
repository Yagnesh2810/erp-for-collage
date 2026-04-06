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
const TaxSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['GST', 'VAT', 'SALES_TAX', 'INCOME_TAX', 'CUSTOM'],
        required: true,
    },
    rate: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    applicableOn: {
        type: String,
        enum: ['PRODUCTS', 'SERVICES', 'BOTH'],
        default: 'BOTH',
    },
    region: {
        type: String,
    },
    country: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    effectiveFrom: {
        type: Date,
        required: true,
        default: Date.now,
    },
    effectiveTo: {
        type: Date,
    },
    description: {
        type: String,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});
TaxSchema.index({ code: 1 });
TaxSchema.index({ country: 1 });
TaxSchema.index({ isActive: 1 });
exports.default = mongoose_1.default.model('Tax', TaxSchema);
