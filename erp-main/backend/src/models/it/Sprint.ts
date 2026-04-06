import mongoose, { Document, Schema } from 'mongoose';

export interface ISprint extends Document {
    sprintNumber: string;
    name: string;
    project: mongoose.Types.ObjectId;
    goal: string;
    startDate: Date;
    endDate: Date;
    status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    velocity: number;
    totalPoints: number;
    completedPoints: number;
    tasks: mongoose.Types.ObjectId[];
    retrospectiveNotes?: string;
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SprintSchema = new Schema<ISprint>(
    {
        sprintNumber: {
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
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        goal: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
            default: 'PLANNED',
        },
        velocity: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalPoints: {
            type: Number,
            default: 0,
            min: 0,
        },
        completedPoints: {
            type: Number,
            default: 0,
            min: 0,
        },
        tasks: [{
            type: Schema.Types.ObjectId,
            ref: 'Task',
        }],
        retrospectiveNotes: {
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

SprintSchema.index({ sprintNumber: 1 });
SprintSchema.index({ project: 1 });
SprintSchema.index({ status: 1 });

export default mongoose.model<ISprint>('Sprint', SprintSchema);
