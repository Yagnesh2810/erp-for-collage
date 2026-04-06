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
const QualityControlSchema = new mongoose_1.Schema({
    qcNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    workOrder: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'WorkOrder',
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    inspectionType: {
        type: String,
        enum: ['INCOMING', 'IN_PROCESS', 'FINAL', 'RANDOM'],
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'CONDITIONAL'],
        default: 'PENDING',
    },
    inspectionDate: {
        type: Date,
        default: Date.now,
    },
    inspector: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    quantityInspected: {
        type: Number,
        required: true,
        min: 0,
    },
    quantityPassed: {
        type: Number,
        default: 0,
        min: 0,
    },
    quantityFailed: {
        type: Number,
        default: 0,
        min: 0,
    },
    defects: [{
            defectType: { type: String, required: true },
            severity: {
                type: String,
                enum: ['CRITICAL', 'MAJOR', 'MINOR'],
                required: true,
            },
            quantity: { type: Number, required: true, min: 0 },
            description: { type: String },
        }],
    measurements: [{
            parameter: { type: String, required: true },
            specification: { type: String, required: true },
            actual: { type: String, required: true },
            status: {
                type: String,
                enum: ['PASS', 'FAIL'],
                required: true,
            },
        }],
    notes: {
        type: String,
    },
    attachments: [{
            type: String,
        }],
    correctiveAction: {
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
QualityControlSchema.index({ qcNumber: 1 });
QualityControlSchema.index({ workOrder: 1 });
QualityControlSchema.index({ product: 1 });
QualityControlSchema.index({ status: 1 });
QualityControlSchema.index({ inspectionDate: 1 });
exports.default = mongoose_1.default.models.QualityControl || mongoose_1.default.model('QualityControl', QualityControlSchema);
