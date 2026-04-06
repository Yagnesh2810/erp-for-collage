"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemHealth = exports.sendNotification = exports.triggerDashboardRefresh = exports.getRealTimeMetrics = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Customer_1 = __importDefault(require("../models/Customer"));
const Employee_1 = __importDefault(require("../models/Employee"));
const Project_1 = __importDefault(require("../models/Project"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const server_1 = require("../server");
/**
 * Get real-time dashboard metrics
 * @route GET /api/realtime/metrics
 * @access Private
 */
const getRealTimeMetrics = async (req, res) => {
    try {
        const [totalOrders, totalRevenue, pendingOrders, totalCustomers, employeeCount, activeProjects, lowStockCount] = await Promise.all([
            Order_1.default.countDocuments(),
            Order_1.default.aggregate([
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]).then(result => result[0]?.total || 0),
            Order_1.default.countDocuments({ status: 'pending' }),
            Customer_1.default.countDocuments(),
            Employee_1.default.countDocuments(),
            Project_1.default.countDocuments({ status: { $ne: 'completed' } }),
            Inventory_1.default.countDocuments({ quantity: { $lte: 10 } })
        ]);
        const metrics = {
            totalOrders,
            totalRevenue,
            pendingOrders,
            totalCustomers,
            employeeCount,
            activeProjects,
            lowStockItems: lowStockCount,
            totalProducts: await Inventory_1.default.countDocuments(),
            timestamp: new Date()
        };
        res.json({ success: true, data: metrics });
    }
    catch (error) {
        console.error('Error fetching real-time metrics:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getRealTimeMetrics = getRealTimeMetrics;
/**
 * Trigger dashboard refresh for all connected clients
 * @route POST /api/realtime/refresh
 * @access Private
 */
const triggerDashboardRefresh = async (req, res) => {
    try {
        server_1.io.emit('dashboard:refresh');
        res.json({ success: true, message: 'Dashboard refresh triggered' });
    }
    catch (error) {
        console.error('Error triggering dashboard refresh:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.triggerDashboardRefresh = triggerDashboardRefresh;
/**
 * Send custom notification to all clients
 * @route POST /api/realtime/notify
 * @access Private
 */
const sendNotification = async (req, res) => {
    try {
        const { type, message, data } = req.body;
        const notification = {
            id: `notification-${Date.now()}`,
            type: type || 'info',
            message: message || 'System notification',
            timestamp: new Date().toISOString(),
            read: false,
            data: data || {}
        };
        server_1.io.emit('notification', notification);
        res.json({ success: true, message: 'Notification sent', notification });
    }
    catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.sendNotification = sendNotification;
/**
 * Get system health status
 * @route GET /api/realtime/health
 * @access Private
 */
const getSystemHealth = async (req, res) => {
    try {
        const connectedClients = server_1.io.engine.clientsCount;
        const health = {
            status: 'healthy',
            connectedClients,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date()
        };
        res.json({ success: true, data: health });
    }
    catch (error) {
        console.error('Error getting system health:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getSystemHealth = getSystemHealth;
exports.default = {
    getRealTimeMetrics: exports.getRealTimeMetrics,
    triggerDashboardRefresh: exports.triggerDashboardRefresh,
    sendNotification: exports.sendNotification,
    getSystemHealth: exports.getSystemHealth
};
