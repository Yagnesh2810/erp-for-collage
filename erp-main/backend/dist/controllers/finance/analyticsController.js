"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMetric = exports.getFinancialRatios = exports.getKPIs = void 0;
const FinanceMetric_1 = __importDefault(require("../../models/finance/FinanceMetric"));
const getKPIs = async (req, res) => {
    try {
        const kpis = await FinanceMetric_1.default.find({ type: 'kpi', isActive: true });
        res.json(kpis);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch KPIs' });
    }
};
exports.getKPIs = getKPIs;
const getFinancialRatios = async (req, res) => {
    try {
        const ratios = await FinanceMetric_1.default.find({ type: 'ratio', isActive: true });
        res.json(ratios);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch financial ratios' });
    }
};
exports.getFinancialRatios = getFinancialRatios;
const createMetric = async (req, res) => {
    try {
        const metric = new FinanceMetric_1.default(req.body);
        await metric.save();
        res.status(201).json(metric);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create metric' });
    }
};
exports.createMetric = createMetric;
