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
const MaterialConsumptionSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
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
const WorkOrderSchema = new mongoose_1.Schema({
    workOrderNumber: {
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
    bom: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'QualityControl',
        }],
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
exports.default = mongoose_1.default.models.WorkOrder || mongoose_1.default.model('WorkOrder', WorkOrderSchema);
