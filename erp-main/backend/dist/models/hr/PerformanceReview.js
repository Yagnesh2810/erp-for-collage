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
const PerformanceReviewSchema = new mongoose_1.Schema({
    employee: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    reviewer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
    },
    reviewPeriod: {
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    reviewDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    overallRating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    criteria: [{
            name: { type: String, required: true },
            description: { type: String },
            rating: { type: Number, required: true, min: 1, max: 5 },
            comments: { type: String },
            weight: { type: Number, default: 0, min: 0, max: 100 },
        }],
    strengths: [{
            type: String,
        }],
    areasForImprovement: [{
            type: String,
        }],
    goals: [{
            description: { type: String, required: true },
            dueDate: { type: Date, required: true },
            status: {
                type: String,
                enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
                default: 'PENDING',
            },
        }],
    employeeComments: {
        type: String,
    },
    managerComments: {
        type: String,
    },
    status: {
        type: String,
        enum: ['DRAFT', 'SUBMITTED', 'COMPLETED', 'ACKNOWLEDGED'],
        default: 'DRAFT',
    },
    acknowledgedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Employee',
    },
    acknowledgedAt: {
        type: Date,
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
PerformanceReviewSchema.index({ employee: 1 });
PerformanceReviewSchema.index({ reviewer: 1 });
PerformanceReviewSchema.index({ status: 1 });
PerformanceReviewSchema.index({ reviewDate: 1 });
// Calculate overall rating based on criteria weights
PerformanceReviewSchema.pre('save', function (next) {
    if (this.criteria && this.criteria.length > 0) {
        const totalWeight = this.criteria.reduce((sum, c) => sum + c.weight, 0);
        if (totalWeight > 0) {
            const weightedRating = this.criteria.reduce((sum, c) => {
                return sum + (c.rating * c.weight / totalWeight);
            }, 0);
            this.overallRating = Math.round(weightedRating * 10) / 10; // Round to 1 decimal
        }
    }
    next();
});
exports.default = mongoose_1.default.model('PerformanceReview', PerformanceReviewSchema);
