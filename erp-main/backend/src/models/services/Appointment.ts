import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
    appointmentNumber: string;
    service: mongoose.Types.ObjectId;
    customer: mongoose.Types.ObjectId;
    provider: mongoose.Types.ObjectId;
    scheduledDate: Date;
    scheduledTime: string;
    duration: number; // in minutes
    status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
    location?: string;
    notes?: string;
    customerNotes?: string;
    reminderSent: boolean;
    cancelReason?: string;
    actualStartTime?: Date;
    actualEndTime?: Date;
    price: number;
    paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
    {
        appointmentNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        service: {
            type: Schema.Types.ObjectId,
            ref: 'ServiceCatalog',
            required: true,
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        provider: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
        },
        scheduledDate: {
            type: Date,
            required: true,
        },
        scheduledTime: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
            default: 'SCHEDULED',
        },
        location: {
            type: String,
        },
        notes: {
            type: String,
        },
        customerNotes: {
            type: String,
        },
        reminderSent: {
            type: Boolean,
            default: false,
        },
        cancelReason: {
            type: String,
        },
        actualStartTime: {
            type: Date,
        },
        actualEndTime: {
            type: Date,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'PAID', 'REFUNDED'],
            default: 'PENDING',
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

AppointmentSchema.index({ appointmentNumber: 1 });
AppointmentSchema.index({ customer: 1 });
AppointmentSchema.index({ provider: 1 });
AppointmentSchema.index({ scheduledDate: 1 });
AppointmentSchema.index({ status: 1 });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
