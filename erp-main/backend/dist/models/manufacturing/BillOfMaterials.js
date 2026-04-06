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
const BOMComponentSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
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
const BillOfMaterialsSchema = new mongoose_1.Schema({
    bomNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
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
exports.default = mongoose_1.default.models.BillOfMaterials || mongoose_1.default.model('BillOfMaterials', BillOfMaterialsSchema);
