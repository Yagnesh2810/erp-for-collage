import { Request, Response } from 'express';
import Subscription from '../../models/services/Subscription';
import ServiceCatalog from '../../models/services/ServiceCatalog';
import { generateSubscriptionNumber } from '../../utils/numberGenerator';

// Get all subscriptions
export const getAllSubscriptions = async (req: Request, res: Response) => {
    try {
        const { customer, service, status, plan, page = 1, limit = 20 } = req.query;

        const filter: any = {};
        if (customer) filter.customer = customer;
        if (service) filter.service = service;
        if (status) filter.status = status;
        if (plan) filter.plan = plan;

        const subscriptions = await Subscription.find(filter)
            .populate('service', 'name')
            .populate('customer', 'name email')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Subscription.countDocuments(filter);

        res.json({
            success: true,
            data: subscriptions,
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
            message: 'Error fetching subscriptions',
            error: error.message,
        });
    }
};

// Get subscription by ID
export const getSubscriptionById = async (req: Request, res: Response) => {
    try {
        const subscription = await Subscription.findById(req.params.id)
            .populate('service')
            .populate('customer')
            .populate('createdBy', 'name email');

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }

        res.json({
            success: true,
            data: subscription,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription',
            error: error.message,
        });
    }
};

// Create subscription
export const createSubscription = async (req: Request, res: Response) => {
    try {
        const subscriptionNumber = await generateSubscriptionNumber();

        // Get service details
        const service = await ServiceCatalog.findById(req.body.service);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        // Calculate billing cycle days based on plan
        let billingCycle = req.body.billingCycle;
        if (!billingCycle) {
            switch (req.body.plan) {
                case 'MONTHLY':
                    billingCycle = 30;
                    break;
                case 'QUARTERLY':
                    billingCycle = 90;
                    break;
                case 'YEARLY':
                    billingCycle = 365;
                    break;
                default:
                    billingCycle = 30;
            }
        }

        // Calculate next billing date
        const startDate = new Date(req.body.startDate || Date.now());
        const nextBillingDate = new Date(startDate);
        nextBillingDate.setDate(nextBillingDate.getDate() + billingCycle);

        const subscriptionData = {
            ...req.body,
            subscriptionNumber,
            billingCycle,
            nextBillingDate,
            price: req.body.price || service.price,
            createdBy: (req as any).user._id,
        };

        const subscription = await Subscription.create(subscriptionData);

        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: subscription,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error creating subscription',
            error: error.message,
        });
    }
};

// Update subscription
export const updateSubscription = async (req: Request, res: Response) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: (req as any).user._id,
        };

        const subscription = await Subscription.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('service')
            .populate('customer');

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }

        res.json({
            success: true,
            message: 'Subscription updated successfully',
            data: subscription,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error updating subscription',
            error: error.message,
        });
    }
};

// Process billing
export const processBilling = async (req: Request, res: Response) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }

        if (subscription.status !== 'ACTIVE') {
            return res.status(400).json({
                success: false,
                message: 'Only active subscriptions can be billed',
            });
        }

        // Add billing record
        subscription.billingHistory.push({
            date: new Date(),
            amount: subscription.price,
            status: 'SUCCESS', // In real implementation, this would come from payment gateway
            invoiceId: req.body.invoiceId,
        });

        // Update next billing date
        const nextBillingDate = new Date(subscription.nextBillingDate);
        nextBillingDate.setDate(nextBillingDate.getDate() + subscription.billingCycle);
        subscription.nextBillingDate = nextBillingDate;

        subscription.updatedBy = (req as any).user._id;
        await subscription.save();

        res.json({
            success: true,
            message: 'Billing processed successfully',
            data: subscription,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error processing billing',
            error: error.message,
        });
    }
};

// Pause subscription
export const pauseSubscription = async (req: Request, res: Response) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }

        subscription.status = 'PAUSED';
        subscription.updatedBy = (req as any).user._id;
        await subscription.save();

        res.json({
            success: true,
            message: 'Subscription paused',
            data: subscription,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error pausing subscription',
            error: error.message,
        });
    }
};

// Resume subscription
export const resumeSubscription = async (req: Request, res: Response) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }

        subscription.status = 'ACTIVE';
        subscription.updatedBy = (req as any).user._id;
        await subscription.save();

        res.json({
            success: true,
            message: 'Subscription resumed',
            data: subscription,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error resuming subscription',
            error: error.message,
        });
    }
};

// Cancel subscription
export const cancelSubscription = async (req: Request, res: Response) => {
    try {
        const { cancelReason } = req.body;

        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }

        subscription.status = 'CANCELLED';
        subscription.cancelledAt = new Date();
        subscription.cancelReason = cancelReason;
        subscription.autoRenew = false;
        subscription.updatedBy = (req as any).user._id;
        await subscription.save();

        res.json({
            success: true,
            message: 'Subscription cancelled',
            data: subscription,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling subscription',
            error: error.message,
        });
    }
};

// Delete subscription
export const deleteSubscription = async (req: Request, res: Response) => {
    try {
        const subscription = await Subscription.findByIdAndDelete(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }

        res.json({
            success: true,
            message: 'Subscription deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error deleting subscription',
            error: error.message,
        });
    }
};

// Get subscription analytics
export const getSubscriptionAnalytics = async (req: Request, res: Response) => {
    try {
        const { service } = req.query;

        const filter: any = {};
        if (service) filter.service = service;

        const total = await Subscription.countDocuments(filter);
        const active = await Subscription.countDocuments({ ...filter, status: 'ACTIVE' });
        const paused = await Subscription.countDocuments({ ...filter, status: 'PAUSED' });
        const cancelled = await Subscription.countDocuments({ ...filter, status: 'CANCELLED' });

        const mrr = await Subscription.aggregate([
            { $match: { ...filter, status: 'ACTIVE' } },
            {
                $project: {
                    monthlyRevenue: {
                        $cond: {
                            if: { $eq: ['$plan', 'MONTHLY'] },
                            then: '$price',
                            else: {
                                $cond: {
                                    if: { $eq: ['$plan', 'QUARTERLY'] },
                                    then: { $divide: ['$price', 3] },
                                    else: { $divide: ['$price', 12] }
                                }
                            }
                        }
                    }
                }
            },
            { $group: { _id: null, total: { $sum: '$monthlyRevenue' } } },
        ]);

        res.json({
            success: true,
            data: {
                total,
                active,
                paused,
                cancelled,
                monthlyRecurringRevenue: mrr[0]?.total || 0,
                churnRate: total > 0 ? (cancelled / total) * 100 : 0,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription analytics',
            error: error.message,
        });
    }
};
