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
const ProjectBudgetCategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    allocatedAmount: { type: Number, required: true },
    spentAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },
    utilization: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'exceeded', 'completed'], default: 'active' },
    description: { type: String, required: true }
});
const ProjectBudgetSchema = new mongoose_1.Schema({
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
    totalBudget: { type: Number, required: true },
    spentAmount: { type: Number, default: 0 },
    remainingBudget: { type: Number, required: true },
    budgetUtilization: { type: Number, default: 0 },
    categories: [ProjectBudgetCategorySchema],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });
// Update budget calculations when categories change
ProjectBudgetSchema.pre('save', function () {
    const totalAllocated = this.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
    const totalSpent = this.categories.reduce((sum, cat) => sum + cat.spentAmount, 0);
    this.totalBudget = totalAllocated;
    this.spentAmount = totalSpent;
    this.remainingBudget = totalAllocated - totalSpent;
    this.budgetUtilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
    this.lastUpdated = new Date();
    // Update category calculations
    this.categories.forEach(category => {
        category.remainingAmount = category.allocatedAmount - category.spentAmount;
        category.utilization = category.allocatedAmount > 0 ? Math.round((category.spentAmount / category.allocatedAmount) * 100) : 0;
        if (category.spentAmount > category.allocatedAmount) {
            category.status = 'exceeded';
        }
        else if (category.spentAmount === category.allocatedAmount) {
            category.status = 'completed';
        }
        else {
            category.status = 'active';
        }
    });
});
exports.default = mongoose_1.default.model('ProjectBudget', ProjectBudgetSchema);
