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
const MachineSchema = new mongoose_1.Schema({
    machineNumber: {
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
    type: {
        type: String,
        required: true,
    },
    manufacturer: {
        type: String,
        required: true,
    },
    modelName: {
        type: String,
        required: true,
    },
    serialNumber: {
        type: String,
        required: true,
        unique: true,
    },
    purchaseDate: {
        type: Date,
        required: true,
    },
    warrantyExpiry: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['OPERATIONAL', 'MAINTENANCE', 'DOWN', 'RETIRED'],
        default: 'OPERATIONAL',
    },
    location: {
        type: String,
        required: true,
    },
    specifications: {
        capacity: { type: String },
        powerRating: { type: String },
        dimensions: { type: String },
        weight: { type: String },
    },
    maintenanceSchedule: {
        type: {
            type: String,
            enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
        },
        lastMaintenance: { type: Date },
        nextMaintenance: { type: Date },
    },
    operatingHours: {
        type: Number,
        default: 0,
        min: 0,
    },
    efficiency: {
        type: Number,
        default: 100,
        min: 0,
        max: 100,
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
MachineSchema.index({ machineNumber: 1 });
MachineSchema.index({ status: 1 });
MachineSchema.index({ serialNumber: 1 });
exports.default = mongoose_1.default.models.Machine || mongoose_1.default.model('Machine', MachineSchema);
