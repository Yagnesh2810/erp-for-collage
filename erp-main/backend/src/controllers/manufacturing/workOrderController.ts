import { Request, Response } from 'express';
import WorkOrder from '../../models/manufacturing/WorkOrder';
import BillOfMaterials from '../../models/manufacturing/BillOfMaterials';
import Product from '../../models/Product';
import Inventory from '../../models/Inventory';
import { generateWorkOrderNumber } from '../../utils/numberGenerator';

// Get all work orders
export const getAllWorkOrders = async (req: Request, res: Response) => {
    try {
        const { status, priority, product, page = 1, limit = 20 } = req.query;

        const filter: any = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (product) filter.product = product;

        const workOrders = await WorkOrder.find(filter)
            .populate('product', 'name sku')
            .populate('bom', 'bomNumber name')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await WorkOrder.countDocuments(filter);

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching work orders',
            error: error.message,
        });
    }
};

// Get work order by ID
export const getWorkOrderById = async (req: Request, res: Response) => {
    try {
        const workOrder = await WorkOrder.findById(req.params.id)
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching work order',
            error: error.message,
        });
    }
};

// Create work order
export const createWorkOrder = async (req: Request, res: Response) => {
    try {
        const workOrderNumber = await generateWorkOrderNumber();

        const workOrderData = {
            ...req.body,
            workOrderNumber,
            createdBy: (req as any).user._id,
        };

        // Validate product and BOM
        const product = await Product.findById(workOrderData.product);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const bom = await BillOfMaterials.findById(workOrderData.bom).populate('components.product');
        if (!bom) {
            return res.status(404).json({
                success: false,
                message: 'BOM not found',
            });
        }

        // Initialize material consumption from BOM
        const materialConsumption = bom.components.map((component: any) => ({
            product: component.product._id,
            plannedQuantity: component.quantity * workOrderData.quantity,
            actualQuantity: 0,
            unit: component.unit,
            cost: component.costPerUnit * component.quantity * workOrderData.quantity,
        }));

        workOrderData.materialConsumption = materialConsumption;
        workOrderData.plannedCost = bom.totalCost * workOrderData.quantity;

        const workOrder = await WorkOrder.create(workOrderData);

        res.status(201).json({
            success: true,
            message: 'Work order created successfully',
            data: workOrder,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error creating work order',
            error: error.message,
        });
    }
};

// Update work order
export const updateWorkOrder = async (req: Request, res: Response) => {
    try {
        const updateData = {
            ...req.body,
            updatedBy: (req as any).user._id,
        };

        const workOrder = await WorkOrder.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error updating work order',
            error: error.message,
        });
    }
};

// Start work order
export const startWorkOrder = async (req: Request, res: Response) => {
    try {
        const workOrder = await WorkOrder.findById(req.params.id);

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
        workOrder.updatedBy = (req as any).user._id;
        await workOrder.save();

        res.json({
            success: true,
            message: 'Work order started successfully',
            data: workOrder,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error starting work order',
            error: error.message,
        });
    }
};

// Complete work order
export const completeWorkOrder = async (req: Request, res: Response) => {
    try {
        const workOrder = await WorkOrder.findById(req.params.id).populate('product');

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
        workOrder.updatedBy = (req as any).user._id;
        await workOrder.save();

        // Update product inventory
        const product: any = workOrder.product;
        const inventory = await Inventory.findOne({ product: product._id });

        if (inventory) {
            inventory.quantity += workOrder.completedQuantity;
            await inventory.save();
        } else {
            await Inventory.create({
                product: product._id,
                quantity: workOrder.completedQuantity,
                location: 'Production',
                createdBy: (req as any).user._id,
            });
        }

        res.json({
            success: true,
            message: 'Work order completed successfully',
            data: workOrder,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error completing work order',
            error: error.message,
        });
    }
};

// Record material consumption
export const recordMaterialConsumption = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { consumptions } = req.body;

        const workOrder = await WorkOrder.findById(id);

        if (!workOrder) {
            return res.status(404).json({
                success: false,
                message: 'Work order not found',
            });
        }

        // Update material consumption
        for (const consumption of consumptions) {
            const materialIndex = workOrder.materialConsumption.findIndex(
                (m: any) => m.product.toString() === consumption.product
            );

            if (materialIndex !== -1) {
                workOrder.materialConsumption[materialIndex].actualQuantity = consumption.actualQuantity;
            }

            // Deduct from inventory
            const inventory = await Inventory.findOne({ product: consumption.product });
            if (inventory) {
                inventory.quantity -= consumption.actualQuantity;
                await inventory.save();
            }
        }

        workOrder.updatedBy = (req as any).user._id;
        await workOrder.save();

        res.json({
            success: true,
            message: 'Material consumption recorded successfully',
            data: workOrder,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error recording material consumption',
            error: error.message,
        });
    }
};

// Delete work order
export const deleteWorkOrder = async (req: Request, res: Response) => {
    try {
        const workOrder = await WorkOrder.findByIdAndDelete(req.params.id);

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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error deleting work order',
            error: error.message,
        });
    }
};

// Get work order analytics
export const getWorkOrderAnalytics = async (req: Request, res: Response) => {
    try {
        const totalWorkOrders = await WorkOrder.countDocuments();
        const completedWorkOrders = await WorkOrder.countDocuments({ status: 'COMPLETED' });
        const inProgressWorkOrders = await WorkOrder.countDocuments({ status: 'IN_PROGRESS' });
        const plannedWorkOrders = await WorkOrder.countDocuments({ status: 'PLANNED' });

        const avgProductionYield = await WorkOrder.aggregate([
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
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching work order analytics',
            error: error.message,
        });
    }
};
