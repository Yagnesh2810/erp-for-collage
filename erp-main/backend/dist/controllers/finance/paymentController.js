"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayment = exports.updatePaymentStatus = exports.updatePayment = exports.createPayment = exports.getPaymentById = exports.getProjectPayments = exports.getPaymentSummary = void 0;
const Payment_1 = __importDefault(require("../../models/finance/Payment"));
const Invoice_1 = __importDefault(require("../../models/finance/Invoice"));
const activityLogger_1 = require("../../utils/activityLogger");
// Get payment summary for a project
const getPaymentSummary = async (req, res) => {
    try {
        const { projectId } = req.params;
        const payments = await Payment_1.default.find({ projectId });
        const summary = {
            totalPayments: payments.reduce((sum, p) => sum + p.amount, 0),
            totalIncoming: payments.filter(p => p.type === 'incoming').reduce((sum, p) => sum + p.amount, 0),
            totalOutgoing: payments.filter(p => p.type === 'outgoing').reduce((sum, p) => sum + p.amount, 0),
            pendingPayments: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
            completedPayments: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
            failedPayments: payments.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0),
            paymentsByStatus: {
                pending: payments.filter(p => p.status === 'pending').length,
                completed: payments.filter(p => p.status === 'completed').length,
                failed: payments.filter(p => p.status === 'failed').length,
                cancelled: payments.filter(p => p.status === 'cancelled').length
            },
            paymentsByMethod: {
                bank_transfer: payments.filter(p => p.method === 'bank_transfer').length,
                credit_card: payments.filter(p => p.method === 'credit_card').length,
                cash: payments.filter(p => p.method === 'cash').length,
                check: payments.filter(p => p.method === 'check').length,
                paypal: payments.filter(p => p.method === 'paypal').length
            }
        };
        res.json({
            success: true,
            data: summary
        });
    }
    catch (error) {
        console.error('Error getting payment summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment summary'
        });
    }
};
exports.getPaymentSummary = getPaymentSummary;
// Get all payments for a project
const getProjectPayments = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status, type, method, page = 1, limit = 10, search } = req.query;
        const filter = { projectId };
        if (status)
            filter.status = status;
        if (type)
            filter.type = type;
        if (method)
            filter.method = method;
        if (search) {
            filter.$or = [
                { paymentNumber: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { reference: { $regex: search, $options: 'i' } },
                { clientName: { $regex: search, $options: 'i' } },
                { vendorName: { $regex: search, $options: 'i' } }
            ];
        }
        const payments = await Payment_1.default.find(filter)
            .populate('linkedInvoiceId', 'invoiceNumber')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await Payment_1.default.countDocuments(filter);
        res.json({
            success: true,
            data: {
                payments,
                pagination: {
                    current: Number(page),
                    pages: Math.ceil(total / Number(limit)),
                    total
                }
            }
        });
    }
    catch (error) {
        console.error('Error getting project payments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get project payments'
        });
    }
};
exports.getProjectPayments = getProjectPayments;
// Get specific payment
const getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await Payment_1.default.findById(paymentId)
            .populate('linkedInvoiceId', 'invoiceNumber clientName amount')
            .populate('createdBy', 'name email');
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        res.json({
            success: true,
            data: payment
        });
    }
    catch (error) {
        console.error('Error getting payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment'
        });
    }
};
exports.getPaymentById = getPaymentById;
// Create new payment
const createPayment = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;
        const paymentData = {
            ...req.body,
            projectId,
            createdBy: userId
        };
        // Generate payment number if not provided
        if (!paymentData.paymentNumber) {
            const count = await Payment_1.default.countDocuments();
            paymentData.paymentNumber = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
        }
        const payment = new Payment_1.default(paymentData);
        await payment.save();
        await (0, activityLogger_1.logActivity)({
            userId,
            action: 'create',
            resource: 'payment',
            resourceId: payment._id,
            details: `Created payment ${payment.paymentNumber}`,
            metadata: { projectId, amount: payment.amount, type: payment.type }
        });
        res.status(201).json({
            success: true,
            data: payment,
            message: 'Payment created successfully'
        });
    }
    catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment'
        });
    }
};
exports.createPayment = createPayment;
// Update payment
const updatePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const userId = req.user.id;
        const payment = await Payment_1.default.findByIdAndUpdate(paymentId, req.body, { new: true, runValidators: true });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        await (0, activityLogger_1.logActivity)({
            userId,
            action: 'update',
            resource: 'payment',
            resourceId: payment._id,
            details: `Updated payment ${payment.paymentNumber}`,
            metadata: { amount: payment.amount, status: payment.status }
        });
        res.json({
            success: true,
            data: payment,
            message: 'Payment updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment'
        });
    }
};
exports.updatePayment = updatePayment;
// Update payment status
const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;
        const payment = await Payment_1.default.findByIdAndUpdate(paymentId, { status }, { new: true, runValidators: true });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        // If payment is linked to an invoice and status is completed, update invoice status
        if (payment.linkedInvoiceId && status === 'completed' && payment.type === 'incoming') {
            await Invoice_1.default.findByIdAndUpdate(payment.linkedInvoiceId, {
                status: 'paid',
                paidDate: new Date()
            });
        }
        await (0, activityLogger_1.logActivity)({
            userId,
            action: 'update',
            resource: 'payment',
            resourceId: payment._id,
            details: `Updated payment ${payment.paymentNumber} status to ${status}`,
            metadata: { previousStatus: payment.status, newStatus: status }
        });
        res.json({
            success: true,
            data: payment,
            message: 'Payment status updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update payment status'
        });
    }
};
exports.updatePaymentStatus = updatePaymentStatus;
// Delete payment
const deletePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const userId = req.user.id;
        const payment = await Payment_1.default.findByIdAndDelete(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        await (0, activityLogger_1.logActivity)({
            userId,
            action: 'delete',
            resource: 'payment',
            resourceId: payment._id,
            details: `Deleted payment ${payment.paymentNumber}`,
            metadata: { amount: payment.amount, type: payment.type }
        });
        res.json({
            success: true,
            message: 'Payment deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete payment'
        });
    }
};
exports.deletePayment = deletePayment;
