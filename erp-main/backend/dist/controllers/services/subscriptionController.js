"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionAnalytics = exports.deleteSubscription = exports.cancelSubscription = exports.resumeSubscription = exports.pauseSubscription = exports.processBilling = exports.updateSubscription = exports.createSubscription = exports.getSubscriptionById = exports.getAllSubscriptions = void 0;
const Subscription_1 = __importDefault(require("../../models/services/Subscription"));
const ServiceCatalog_1 = __importDefault(require("../../models/services/ServiceCatalog"));
const numberGenerator_1 = require("../../utils/numberGenerator");
// Get all subscriptions
const getAllSubscriptions = async (req, res) => {
    try {
        const { customer, service, status, plan, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (customer)
            filter.customer = customer;
        if (service)
            filter.service = service;
        if (status)
            filter.status = status;
        if (plan)
            filter.plan = plan;
        const subscriptions = await Subscription_1.default.find(filter)
            .populate('service', 'name')
            .populate('customer', 'name email')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Subscription_1.default.countDocuments(filter);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscriptions',
            error: error.message,
        });
    }
};
exports.getAllSubscriptions = getAllSubscriptions;
// Get subscription by ID
const getSubscriptionById = async (req, res) => {
    try {
        const subscription = await Subscription_1.default.findById(req.params.id)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription',
            error: error.message,
        });
    }
};
exports.getSubscriptionById = getSubscriptionById;
// Create subscription
const createSubscription = async (req, res) => {
    try {
        const subscriptionNumber = await (0, numberGenerator_1.generateSubscriptionNumber)();
        // Get service details
        const service = await ServiceCatalog_1.default.findById(req.body.service);
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
            createdBy: req.user._id,
        };
        const subscription = await Subscription_1.default.create(subscriptionData);
        res.status(201).json({
            success: true,
            message: 'Subscription created successfully',
            data: subscription,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating subscription',
            error: error.message,
        });
    }
};
exports.createSubscription = createSubscription;
// Update subscription
const updateSubscription = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: req.user._id,
        };
        const subscription = await Subscription_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating subscription',
            error: error.message,
        });
    }
};
exports.updateSubscription = updateSubscription;
// Process billing
const processBilling = async (req, res) => {
    try {
        const subscription = await Subscription_1.default.findById(req.params.id);
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
            status: 'SUCCESS',
            invoiceId: req.body.invoiceId,
        });
        // Update next billing date
        const nextBillingDate = new Date(subscription.nextBillingDate);
        nextBillingDate.setDate(nextBillingDate.getDate() + subscription.billingCycle);
        subscription.nextBillingDate = nextBillingDate;
        subscription.updatedBy = req.user._id;
        await subscription.save();
        res.json({
            success: true,
            message: 'Billing processed successfully',
            data: subscription,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing billing',
            error: error.message,
        });
    }
};
exports.processBilling = processBilling;
// Pause subscription
const pauseSubscription = async (req, res) => {
    try {
        const subscription = await Subscription_1.default.findById(req.params.id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }
        subscription.status = 'PAUSED';
        subscription.updatedBy = req.user._id;
        await subscription.save();
        res.json({
            success: true,
            message: 'Subscription paused',
            data: subscription,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error pausing subscription',
            error: error.message,
        });
    }
};
exports.pauseSubscription = pauseSubscription;
// Resume subscription
const resumeSubscription = async (req, res) => {
    try {
        const subscription = await Subscription_1.default.findById(req.params.id);
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }
        subscription.status = 'ACTIVE';
        subscription.updatedBy = req.user._id;
        await subscription.save();
        res.json({
            success: true,
            message: 'Subscription resumed',
            data: subscription,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resuming subscription',
            error: error.message,
        });
    }
};
exports.resumeSubscription = resumeSubscription;
// Cancel subscription
const cancelSubscription = async (req, res) => {
    try {
        const { cancelReason } = req.body;
        const subscription = await Subscription_1.default.findById(req.params.id);
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
        subscription.updatedBy = req.user._id;
        await subscription.save();
        res.json({
            success: true,
            message: 'Subscription cancelled',
            data: subscription,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling subscription',
            error: error.message,
        });
    }
};
exports.cancelSubscription = cancelSubscription;
// Delete subscription
const deleteSubscription = async (req, res) => {
    try {
        const subscription = await Subscription_1.default.findByIdAndDelete(req.params.id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting subscription',
            error: error.message,
        });
    }
};
exports.deleteSubscription = deleteSubscription;
// Get subscription analytics
const getSubscriptionAnalytics = async (req, res) => {
    try {
        const { service } = req.query;
        const filter = {};
        if (service)
            filter.service = service;
        const total = await Subscription_1.default.countDocuments(filter);
        const active = await Subscription_1.default.countDocuments({ ...filter, status: 'ACTIVE' });
        const paused = await Subscription_1.default.countDocuments({ ...filter, status: 'PAUSED' });
        const cancelled = await Subscription_1.default.countDocuments({ ...filter, status: 'CANCELLED' });
        const mrr = await Subscription_1.default.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription analytics',
            error: error.message,
        });
    }
};
exports.getSubscriptionAnalytics = getSubscriptionAnalytics;
