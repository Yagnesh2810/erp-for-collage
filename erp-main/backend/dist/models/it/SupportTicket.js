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
const SupportTicketSchema = new mongoose_1.Schema({
    ticketNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    customer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    subject: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['BUG', 'FEATURE', 'SUPPORT', 'INQUIRY', 'OTHER'],
        required: true,
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM',
    },
    status: {
        type: String,
        enum: ['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'],
        default: 'OPEN',
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Employee',
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
    },
    version: {
        type: String,
    },
    sla: {
        responseTime: { type: Number },
        resolutionTime: { type: Number },
        responseDeadline: { type: Date },
        resolutionDeadline: { type: Date },
    },
    actualResponseTime: {
        type: Number,
    },
    actualResolutionTime: {
        type: Number,
    },
    comments: [{
            user: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            comment: { type: String, required: true },
            isInternal: { type: Boolean, default: false },
            timestamp: { type: Date, default: Date.now },
        }],
    attachments: [{
            type: String,
        }],
    tags: [{
            type: String,
        }],
    resolvedAt: {
        type: Date,
    },
    closedAt: {
        type: Date,
    },
    satisfaction: {
        type: Number,
        min: 1,
        max: 5,
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
SupportTicketSchema.index({ ticketNumber: 1 });
SupportTicketSchema.index({ customer: 1 });
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ priority: 1 });
SupportTicketSchema.index({ assignedTo: 1 });
exports.default = mongoose_1.default.model('SupportTicket', SupportTicketSchema);
