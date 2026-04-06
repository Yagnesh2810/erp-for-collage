"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamProductivity = exports.getTaskReports = exports.getProjectReports = exports.getOrderStatus = exports.getInventoryStatus = exports.getTopSellingProducts = exports.getSalesOverTime = exports.getProductCategories = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const Order_1 = __importDefault(require("../models/Order"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const Project_1 = __importDefault(require("../models/Project"));
const Task_1 = __importDefault(require("../models/Task"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * @desc    Get product categories data
 * @route   GET /api/reports/product-categories
 * @access  Private
 */
const getProductCategories = async (req, res) => {
    try {
        const { from, to } = req.query;
        // Create date filters if provided
        const dateFilter = {};
        if (from && to) {
            Object.assign(dateFilter, {
                createdAt: {
                    $gte: new Date(from),
                    $lte: new Date(to)
                }
            });
        }
        // Aggregate products by category
        const categories = await Product_1.default.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: '$_id',
                    value: '$count'
                }
            },
            { $sort: { value: -1 } }
        ]);
        // If no categories found with the date filter, get all categories
        if (categories.length === 0 && (from || to)) {
            const allCategories = await Product_1.default.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: '$_id',
                        value: '$count'
                    }
                },
                { $sort: { value: -1 } }
            ]);
            return res.status(200).json({
                success: true,
                data: allCategories,
                message: 'No products found in the date range. Showing all categories.'
            });
        }
        res.status(200).json({
            success: true,
            data: categories
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product categories',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getProductCategories = getProductCategories;
/**
 * @desc    Get sales over time data
 * @route   GET /api/reports/sales-over-time
 * @access  Private
 */
const getSalesOverTime = async (req, res) => {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: 'Date range is required'
            });
        }
        // Create date range for the query
        const fromDate = new Date(from);
        const toDate = new Date(to);
        // Calculate appropriate date grouping based on the range
        const daysDifference = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24));
        let groupFormat;
        let formatPipeline;
        if (daysDifference <= 31) {
            // Group by day for ranges up to a month
            groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
            formatPipeline = {
                $addFields: {
                    date: '$_id'
                }
            };
        }
        else if (daysDifference <= 90) {
            // Group by week for ranges up to 3 months
            groupFormat = {
                $dateToString: {
                    format: '%Y-%U',
                    date: '$createdAt'
                }
            };
            formatPipeline = {
                $addFields: {
                    date: {
                        $concat: ['Week ', { $substr: [{ $split: ['$_id', '-'] }, 1, -1] }, ', ',
                            { $substr: [{ $split: ['$_id', '-'] }, 0, 1] }]
                    }
                }
            };
        }
        else {
            // Group by month for larger ranges
            groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
            formatPipeline = {
                $addFields: {
                    date: {
                        $let: {
                            vars: {
                                monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                            },
                            in: {
                                $concat: [
                                    { $arrayElemAt: ['$monthNames', { $subtract: [{ $toInt: { $substr: [{ $split: ['$_id', '-'] }, 1, -1] } }, 1] }] },
                                    ' ',
                                    { $substr: [{ $split: ['$_id', '-'] }, 0, 1] }
                                ]
                            }
                        }
                    }
                }
            };
        }
        // Aggregate orders by created date
        const salesData = await Order_1.default.aggregate([
            {
                $match: {
                    createdAt: { $gte: fromDate, $lte: toDate },
                    status: { $nin: ['Cancelled'] }
                }
            },
            {
                $group: {
                    _id: groupFormat,
                    total: { $sum: '$total' },
                    orders: { $sum: 1 }
                }
            },
            formatPipeline,
            {
                $project: {
                    _id: 0,
                    date: 1,
                    total: 1,
                    orders: 1
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.status(200).json({
            success: true,
            data: salesData
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching sales data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getSalesOverTime = getSalesOverTime;
/**
 * @desc    Get top selling products
 * @route   GET /api/reports/top-products
 * @access  Private
 */
const getTopSellingProducts = async (req, res) => {
    try {
        const { from, to, limit = 10 } = req.query;
        // Create date filters
        const matchFilter = {};
        if (from && to) {
            matchFilter.createdAt = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        }
        matchFilter.status = { $nin: ['Cancelled'] };
        // Lookup and aggregate order items to get top products
        const topProducts = await Order_1.default.aggregate([
            { $match: matchFilter },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    quantity: { $sum: '$items.quantity' },
                    revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    _id: 1,
                    name: '$productInfo.name',
                    quantity: 1,
                    revenue: 1
                }
            },
            { $sort: { quantity: -1 } },
            { $limit: parseInt(limit) }
        ]);
        res.status(200).json({
            success: true,
            data: topProducts
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching top products',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getTopSellingProducts = getTopSellingProducts;
/**
 * @desc    Get inventory status
 * @route   GET /api/reports/inventory-status
 * @access  Private
 */
const getInventoryStatus = async (req, res) => {
    try {
        // Get inventory data with product details
        const inventoryStatus = await Inventory_1.default.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    _id: '$_id',
                    name: '$productInfo.name',
                    category: '$productInfo.category',
                    currentStock: '$quantity',
                    reorderPoint: { $ifNull: ['$reorderPoint', 10] },
                    lowStock: {
                        $cond: {
                            if: { $lte: ['$quantity', { $ifNull: ['$reorderPoint', 10] }] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            { $sort: { lowStock: -1, currentStock: 1 } }
        ]);
        res.status(200).json({
            success: true,
            data: inventoryStatus
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching inventory status',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getInventoryStatus = getInventoryStatus;
/**
 * @desc    Get order status
 * @route   GET /api/reports/order-status
 * @access  Private
 */
const getOrderStatus = async (req, res) => {
    try {
        const { from, to } = req.query;
        // Create date filters
        const matchFilter = {};
        if (from && to) {
            matchFilter.createdAt = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        }
        // Get orders with customer details
        const orders = await Order_1.default.aggregate([
            { $match: matchFilter },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customer',
                    foreignField: '_id',
                    as: 'customerInfo'
                }
            },
            {
                $project: {
                    _id: 1,
                    orderNumber: 1,
                    status: 1,
                    total: 1,
                    createdAt: 1,
                    customer: {
                        $cond: {
                            if: { $gt: [{ $size: '$customerInfo' }, 0] },
                            then: {
                                _id: { $arrayElemAt: ['$customerInfo._id', 0] },
                                name: { $arrayElemAt: ['$customerInfo.name', 0] }
                            },
                            else: null
                        }
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        res.status(200).json({
            success: true,
            data: orders
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order status',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getOrderStatus = getOrderStatus;
/**
 * @desc    Get project reports
 * @route   GET /api/reports/projects
 * @access  Private
 */
const getProjectReports = async (req, res) => {
    try {
        const { from, to } = req.query;
        const matchFilter = {};
        if (from && to) {
            matchFilter.createdAt = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        }
        const projectStats = await Project_1.default.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalBudget: { $sum: '$budget' },
                    spentBudget: { $sum: '$spentBudget' }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1,
                    totalBudget: 1,
                    spentBudget: 1
                }
            }
        ]);
        const projectProgress = await Project_1.default.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: null,
                    avgProgress: { $avg: '$progress' },
                    totalProjects: { $sum: 1 },
                    completedProjects: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                }
            }
        ]);
        res.status(200).json({
            success: true,
            data: {
                statusBreakdown: projectStats,
                progress: projectProgress[0] || { avgProgress: 0, totalProjects: 0, completedProjects: 0 }
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching project reports',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getProjectReports = getProjectReports;
/**
 * @desc    Get task reports
 * @route   GET /api/reports/tasks
 * @access  Private
 */
const getTaskReports = async (req, res) => {
    try {
        const { from, to, projectId } = req.query;
        const matchFilter = {};
        if (from && to) {
            matchFilter.createdAt = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        }
        if (projectId) {
            matchFilter.project = new mongoose_1.default.Types.ObjectId(projectId);
        }
        const taskStats = await Task_1.default.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalEstimated: { $sum: '$estimatedHours' },
                    totalActual: { $sum: '$actualHours' }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1,
                    totalEstimated: 1,
                    totalActual: 1
                }
            }
        ]);
        const priorityStats = await Task_1.default.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    priority: '$_id',
                    count: 1
                }
            }
        ]);
        const overdueTasks = await Task_1.default.countDocuments({
            ...matchFilter,
            dueDate: { $lt: new Date() },
            status: { $ne: 'completed' }
        });
        res.status(200).json({
            success: true,
            data: {
                statusBreakdown: taskStats,
                priorityBreakdown: priorityStats,
                overdueTasks
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching task reports',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getTaskReports = getTaskReports;
/**
 * @desc    Get team productivity report
 * @route   GET /api/reports/team-productivity
 * @access  Private
 */
const getTeamProductivity = async (req, res) => {
    try {
        const { from, to } = req.query;
        const matchFilter = {};
        if (from && to) {
            matchFilter.createdAt = {
                $gte: new Date(from),
                $lte: new Date(to)
            };
        }
        // Check if there are any tasks first
        const taskCount = await Task_1.default.countDocuments(matchFilter);
        if (taskCount === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }
        const productivity = await Task_1.default.aggregate([
            { $match: matchFilter },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'employee'
                }
            },
            {
                $match: {
                    'employee.0': { $exists: true }
                }
            },
            { $unwind: '$employee' },
            {
                $group: {
                    _id: '$assignedTo',
                    name: { $first: { $concat: ['$employee.firstName', ' ', '$employee.lastName'] } },
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    totalEstimated: { $sum: { $ifNull: ['$estimatedHours', 0] } },
                    totalActual: { $sum: { $ifNull: ['$actualHours', 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    employeeId: '$_id',
                    name: 1,
                    totalTasks: 1,
                    completedTasks: 1,
                    completionRate: {
                        $cond: [
                            { $gt: ['$totalTasks', 0] },
                            { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
                            0
                        ]
                    },
                    efficiency: {
                        $cond: [
                            { $and: [{ $gt: ['$totalEstimated', 0] }, { $gt: ['$totalActual', 0] }] },
                            { $multiply: [{ $divide: ['$totalEstimated', '$totalActual'] }, 100] },
                            100
                        ]
                    }
                }
            },
            { $sort: { completionRate: -1 } }
        ]);
        res.status(200).json({
            success: true,
            data: productivity
        });
    }
    catch (error) {
        console.error('Team productivity error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching team productivity',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getTeamProductivity = getTeamProductivity;
