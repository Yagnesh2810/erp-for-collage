"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkOrderCosts = exports.createWorkOrder = exports.getWorkOrders = void 0;
const WorkOrder_1 = __importDefault(require("../../models/finance/WorkOrder"));
const getWorkOrders = async (req, res) => {
    try {
        const workOrders = await WorkOrder_1.default.find().populate('productId');
        res.json(workOrders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch work orders' });
    }
};
exports.getWorkOrders = getWorkOrders;
const createWorkOrder = async (req, res) => {
    try {
        const workOrder = new WorkOrder_1.default(req.body);
        await workOrder.save();
        res.status(201).json(workOrder);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create work order' });
    }
};
exports.createWorkOrder = createWorkOrder;
const updateWorkOrderCosts = async (req, res) => {
    try {
        const { id } = req.params;
        const { materialCost, laborCost, overheadCost } = req.body;
        const totalCost = materialCost + laborCost + overheadCost;
        const workOrder = await WorkOrder_1.default.findByIdAndUpdate(id, {
            materialCost,
            laborCost,
            overheadCost,
            totalCost
        }, { new: true });
        res.json(workOrder);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update work order costs' });
    }
};
exports.updateWorkOrderCosts = updateWorkOrderCosts;
