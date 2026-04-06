"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCashFlowAnalysis = exports.getBudgetVsActual = exports.updateCostCenter = exports.createCostCenter = exports.getCostCenters = exports.getFinancialReports = exports.getFinanceTrail = exports.approveExpense = exports.createProjectExpense = exports.getProjectExpenses = exports.updateBudgetAllocation = exports.createBudgetAllocation = exports.getBudgetAllocations = exports.getProjectFinanceOverview = void 0;
const Project_1 = __importDefault(require("../../models/Project"));
const Expense_1 = __importDefault(require("../../models/finance/Expense"));
const BudgetAllocation_1 = __importDefault(require("../../models/finance/BudgetAllocation"));
const CostCenter_1 = __importDefault(require("../../models/finance/CostCenter"));
const LedgerTransaction_1 = __importDefault(require("../../models/finance/LedgerTransaction"));
const projectFinanceService_1 = require("../../services/finance/projectFinanceService");
// Get project finance overview
const getProjectFinanceOverview = async (req, res) => {
    try {
        const { projectId } = req.params;
        const overview = await projectFinanceService_1.ProjectFinanceService.getFinanceOverview(projectId);
        res.json(overview);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching project finance overview', error });
    }
};
exports.getProjectFinanceOverview = getProjectFinanceOverview;
// Budget Management
const getBudgetAllocations = async (req, res) => {
    try {
        const { projectId } = req.params;
        const allocations = await BudgetAllocation_1.default.find({ projectId })
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.json(allocations);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching budget allocations', error });
    }
};
exports.getBudgetAllocations = getBudgetAllocations;
const createBudgetAllocation = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?.id;
        const allocation = new BudgetAllocation_1.default({
            ...req.body,
            projectId,
            createdBy: userId
        });
        await allocation.save();
        await allocation.populate('createdBy', 'firstName lastName');
        // Update project budget allocations
        await Project_1.default.findByIdAndUpdate(projectId, {
            $push: { 'finance.budgetAllocations': allocation._id }
        });
        // Create journal entry
        await projectFinanceService_1.ProjectFinanceService.createJournalEntry({
            projectId,
            type: 'budget_allocation',
            amount: allocation.allocatedAmount,
            description: `Budget allocation for ${allocation.category}`,
            reference: allocation._id.toString(),
            createdBy: userId
        });
        res.status(201).json(allocation);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating budget allocation', error });
    }
};
exports.createBudgetAllocation = createBudgetAllocation;
const updateBudgetAllocation = async (req, res) => {
    try {
        const { projectId, allocationId } = req.params;
        const allocation = await BudgetAllocation_1.default.findOneAndUpdate({ _id: allocationId, projectId }, req.body, { new: true, runValidators: true }).populate('createdBy', 'firstName lastName');
        if (!allocation) {
            return res.status(404).json({ message: 'Budget allocation not found' });
        }
        res.json(allocation);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating budget allocation', error });
    }
};
exports.updateBudgetAllocation = updateBudgetAllocation;
// Expense Management
const getProjectExpenses = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status, category, startDate, endDate, page = 1, limit = 10 } = req.query;
        const filter = { projectId };
        if (status)
            filter.status = status;
        if (category)
            filter.category = category;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate)
                filter.date.$gte = new Date(startDate);
            if (endDate)
                filter.date.$lte = new Date(endDate);
        }
        const expenses = await Expense_1.default.find(filter)
            .populate('employeeId', 'firstName lastName')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Expense_1.default.countDocuments(filter);
        res.json({
            expenses,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching project expenses', error });
    }
};
exports.getProjectExpenses = getProjectExpenses;
const createProjectExpense = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?.id;
        const expense = new Expense_1.default({
            ...req.body,
            projectId,
            employeeId: req.body.employeeId || userId,
            sourceModule: 'PMS'
        });
        await expense.save();
        await expense.populate('employeeId', 'firstName lastName');
        // Update project expense references
        await Project_1.default.findByIdAndUpdate(projectId, {
            $push: { 'finance.expenseIds': expense._id }
        });
        res.status(201).json(expense);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating project expense', error });
    }
};
exports.createProjectExpense = createProjectExpense;
const approveExpense = async (req, res) => {
    try {
        const { projectId, expenseId } = req.params;
        const { status, comments } = req.body;
        const userId = req.user?.id;
        const expense = await Expense_1.default.findOneAndUpdate({ _id: expenseId, projectId }, {
            status,
            approvedBy: status === 'approved' ? userId : undefined,
            approvedAt: status === 'approved' ? new Date() : undefined,
            comments
        }, { new: true }).populate('employeeId', 'firstName lastName');
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        // Create ledger transaction if approved
        if (status === 'approved') {
            await projectFinanceService_1.ProjectFinanceService.createLedgerTransaction({
                projectId,
                type: 'expense',
                amount: expense.amount,
                description: expense.description,
                category: expense.category,
                reference: expense._id.toString(),
                createdBy: userId
            });
        }
        res.json(expense);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating expense status', error });
    }
};
exports.approveExpense = approveExpense;
// Finance Trail
const getFinanceTrail = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { type, startDate, endDate, page = 1, limit = 20 } = req.query;
        const filter = { projectId };
        if (type)
            filter.type = type;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate)
                filter.date.$gte = new Date(startDate);
            if (endDate)
                filter.date.$lte = new Date(endDate);
        }
        const transactions = await LedgerTransaction_1.default.find(filter)
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await LedgerTransaction_1.default.countDocuments(filter);
        res.json({
            transactions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching finance trail', error });
    }
};
exports.getFinanceTrail = getFinanceTrail;
// Financial Reports
const getFinancialReports = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { reportType = 'summary', period = 'monthly' } = req.query;
        const reports = await projectFinanceService_1.ProjectFinanceService.generateReports(projectId, reportType, period);
        res.json(reports);
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating financial reports', error });
    }
};
exports.getFinancialReports = getFinancialReports;
// Cost Centers
const getCostCenters = async (req, res) => {
    try {
        const { projectId } = req.params;
        const costCenters = await CostCenter_1.default.find({ projectId })
            .populate('manager', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.json(costCenters);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching cost centers', error });
    }
};
exports.getCostCenters = getCostCenters;
const createCostCenter = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user?.id;
        const costCenter = new CostCenter_1.default({
            ...req.body,
            projectId,
            createdBy: userId
        });
        await costCenter.save();
        await costCenter.populate('manager', 'firstName lastName');
        res.status(201).json(costCenter);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating cost center', error });
    }
};
exports.createCostCenter = createCostCenter;
const updateCostCenter = async (req, res) => {
    try {
        const { projectId, costCenterId } = req.params;
        const costCenter = await CostCenter_1.default.findOneAndUpdate({ _id: costCenterId, projectId }, req.body, { new: true, runValidators: true }).populate('manager', 'firstName lastName');
        if (!costCenter) {
            return res.status(404).json({ message: 'Cost center not found' });
        }
        res.json(costCenter);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating cost center', error });
    }
};
exports.updateCostCenter = updateCostCenter;
// Budget vs Actual Analysis
const getBudgetVsActual = async (req, res) => {
    try {
        const { projectId } = req.params;
        const analysis = await projectFinanceService_1.ProjectFinanceService.getBudgetVsActualAnalysis(projectId);
        res.json(analysis);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching budget vs actual analysis', error });
    }
};
exports.getBudgetVsActual = getBudgetVsActual;
// Cash Flow Analysis
const getCashFlowAnalysis = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { period = 'monthly' } = req.query;
        const cashFlow = await projectFinanceService_1.ProjectFinanceService.getCashFlowAnalysis(projectId, period);
        res.json(cashFlow);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching cash flow analysis', error });
    }
};
exports.getCashFlowAnalysis = getCashFlowAnalysis;
