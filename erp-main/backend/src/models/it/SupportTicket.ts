import mongoose, { Document, Schema } from 'mongoose';

export interface ISupportTicket extends Document {
    ticketNumber: string;
    customer: mongoose.Types.ObjectId;
    subject: string;
    description: string;
    category: 'BUG' | 'FEATURE' | 'SUPPORT' | 'INQUIRY' | 'OTHER';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
    assignedTo?: mongoose.Types.ObjectId;
    product?: mongoose.Types.ObjectId;
    version?: string;
    sla?: {
        responseTime: number; // in minutes
        resolutionTime: number; // in minutes
        responseDeadline: Date;
        resolutionDeadline: Date;
    };
    actualResponseTime?: number;
    actualResolutionTime?: number;
    comments: {
        user: mongoose.Types.ObjectId;
        comment: string;
        isInternal: boolean;
        timestamp: Date;
    }[];
    attachments?: string[];
    tags?: string[];
    resolvedAt?: Date;
    closedAt?: Date;
    satisfaction?: number; // 1-5
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
    {
        ticketNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
            ref: 'Employee',
        },
        product: {
            type: Schema.Types.ObjectId,
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
                type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

SupportTicketSchema.index({ ticketNumber: 1 });
SupportTicketSchema.index({ customer: 1 });
SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ priority: 1 });
SupportTicketSchema.index({ assignedTo: 1 });

export default mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
