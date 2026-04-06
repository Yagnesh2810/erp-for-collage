import { Request, Response } from 'express';
import Appointment from '../../models/services/Appointment';
import ServiceCatalog from '../../models/services/ServiceCatalog';
import { generateAppointmentNumber } from '../../utils/numberGenerator';

// Get all appointments
export const getAllAppointments = async (req: Request, res: Response) => {
    try {
        const { customer, provider, service, status, date, page = 1, limit = 20 } = req.query;

        const filter: any = {};
        if (customer) filter.customer = customer;
        if (provider) filter.provider = provider;
        if (service) filter.service = service;
        if (status) filter.status = status;
        if (date) filter.scheduledDate = new Date(date as string);

        const appointments = await Appointment.find(filter)
            .populate('service', 'name duration price')
            .populate('customer', 'name email phone')
            .populate('provider', 'name email')
            .sort({ scheduledDate: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Appointment.countDocuments(filter);

        res.json({
            success: true,
            data: appointments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message,
        });
    }
};

// Get appointment by ID
export const getAppointmentById = async (req: Request, res: Response) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('service')
            .populate('customer')
            .populate('provider')
            .populate('createdBy', 'name email');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        res.json({
            success: true,
            data: appointment,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching appointment',
            error: error.message,
        });
    }
};

// Create appointment
export const createAppointment = async (req: Request, res: Response) => {
    try {
        const appointmentNumber = await generateAppointmentNumber();

        // Get service details for price and duration
        const service = await ServiceCatalog.findById(req.body.service);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        const appointmentData = {
            ...req.body,
            appointmentNumber,
            duration: req.body.duration || service.duration,
            price: req.body.price || service.price,
            createdBy: (req as any).user._id,
        };

        const appointment = await Appointment.create(appointmentData);

        res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            data: appointment,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error creating appointment',
            error: error.message,
        });
    }
};

// Update appointment
export const updateAppointment = async (req: Request, res: Response) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: (req as any).user._id,
        };

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('service')
            .populate('customer')
            .populate('provider');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        res.json({
            success: true,
            message: 'Appointment updated successfully',
            data: appointment,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error updating appointment',
            error: error.message,
        });
    }
};

// Confirm appointment
export const confirmAppointment = async (req: Request, res: Response) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        appointment.status = 'CONFIRMED';
        appointment.updatedBy = (req as any).user._id;
        await appointment.save();

        res.json({
            success: true,
            message: 'Appointment confirmed',
            data: appointment,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error confirming appointment',
            error: error.message,
        });
    }
};

// Start appointment
export const startAppointment = async (req: Request, res: Response) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        appointment.status = 'IN_PROGRESS';
        appointment.actualStartTime = new Date();
        appointment.updatedBy = (req as any).user._id;
        await appointment.save();

        res.json({
            success: true,
            message: 'Appointment started',
            data: appointment,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error starting appointment',
            error: error.message,
        });
    }
};

// Complete appointment
export const completeAppointment = async (req: Request, res: Response) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        appointment.status = 'COMPLETED';
        appointment.actualEndTime = new Date();
        appointment.notes = req.body.notes || appointment.notes;
        appointment.updatedBy = (req as any).user._id;
        await appointment.save();

        res.json({
            success: true,
            message: 'Appointment completed',
            data: appointment,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error completing appointment',
            error: error.message,
        });
    }
};

// Cancel appointment
export const cancelAppointment = async (req: Request, res: Response) => {
    try {
        const { cancelReason } = req.body;

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        appointment.status = 'CANCELLED';
        appointment.cancelReason = cancelReason;
        appointment.updatedBy = (req as any).user._id;
        await appointment.save();

        res.json({
            success: true,
            message: 'Appointment cancelled',
            data: appointment,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling appointment',
            error: error.message,
        });
    }
};

// Delete appointment
export const deleteAppointment = async (req: Request, res: Response) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }

        res.json({
            success: true,
            message: 'Appointment deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error deleting appointment',
            error: error.message,
        });
    }
};

// Get appointment analytics
export const getAppointmentAnalytics = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, provider } = req.query;

        const filter: any = {};
        if (startDate || endDate) {
            filter.scheduledDate = {};
            if (startDate) filter.scheduledDate.$gte = new Date(startDate as string);
            if (endDate) filter.scheduledDate.$lte = new Date(endDate as string);
        }
        if (provider) filter.provider = provider;

        const total = await Appointment.countDocuments(filter);
        const completed = await Appointment.countDocuments({ ...filter, status: 'COMPLETED' });
        const cancelled = await Appointment.countDocuments({ ...filter, status: 'CANCELLED' });
        const noShow = await Appointment.countDocuments({ ...filter, status: 'NO_SHOW' });

        const revenue = await Appointment.aggregate([
            { $match: { ...filter, paymentStatus: 'PAID' } },
            { $group: { _id: null, total: { $sum: '$price' } } },
        ]);

        res.json({
            success: true,
            data: {
                total,
                completed,
                cancelled,
                noShow,
                revenue: revenue[0]?.total || 0,
                completionRate: total > 0 ? (completed / total) * 100 : 0,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching appointment analytics',
            error: error.message,
        });
    }
};
