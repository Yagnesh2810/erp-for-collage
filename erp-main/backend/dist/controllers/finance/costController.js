"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCostCenter = exports.createCostCenter = exports.getCostCenters = void 0;
const CostCenter_1 = __importDefault(require("../../models/finance/CostCenter"));
const getCostCenters = async (req, res) => {
    try {
        const costCenters = await CostCenter_1.default.find({ isActive: true }).populate('managerId parentId');
        res.json(costCenters);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch cost centers' });
    }
};
exports.getCostCenters = getCostCenters;
const createCostCenter = async (req, res) => {
    try {
        const costCenter = new CostCenter_1.default(req.body);
        await costCenter.save();
        res.status(201).json(costCenter);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create cost center' });
    }
};
exports.createCostCenter = createCostCenter;
const updateCostCenter = async (req, res) => {
    try {
        const { id } = req.params;
        const costCenter = await CostCenter_1.default.findByIdAndUpdate(id, req.body, { new: true });
        res.json(costCenter);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update cost center' });
    }
};
exports.updateCostCenter = updateCostCenter;
