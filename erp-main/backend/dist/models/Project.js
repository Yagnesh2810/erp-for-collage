"use strict";
//path: backend/src/models/Project.ts
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
const projectSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
        default: 'planning'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, required: true, default: 0 },
    spentBudget: { type: Number, default: 0 },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    manager: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee', required: true },
    team: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Employee' }],
    client: String,
    tags: [String],
    finance: {
        totalExpenses: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        profitLoss: { type: Number, default: 0 },
        expenseIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Expense' }],
        budgetAllocations: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'BudgetAllocation' }]
    }
}, { timestamps: true });
// Update finance totals when project is saved
projectSchema.pre('save', function (next) {
    if (this.finance) {
        this.finance.profitLoss = this.finance.totalRevenue - this.finance.totalExpenses;
        this.spentBudget = this.finance.totalExpenses;
    }
    next();
});
exports.default = mongoose_1.default.model('Project', projectSchema);
