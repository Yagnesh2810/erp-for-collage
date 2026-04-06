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
//project\backend\src\models\InventoryTransaction.ts
const mongoose_1 = __importStar(require("mongoose"));
const InventoryTransactionSchema = new mongoose_1.Schema({
    inventoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true,
    },
    productId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    type: {
        type: String,
        enum: ['receive', 'issue', 'adjustment', 'transfer', 'return'],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    previousQuantity: {
        type: Number,
        required: true,
    },
    newQuantity: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    referenceId: {
        type: mongoose_1.Schema.Types.ObjectId,
    },
    referenceType: {
        type: String,
    },
    performedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true,
});
const InventoryTransaction = mongoose_1.default.model('InventoryTransaction', InventoryTransactionSchema);
exports.default = InventoryTransaction;
