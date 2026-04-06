import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeEntry extends Document {
    employee: mongoose.Types.ObjectId;
    project?: mongoose.Types.ObjectId;
    task?: mongoose.Types.ObjectId;
    date: Date;
    startTime: Date;
    endTime: Date;
    duration: number; // in minutes
    description: string;
    billable: boolean;
    hourlyRate?: number;
    totalAmount: number;
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'INVOICED';
    approvedBy?: mongoose.Types.ObjectId;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TimeEntrySchema = new Schema<ITimeEntry>(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
        },
        task: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
        },
        date: {
            type: Date,
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
            min: 0,
        },
        description: {
            type: String,
            required: true,
        },
        billable: {
            type: Boolean,
            default: true,
        },
        hourlyRate: {
            type: Number,
            min: 0,
        },
        totalAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'INVOICED'],
            default: 'DRAFT',
        },
        approvedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        notes: {
            type: String,
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

TimeEntrySchema.index({ employee: 1 });
TimeEntrySchema.index({ project: 1 });
TimeEntrySchema.index({ task: 1 });
TimeEntrySchema.index({ date: 1 });
TimeEntrySchema.index({ status: 1 });

// Calculate duration and total amount before saving
TimeEntrySchema.pre('save', function (next) {
    if (this.startTime && this.endTime) {
        this.duration = Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
    }

    if (this.hourlyRate && this.duration) {
        this.totalAmount = (this.duration / 60) * this.hourlyRate;
    }

    next();
});

export default mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
