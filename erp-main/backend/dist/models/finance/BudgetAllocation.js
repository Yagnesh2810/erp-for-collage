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
const BudgetAllocationSchema = new mongoose_1.Schema({
    budgetId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Budget' },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project' },
    accountId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Account' },
    costCenterId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CostCenter' },
    category: { type: String, required: true },
    allocatedAmount: { type: Number, required: true },
    spentAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    period: { type: String, required: true },
    actualAmount: { type: Number, default: 0 },
    variance: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'exceeded', 'completed', 'inactive'], default: 'active' },
    description: { type: String, required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
exports.default = mongoose_1.default.model('BudgetAllocation', BudgetAllocationSchema);
