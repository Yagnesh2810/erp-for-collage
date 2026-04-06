"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProjectInvoice = exports.updateInvoiceStatus = exports.updateProjectInvoice = exports.createProjectInvoice = exports.getProjectInvoices = exports.getInvoiceSummary = void 0;
const Invoice_1 = __importDefault(require("../../models/finance/Invoice"));
// Get invoice summary for a project
const getInvoiceSummary = async (req, res) => {
    try {
        const { projectId } = req.params;
        const invoices = await Invoice_1.default.find({ projectId });
        const totalInvoices = invoices.reduce((sum, inv) => sum + inv.amount, 0);
        const paidInvoices = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
        const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').reduce((sum, inv) => sum + inv.amount, 0);
        const overdueInvoices = invoices.filter(inv => {
            return inv.status !== 'paid' && inv.status !== 'cancelled' && new Date(inv.dueDate) < new Date();
        }).reduce((sum, inv) => sum + inv.amount, 0);
        const invoicesByStatus = {
            draft: invoices.filter(inv => inv.status === 'draft').reduce((sum, inv) => sum + inv.amount, 0),
            sent: invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.amount, 0),
            paid: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
            overdue: overdueInvoices,
            cancelled: invoices.filter(inv => inv.status === 'cancelled').reduce((sum, inv) => sum + inv.amount, 0)
        };
        res.json({
            success: true,
            data: {
                totalInvoices,
                paidInvoices,
                unpaidInvoices,
                overdueInvoices,
                invoicesByStatus
            }
        });
    }
    catch (error) {
        console.error('Error getting invoice summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get invoice summary'
        });
    }
};
exports.getInvoiceSummary = getInvoiceSummary;
const getProjectInvoices = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status, search, page = 1, limit = 50 } = req.query;
        let query = { projectId };
        if (status && status !== 'all') {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { clientName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const invoices = await Invoice_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Invoice_1.default.countDocuments(query);
        const pages = Math.ceil(total / Number(limit));
        res.json({
            success: true,
            data: {
                invoices,
                pagination: {
                    current: Number(page),
                    pages,
                    total
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoices'
        });
    }
};
exports.getProjectInvoices = getProjectInvoices;
const createProjectInvoice = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;
        // Calculate total amount from items
        const items = req.body.items || [];
        const totalAmount = items.reduce((sum, item) => {
            return sum + (item.quantity * item.rate);
        }, 0);
        const invoiceData = {
            ...req.body,
            projectId,
            createdBy: userId,
            amount: totalAmount,
            status: 'draft'
        };
        const invoice = new Invoice_1.default(invoiceData);
        await invoice.save();
        res.status(201).json({
            success: true,
            data: invoice,
            message: 'Invoice created successfully'
        });
    }
    catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating invoice'
        });
    }
};
exports.createProjectInvoice = createProjectInvoice;
const updateProjectInvoice = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        // Calculate total amount from items if items are provided
        if (req.body.items) {
            const totalAmount = req.body.items.reduce((sum, item) => {
                return sum + (item.quantity * item.rate);
            }, 0);
            req.body.amount = totalAmount;
        }
        const invoice = await Invoice_1.default.findByIdAndUpdate(invoiceId, req.body, { new: true });
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }
        res.json({
            success: true,
            data: invoice,
            message: 'Invoice updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating invoice'
        });
    }
};
exports.updateProjectInvoice = updateProjectInvoice;
// Update invoice status
const updateInvoiceStatus = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const { status } = req.body;
        const updateData = { status };
        if (status === 'paid') {
            updateData.paidDate = new Date();
        }
        const invoice = await Invoice_1.default.findByIdAndUpdate(invoiceId, updateData, { new: true });
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }
        res.json({
            success: true,
            data: invoice,
            message: `Invoice ${status} successfully`
        });
    }
    catch (error) {
        console.error('Error updating invoice status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating invoice status'
        });
    }
};
exports.updateInvoiceStatus = updateInvoiceStatus;
const deleteProjectInvoice = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const invoice = await Invoice_1.default.findById(invoiceId);
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }
        await Invoice_1.default.findByIdAndDelete(invoiceId);
        res.json({
            success: true,
            message: 'Invoice deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting invoice'
        });
    }
};
exports.deleteProjectInvoice = deleteProjectInvoice;
