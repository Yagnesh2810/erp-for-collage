"use strict";
// project\backend\src\controllers\inventoryController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryStats = exports.getInventorySummary = exports.deleteInventory = exports.getLowStockItems = exports.getInventoryTransactions = exports.adjustInventory = exports.updateInventory = exports.createInventory = exports.getInventoryById = exports.getInventory = void 0;
const Inventory_1 = __importDefault(require("../models/Inventory"));
const InventoryTransaction_1 = __importDefault(require("../models/InventoryTransaction"));
const Product_1 = __importDefault(require("../models/Product"));
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const socketEvents_1 = require("../utils/socketEvents");
// Get all inventory items with pagination and filtering
const getInventory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const filter = {};
        // Apply filters if provided
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.location) {
            filter.location = req.query.location;
        }
        // Search by product name requires aggregation
        let inventoryItems;
        let total;
        if (req.query.search) {
            const searchQuery = new RegExp(req.query.search, 'i');
            // Use aggregation to join with products and filter by product name
            inventoryItems = await Inventory_1.default.aggregate([
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $match: {
                        ...filter,
                        'product.name': searchQuery
                    }
                },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        _id: 1,
                        quantity: 1,
                        location: 1,
                        minimumStockLevel: 1,
                        maximumStockLevel: 1,
                        reorderPoint: 1,
                        status: 1,
                        lastUpdated: 1,
                        product: 1
                    }
                }
            ]);
            // Count total for pagination
            const countResult = await Inventory_1.default.aggregate([
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $match: {
                        ...filter,
                        'product.name': searchQuery
                    }
                },
                { $count: 'total' }
            ]);
            total = countResult.length > 0 ? countResult[0].total : 0;
        }
        else {
            // Simple find with populate if no search
            inventoryItems = await Inventory_1.default.find(filter)
                .populate('productId', 'name sku price category')
                .skip(skip)
                .limit(limit)
                .sort({ lastUpdated: -1 });
            total = await Inventory_1.default.countDocuments(filter);
        }
        return res.status(200).json({
            success: true,
            count: inventoryItems.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: inventoryItems
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching inventory: ${error}`);
        return res.status(500).json({
            success: false,
            error: 'Server error while fetching inventory'
        });
    }
};
exports.getInventory = getInventory;
// Get inventory by ID
const getInventoryById = async (req, res) => {
    try {
        const inventoryItem = await Inventory_1.default.findById(req.params.id)
            .populate('productId', 'name sku price category');
        if (!inventoryItem) {
            return res.status(404).json({
                success: false,
                error: 'Inventory item not found'
            });
        }
        return res.status(200).json({
            success: true,
            data: inventoryItem
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching inventory item: ${error}`);
        return res.status(500).json({
            success: false,
            error: 'Server error while fetching inventory item'
        });
    }
};
exports.getInventoryById = getInventoryById;
// Create new inventory item
const createInventory = async (req, res) => {
    try {
        const { productId, quantity, location, minimumStockLevel, maximumStockLevel, reorderPoint } = req.body;
        // Check if product exists
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        // Check if inventory already exists for this product and location
        const existingInventory = await Inventory_1.default.findOne({ productId, location });
        if (existingInventory) {
            return res.status(409).json({
                success: false,
                error: 'Inventory already exists for this product and location',
                data: existingInventory,
                suggestion: 'Use PATCH /inventory/:id to update the existing inventory'
            });
        }
        // Create new inventory
        const inventoryItem = await Inventory_1.default.create({
            productId,
            quantity,
            location,
            minimumStockLevel: minimumStockLevel || 5,
            maximumStockLevel: maximumStockLevel || 100,
            reorderPoint: reorderPoint || 10,
            lastUpdated: new Date()
        });
        // Create initial inventory transaction
        await InventoryTransaction_1.default.create({
            inventoryId: inventoryItem._id,
            productId,
            type: 'receive',
            quantity,
            previousQuantity: 0,
            newQuantity: quantity,
            reason: 'Initial inventory setup',
            performedBy: req.user._id,
            date: new Date()
        });
        // Populate the product details for the socket event
        const populatedInventory = await Inventory_1.default.findById(inventoryItem._id)
            .populate('productId', 'name sku price category');
        // Emit socket events for real-time updates
        (0, socketEvents_1.emitInventoryUpdated)(populatedInventory);
        // Also emit dashboard refresh event to update counters and stats
        (0, socketEvents_1.emitDashboardRefresh)();
        return res.status(201).json({
            success: true,
            data: inventoryItem
        });
    }
    catch (error) {
        logger_1.logger.error(`Error creating inventory: ${error}`);
        return res.status(500).json({
            success: false,
            error: 'Server error while creating inventory'
        });
    }
};
exports.createInventory = createInventory;
// Update inventory
const updateInventory = async (req, res) => {
    try {
        const { minimumStockLevel, maximumStockLevel, reorderPoint, location, notes } = req.body;
        const inventoryItem = await Inventory_1.default.findById(req.params.id);
        if (!inventoryItem) {
            return res.status(404).json({
                success: false,
                error: 'Inventory item not found'
            });
        }
        // Update only allowed fields (not quantity - use adjustInventory for that)
        if (minimumStockLevel !== undefined)
            inventoryItem.minimumStockLevel = minimumStockLevel;
        if (maximumStockLevel !== undefined)
            inventoryItem.maximumStockLevel = maximumStockLevel;
        if (reorderPoint !== undefined)
            inventoryItem.reorderPoint = reorderPoint;
        if (location)
            inventoryItem.location = location;
        if (notes !== undefined)
            inventoryItem.notes = notes;
        const updatedInventory = await inventoryItem.save();
        // Check if the status changed due to reorderPoint update
        if (updatedInventory.status === 'low-stock' || updatedInventory.status === 'out-of-stock') {
            // Get populated inventory for better context in the event
            const populatedInventory = await Inventory_1.default.findById(updatedInventory._id)
                .populate('productId', 'name sku price category');
            // Emit low stock alert
            (0, socketEvents_1.emitLowStockAlert)(populatedInventory);
        }
        // Emit inventory updated event
        const populatedInventory = await Inventory_1.default.findById(updatedInventory._id)
            .populate('productId', 'name sku price category');
        (0, socketEvents_1.emitInventoryUpdated)(populatedInventory);
        // Also emit dashboard refresh event to update counters and stats
        (0, socketEvents_1.emitDashboardRefresh)();
        return res.status(200).json({
            success: true,
            data: updatedInventory
        });
    }
    catch (error) {
        logger_1.logger.error(`Error updating inventory: ${error}`);
        return res.status(500).json({
            success: false,
            error: 'Server error while updating inventory'
        });
    }
};
exports.updateInventory = updateInventory;
// Adjust inventory quantity
const adjustInventory = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // Log received data for debugging
        console.log('Received adjustment data:', req.body);
        console.log('Inventory ID:', req.params.id);
        let { quantity, type, reason, referenceId, referenceType, notes } = req.body;
        // Make sure quantity is a number
        quantity = Number(quantity);
        if (isNaN(quantity) || !type || !reason) {
            return res.status(400).json({
                success: false,
                error: 'Valid quantity, type, and reason are required'
            });
        }
        if (!['receive', 'issue', 'adjustment', 'transfer', 'return'].includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid transaction type'
            });
        }
        const inventoryItem = await Inventory_1.default.findById(req.params.id).session(session);
        if (!inventoryItem) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                error: 'Inventory item not found'
            });
        }
        const previousQuantity = inventoryItem.quantity;
        let newQuantity;
        // Calculate new quantity based on transaction type
        switch (type) {
            case 'receive':
            case 'return':
                newQuantity = previousQuantity + quantity;
                break;
            case 'issue':
                if (previousQuantity < quantity) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({
                        success: false,
                        error: 'Insufficient inventory'
                    });
                }
                newQuantity = previousQuantity - quantity;
                break;
            case 'adjustment':
                newQuantity = quantity; // Direct set
                break;
            case 'transfer':
                if (previousQuantity < quantity) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({
                        success: false,
                        error: 'Insufficient inventory for transfer'
                    });
                }
                newQuantity = previousQuantity - quantity;
                break;
        }
        // Update inventory
        inventoryItem.quantity = newQuantity;
        inventoryItem.lastUpdated = new Date();
        await inventoryItem.save({ session });
        // Create transaction record
        await InventoryTransaction_1.default.create([{
                inventoryId: inventoryItem._id,
                productId: inventoryItem.productId,
                type,
                quantity,
                previousQuantity,
                newQuantity,
                reason,
                referenceId,
                referenceType,
                performedBy: req.user._id,
                date: new Date(),
                notes
            }], { session });
        // Get populated inventory for socket event
        const populatedInventory = await Inventory_1.default.findById(inventoryItem._id)
            .populate('productId', 'name sku price category')
            .session(session);
        // Check if need to emit low stock alert
        const previousStatus = previousQuantity <= inventoryItem.reorderPoint ? 'low-stock' : 'in-stock';
        const newStatus = newQuantity <= inventoryItem.reorderPoint ? 'low-stock' : 'in-stock';
        // If status changed to low stock, emit an alert
        if (previousStatus !== 'low-stock' && newStatus === 'low-stock') {
            (0, socketEvents_1.emitLowStockAlert)(populatedInventory);
        }
        // Emit inventory updated event with populated product data
        (0, socketEvents_1.emitInventoryUpdated)(populatedInventory);
        // Also emit dashboard refresh for stats updates
        (0, socketEvents_1.emitDashboardRefresh)();
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({
            success: true,
            data: {
                ...inventoryItem.toObject(),
                previousQuantity,
                adjustment: quantity,
                newQuantity
            }
        });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger_1.logger.error(`Error adjusting inventory: ${error}`);
        console.error('Inventory adjustment error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error while adjusting inventory'
        });
    }
};
exports.adjustInventory = adjustInventory;
// Get inventory transactions for a specific inventory item
const getInventoryTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const inventoryId = req.params.id;
        const transactions = await InventoryTransaction_1.default.find({ inventoryId })
            .populate('performedBy', 'name email')
            .skip(skip)
            .limit(limit)
            .sort({ date: -1 });
        const total = await InventoryTransaction_1.default.countDocuments({ inventoryId });
        return res.status(200).json({
            success: true,
            count: transactions.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: transactions
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching inventory transactions: ${error}`);
        return res.status(500).json({
            success: false,
            error: 'Server error while fetching inventory transactions'
        });
    }
};
exports.getInventoryTransactions = getInventoryTransactions;
// Get low stock inventory items
const getLowStockItems = async (req, res) => {
    try {
        const lowStockItems = await Inventory_1.default.find({ status: 'low-stock' })
            .populate('productId', 'name sku price category');
        return res.status(200).json({
            success: true,
            count: lowStockItems.length,
            data: lowStockItems
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching low stock items: ${error}`);
        return res.status(500).json({
            success: false,
            error: 'Server error while fetching low stock items'
        });
    }
};
exports.getLowStockItems = getLowStockItems;
// Delete inventory item (careful with this one)
const deleteInventory = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const inventoryItem = await Inventory_1.default.findById(req.params.id).session(session);
        if (!inventoryItem) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                error: 'Inventory item not found'
            });
        }
        // Check if there are any transactions for this inventory
        const transactionCount = await InventoryTransaction_1.default.countDocuments({
            inventoryId: inventoryItem._id
        }).session(session);
        if (transactionCount > 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                error: 'Cannot delete inventory with existing transactions'
            });
        }
        // Save the ID and get product details before deletion for the socket event
        const inventoryId = inventoryItem._id;
        const productDetails = await Product_1.default.findById(inventoryItem.productId)
            .select('name sku price category')
            .session(session);
        await inventoryItem.deleteOne({ session });
        // Emit dashboard refresh event
        (0, socketEvents_1.emitDashboardRefresh)();
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({
            success: true,
            data: {}
        });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger_1.logger.error(`Error deleting inventory: ${error}`);
        return res.status(500).json({
            success: false,
            error: 'Server error while deleting inventory'
        });
    }
};
exports.deleteInventory = deleteInventory;
// Get inventory stock levels summary
const getInventorySummary = async (req, res) => {
    try {
        const totalItems = await Inventory_1.default.countDocuments();
        const lowStockCount = await Inventory_1.default.countDocuments({ status: 'low-stock' });
        const outOfStockCount = await Inventory_1.default.countDocuments({ status: 'out-of-stock' });
        const healthyStockCount = await Inventory_1.default.countDocuments({ status: 'in-stock' });
        const totalValue = await Inventory_1.default.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                }
            }
        ]);
        // Get top 5 products by quantity
        const topProducts = await Inventory_1.default.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            { $sort: { quantity: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 1,
                    productName: '$product.name',
                    quantity: 1,
                    value: { $multiply: ['$quantity', '$product.price'] }
                }
            }
        ]);
        return res.status(200).json({
            success: true,
            data: {
                totalItems,
                lowStockCount,
                outOfStockCount,
                healthyStockCount,
                totalValue: totalValue.length > 0 ? totalValue[0].totalValue : 0,
                topProducts
            }
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching inventory summary: ${error}`);
        return res.status(500).json({
            success: false,
            error: 'Server error while fetching inventory summary'
        });
    }
};
exports.getInventorySummary = getInventorySummary;
// Get inventory statistics for dashboard
const getInventoryStats = async (req, res) => {
    try {
        const totalCount = await Inventory_1.default.countDocuments();
        const lowStockCount = await Inventory_1.default.countDocuments({ status: 'low-stock' });
        const outOfStockCount = await Inventory_1.default.countDocuments({ status: 'out-of-stock' });
        // Calculate total value and average metrics
        const aggregateResults = await Inventory_1.default.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: null,
                    totalValue: { $sum: { $multiply: ['$quantity', '$product.price'] } },
                    averageStockLevel: { $avg: '$quantity' },
                    averageReorderPoint: { $avg: '$reorderPoint' }
                }
            }
        ]);
        const totalValue = aggregateResults.length > 0 ? aggregateResults[0].totalValue : 0;
        const averageStockLevel = aggregateResults.length > 0 ? aggregateResults[0].averageStockLevel : 0;
        const averageReorderPoint = aggregateResults.length > 0 ? aggregateResults[0].averageReorderPoint : 0;
        const lowStockPercentage = totalCount > 0 ? (lowStockCount / totalCount) * 100 : 0;
        return res.status(200).json({
            success: true,
            data: {
                totalCount,
                totalValue,
                averageStockLevel: Math.round(averageStockLevel * 100) / 100,
                averageReorderPoint: Math.round(averageReorderPoint * 100) / 100,
                lowStockPercentage: Math.round(lowStockPercentage * 100) / 100,
                outOfStockCount
            }
        });
    }
    catch (error) {
        logger_1.logger.error(`Error fetching inventory stats: ${error}`);
        return res.status(500).json({
            success: false,
            error: 'Server error while fetching inventory statistics'
        });
    }
};
exports.getInventoryStats = getInventoryStats;
