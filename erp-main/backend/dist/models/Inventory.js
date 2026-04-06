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
//project\backend\src\models\Inventory.ts
const mongoose_1 = __importStar(require("mongoose"));
const InventorySchema = new mongoose_1.Schema({
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    location: {
        type: String,
        required: true,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    minimumStockLevel: {
        type: Number,
        default: 5,
        min: 0,
    },
    maximumStockLevel: {
        type: Number,
        default: 100,
        min: 0,
    },
    reorderPoint: {
        type: Number,
        default: 10,
        min: 0,
    },
    status: {
        type: String,
        enum: ['in-stock', 'low-stock', 'out-of-stock'],
        default: 'in-stock',
    },
    batchNumber: {
        type: String,
    },
    expiryDate: {
        type: Date,
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true,
});
// Pre-save middleware to update status based on quantity and reorderPoint
InventorySchema.pre('save', function (next) {
    if (this.quantity <= 0) {
        this.status = 'out-of-stock';
    }
    else if (this.quantity <= this.reorderPoint) {
        this.status = 'low-stock';
    }
    else {
        this.status = 'in-stock';
    }
    this.lastUpdated = new Date();
    next();
});
// Create a compound index for productId and location to ensure uniqueness
InventorySchema.index({ productId: 1, location: 1 }, { unique: true });
const Inventory = mongoose_1.default.model('Inventory', InventorySchema);
exports.default = Inventory;
