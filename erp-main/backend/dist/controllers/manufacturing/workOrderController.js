"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkOrderAnalytics = exports.deleteWorkOrder = exports.recordMaterialConsumption = exports.completeWorkOrder = exports.startWorkOrder = exports.updateWorkOrder = exports.createWorkOrder = exports.getWorkOrderById = exports.getAllWorkOrders = void 0;
const WorkOrder_1 = __importDefault(require("../../models/manufacturing/WorkOrder"));
const BillOfMaterials_1 = __importDefault(require("../../models/manufacturing/BillOfMaterials"));
const Product_1 = __importDefault(require("../../models/Product"));
const Inventory_1 = __importDefault(require("../../models/Inventory"));
const numberGenerator_1 = require("../../utils/numberGenerator");
// Get all work orders
const getAllWorkOrders = async (req, res) => {
    try {
        const { status, priority, product, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (priority)
            filter.priority = priority;
        if (product)
            filter.product = product;
        const workOrders = await WorkOrder_1.default.find(filter)
            .populate('product', 'name sku')
            .populate('bom', 'bomNumber name')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await WorkOrder_1.default.countDocuments(filter);
        res.json({
            success: true,
            data: workOrders,
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
            message: 'Error fetching work orders',
            error: error.message,
        });
    }
};
exports.getAllWorkOrders = getAllWorkOrders;
// Get work order by ID
const getWorkOrderById = async (req, res) => {
    try {
        const workOrder = await WorkOrder_1.default.findById(req.params.id)
            .populate('product')
            .populate('bom')
            .populate('assignedTo', 'name email')
            .populate('materialConsumption.product', 'name sku')
            .populate('qualityChecks')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
        if (!workOrder) {
            return res.status(404).json({
                success: false,
                message: 'Work order not found',
            });
        }
        res.json({
            success: true,
            data: workOrder,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching work order',
            error: error.message,
        });
    }
};
exports.getWorkOrderById = getWorkOrderById;
// Create work order
const createWorkOrder = async (req, res) => {
    try {
        const workOrderNumber = await (0, numberGenerator_1.generateWorkOrderNumber)();
        const workOrderData = {
            ...req.body,
            workOrderNumber,
            createdBy: req.user._id,
        };
        // Validate product and BOM
        const product = await Product_1.default.findById(workOrderData.product);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }
        const bom = await BillOfMaterials_1.default.findById(workOrderData.bom).populate('components.product');
        if (!bom) {
            return res.status(404).json({
                success: false,
                message: 'BOM not found',
            });
        }
        // Initialize material consumption from BOM
        const materialConsumption = bom.components.map((component) => ({
            product: component.product._id,
            plannedQuantity: component.quantity * workOrderData.quantity,
            actualQuantity: 0,
            unit: component.unit,
            cost: component.costPerUnit * component.quantity * workOrderData.quantity,
        }));
        workOrderData.materialConsumption = materialConsumption;
        workOrderData.plannedCost = bom.totalCost * workOrderData.quantity;
        const workOrder = await WorkOrder_1.default.create(workOrderData);
        res.status(201).json({
            success: true,
            message: 'Work order created successfully',
            data: workOrder,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating work order',
            error: error.message,
        });
    }
};
exports.createWorkOrder = createWorkOrder;
// Update work order
const updateWorkOrder = async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: req.user._id,
        };
        const workOrder = await WorkOrder_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
            .populate('product')
            .populate('bom')
            .populate('assignedTo');
        if (!workOrder) {
            return res.status(404).json({
                success: false,
                message: 'Work order not found',
            });
        }
        res.json({
            success: true,
            message: 'Work order updated successfully',
            data: workOrder,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating work order',
            error: error.message,
        });
    }
};
exports.updateWorkOrder = updateWorkOrder;
// Start work order
const startWorkOrder = async (req, res) => {
    try {
        const workOrder = await WorkOrder_1.default.findById(req.params.id);
        if (!workOrder) {
            return res.status(404).json({
                success: false,
                message: 'Work order not found',
            });
        }
        if (workOrder.status !== 'PLANNED' && workOrder.status !== 'RELEASED') {
            return res.status(400).json({
                success: false,
                message: 'Work order cannot be started from current status',
            });
        }
        workOrder.status = 'IN_PROGRESS';
        workOrder.actualStartDate = new Date();
        workOrder.updatedBy = req.user._id;
        await workOrder.save();
        res.json({
            success: true,
            message: 'Work order started successfully',
            data: workOrder,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error starting work order',
            error: error.message,
        });
    }
};
exports.startWorkOrder = startWorkOrder;
// Complete work order
const completeWorkOrder = async (req, res) => {
    try {
        const workOrder = await WorkOrder_1.default.findById(req.params.id).populate('product');
        if (!workOrder) {
            return res.status(404).json({
                success: false,
                message: 'Work order not found',
            });
        }
        if (workOrder.status !== 'IN_PROGRESS') {
            return res.status(400).json({
                success: false,
                message: 'Only in-progress work orders can be completed',
            });
        }
        workOrder.status = 'COMPLETED';
        workOrder.actualEndDate = new Date();
        workOrder.updatedBy = req.user._id;
        await workOrder.save();
        // Update product inventory
        const product = workOrder.product;
        const inventory = await Inventory_1.default.findOne({ product: product._id });
        if (inventory) {
            inventory.quantity += workOrder.completedQuantity;
            await inventory.save();
        }
        else {
            await Inventory_1.default.create({
                product: product._id,
                quantity: workOrder.completedQuantity,
                location: 'Production',
                createdBy: req.user._id,
            });
        }
        res.json({
            success: true,
            message: 'Work order completed successfully',
            data: workOrder,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error completing work order',
            error: error.message,
        });
    }
};
exports.completeWorkOrder = completeWorkOrder;
// Record material consumption
const recordMaterialConsumption = async (req, res) => {
    try {
        const { id } = req.params;
        const { consumptions } = req.body;
        const workOrder = await WorkOrder_1.default.findById(id);
        if (!workOrder) {
            return res.status(404).json({
                success: false,
                message: 'Work order not found',
            });
        }
        // Update material consumption
        for (const consumption of consumptions) {
            const materialIndex = workOrder.materialConsumption.findIndex((m) => m.product.toString() === consumption.product);
            if (materialIndex !== -1) {
                workOrder.materialConsumption[materialIndex].actualQuantity = consumption.actualQuantity;
            }
            // Deduct from inventory
            const inventory = await Inventory_1.default.findOne({ product: consumption.product });
            if (inventory) {
                inventory.quantity -= consumption.actualQuantity;
                await inventory.save();
            }
        }
        workOrder.updatedBy = req.user._id;
        await workOrder.save();
        res.json({
            success: true,
            message: 'Material consumption recorded successfully',
            data: workOrder,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error recording material consumption',
            error: error.message,
        });
    }
};
exports.recordMaterialConsumption = recordMaterialConsumption;
// Delete work order
const deleteWorkOrder = async (req, res) => {
    try {
        const workOrder = await WorkOrder_1.default.findByIdAndDelete(req.params.id);
        if (!workOrder) {
            return res.status(404).json({
                success: false,
                message: 'Work order not found',
            });
        }
        res.json({
            success: true,
            message: 'Work order deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting work order',
            error: error.message,
        });
    }
};
exports.deleteWorkOrder = deleteWorkOrder;
// Get work order analytics
const getWorkOrderAnalytics = async (req, res) => {
    try {
        const totalWorkOrders = await WorkOrder_1.default.countDocuments();
        const completedWorkOrders = await WorkOrder_1.default.countDocuments({ status: 'COMPLETED' });
        const inProgressWorkOrders = await WorkOrder_1.default.countDocuments({ status: 'IN_PROGRESS' });
        const plannedWorkOrders = await WorkOrder_1.default.countDocuments({ status: 'PLANNED' });
        const avgProductionYield = await WorkOrder_1.default.aggregate([
            { $match: { status: 'COMPLETED' } },
            { $group: { _id: null, avgYield: { $avg: '$productionYield' } } },
        ]);
        res.json({
            success: true,
            data: {
                total: totalWorkOrders,
                completed: completedWorkOrders,
                inProgress: inProgressWorkOrders,
                planned: plannedWorkOrders,
                averageYield: avgProductionYield[0]?.avgYield || 0,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching work order analytics',
            error: error.message,
        });
    }
};
exports.getWorkOrderAnalytics = getWorkOrderAnalytics;
