import { Request, Response } from 'express';
import Payment from '../../models/finance/Payment';
import Invoice from '../../models/finance/Invoice';
import { logActivity } from '../../utils/activityLogger';

// Get payment summary for a project
export const getPaymentSummary = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const payments = await Payment.find({ projectId });
    
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
  } catch (error) {
    console.error('Error getting payment summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment summary'
    });
  }
};

// Get all payments for a project
export const getProjectPayments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { status, type, method, page = 1, limit = 10, search } = req.query;

    const filter: any = { projectId };

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (method) filter.method = method;
    if (search) {
      filter.$or = [
        { paymentNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { vendorName: { $regex: search, $options: 'i' } }
      ];
    }

    const payments = await Payment.find(filter)
      .populate('linkedInvoiceId', 'invoiceNumber')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Payment.countDocuments(filter);

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
  } catch (error) {
    console.error('Error getting project payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project payments'
    });
  }
};

// Get specific payment
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
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
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment'
    });
  }
};

// Create new payment
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;

    const paymentData = {
      ...req.body,
      projectId,
      createdBy: userId
    };

    // Generate payment number if not provided
    if (!paymentData.paymentNumber) {
      const count = await Payment.countDocuments();
      paymentData.paymentNumber = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    }

    const payment = new Payment(paymentData);
    await payment.save();

    await logActivity({
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
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment'
    });
  }
};

// Update payment
export const updatePayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const userId = (req as any).user.id;

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await logActivity({
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
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment'
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;
    const userId = (req as any).user.id;

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // If payment is linked to an invoice and status is completed, update invoice status
    if (payment.linkedInvoiceId && status === 'completed' && payment.type === 'incoming') {
      await Invoice.findByIdAndUpdate(payment.linkedInvoiceId, {
        status: 'paid',
        paidDate: new Date()
      });
    }

    await logActivity({
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
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status'
    });
  }
};

// Delete payment
export const deletePayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const userId = (req as any).user.id;

    const payment = await Payment.findByIdAndDelete(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await logActivity({
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
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment'
    });
  }
};