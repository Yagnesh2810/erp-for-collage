"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointmentAnalytics = exports.deleteAppointment = exports.cancelAppointment = exports.completeAppointment = exports.startAppointment = exports.confirmAppointment = exports.updateAppointment = exports.createAppointment = exports.getAppointmentById = exports.getAllAppointments = void 0;
const Appointment_1 = __importDefault(require("../../models/services/Appointment"));
const ServiceCatalog_1 = __importDefault(require("../../models/services/ServiceCatalog"));
const numberGenerator_1 = require("../../utils/numberGenerator");
// Get all appointments
const getAllAppointments = async (req, res) => {
    try {
        const { customer, provider, service, status, date, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (customer)
            filter.customer = customer;
        if (provider)
            filter.provider = provider;
        if (service)
            filter.service = service;
        if (status)
            filter.status = status;
        if (date)
            filter.scheduledDate = new Date(date);
        const appointments = await Appointment_1.default.find(filter)
            .populate('service', 'name duration price')
            .populate('customer', 'name email phone')
            .populate('provider', 'name email')
            .sort({ scheduledDate: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Appointment_1.default.countDocuments(filter);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message,
        });
    }
};
exports.getAllAppointments = getAllAppointments;
// Get appointment by ID
const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment_1.default.findById(req.params.id)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching appointment',
            error: error.message,
        });
    }
};
exports.getAppointmentById = getAppointmentById;
// Create appointment
const createAppointment = async (req, res) => {
    try {
        const appointmentNumber = await (0, numberGenerator_1.generateAppointmentNumber)();
        // Get service details for price and duration
        const service = await ServiceCatalog_1.default.findById(req.body.service);
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
            createdBy: req.user._id,
        };
        const appointment = await Appointment_1.default.create(appointmentData);
        res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            data: appointment,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating appointment',
            error: error.message,
        });
    }
};
exports.createAppointment = createAppointment;
// Update appointment
const updateAppointment = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: req.user._id,
        };
        const appointment = await Appointment_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating appointment',
            error: error.message,
        });
    }
};
exports.updateAppointment = updateAppointment;
// Confirm appointment
const confirmAppointment = async (req, res) => {
    try {
        const appointment = await Appointment_1.default.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }
        appointment.status = 'CONFIRMED';
        appointment.updatedBy = req.user._id;
        await appointment.save();
        res.json({
            success: true,
            message: 'Appointment confirmed',
            data: appointment,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error confirming appointment',
            error: error.message,
        });
    }
};
exports.confirmAppointment = confirmAppointment;
// Start appointment
const startAppointment = async (req, res) => {
    try {
        const appointment = await Appointment_1.default.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }
        appointment.status = 'IN_PROGRESS';
        appointment.actualStartTime = new Date();
        appointment.updatedBy = req.user._id;
        await appointment.save();
        res.json({
            success: true,
            message: 'Appointment started',
            data: appointment,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error starting appointment',
            error: error.message,
        });
    }
};
exports.startAppointment = startAppointment;
// Complete appointment
const completeAppointment = async (req, res) => {
    try {
        const appointment = await Appointment_1.default.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }
        appointment.status = 'COMPLETED';
        appointment.actualEndTime = new Date();
        appointment.notes = req.body.notes || appointment.notes;
        appointment.updatedBy = req.user._id;
        await appointment.save();
        res.json({
            success: true,
            message: 'Appointment completed',
            data: appointment,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error completing appointment',
            error: error.message,
        });
    }
};
exports.completeAppointment = completeAppointment;
// Cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { cancelReason } = req.body;
        const appointment = await Appointment_1.default.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found',
            });
        }
        appointment.status = 'CANCELLED';
        appointment.cancelReason = cancelReason;
        appointment.updatedBy = req.user._id;
        await appointment.save();
        res.json({
            success: true,
            message: 'Appointment cancelled',
            data: appointment,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling appointment',
            error: error.message,
        });
    }
};
exports.cancelAppointment = cancelAppointment;
// Delete appointment
const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment_1.default.findByIdAndDelete(req.params.id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting appointment',
            error: error.message,
        });
    }
};
exports.deleteAppointment = deleteAppointment;
// Get appointment analytics
const getAppointmentAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, provider } = req.query;
        const filter = {};
        if (startDate || endDate) {
            filter.scheduledDate = {};
            if (startDate)
                filter.scheduledDate.$gte = new Date(startDate);
            if (endDate)
                filter.scheduledDate.$lte = new Date(endDate);
        }
        if (provider)
            filter.provider = provider;
        const total = await Appointment_1.default.countDocuments(filter);
        const completed = await Appointment_1.default.countDocuments({ ...filter, status: 'COMPLETED' });
        const cancelled = await Appointment_1.default.countDocuments({ ...filter, status: 'CANCELLED' });
        const noShow = await Appointment_1.default.countDocuments({ ...filter, status: 'NO_SHOW' });
        const revenue = await Appointment_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching appointment analytics',
            error: error.message,
        });
    }
};
exports.getAppointmentAnalytics = getAppointmentAnalytics;
