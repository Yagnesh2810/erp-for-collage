import mongoose, { Document, Schema } from 'mongoose';

export interface IPerformanceReview extends Document {
    employee: mongoose.Types.ObjectId;
    reviewer: mongoose.Types.ObjectId;
    reviewPeriod: {
        startDate: Date;
        endDate: Date;
    };
    reviewDate: Date;
    overallRating: number; // 1-5
    criteria: {
        name: string;
        description: string;
        rating: number; // 1-5
        comments: string;
        weight: number; // Percentage
    }[];
    strengths: string[];
    areasForImprovement: string[];
    goals: {
        description: string;
        dueDate: Date;
        status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    }[];
    employeeComments?: string;
    managerComments?: string;
    status: 'DRAFT' | 'SUBMITTED' | 'COMPLETED' | 'ACKNOWLEDGED';
    acknowledgedBy?: mongoose.Types.ObjectId;
    acknowledgedAt?: Date;
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PerformanceReviewSchema = new Schema<IPerformanceReview>(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
        },
        reviewer: {
            type: Schema.Types.ObjectId,
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
            type: Schema.Types.ObjectId,
            ref: 'Employee',
        },
        acknowledgedAt: {
            type: Date,
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

export default mongoose.model<IPerformanceReview>('PerformanceReview', PerformanceReviewSchema);
