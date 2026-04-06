import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project from '../../models/Project';
import Expense from '../../models/finance/Expense';
import BudgetAllocation from '../../models/finance/BudgetAllocation';
import CostCenter from '../../models/finance/CostCenter';
import LedgerTransaction from '../../models/finance/LedgerTransaction';
import JournalEntry from '../../models/finance/JournalEntry';
import { ProjectFinanceService } from '../../services/finance/projectFinanceService';

// Get project finance overview
export const getProjectFinanceOverview = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    const overview = await ProjectFinanceService.getFinanceOverview(projectId);
    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project finance overview', error });
  }
};

// Budget Management
export const getBudgetAllocations = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    const allocations = await BudgetAllocation.find({ projectId })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budget allocations', error });
  }
};

export const createBudgetAllocation = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    
    const allocation = new BudgetAllocation({
      ...req.body,
      projectId,
      createdBy: userId
    });
    
    await allocation.save();
    await allocation.populate('createdBy', 'firstName lastName');
    
    // Update project budget allocations
    await Project.findByIdAndUpdate(projectId, {
      $push: { 'finance.budgetAllocations': allocation._id }
    });
    
    // Create journal entry
    await ProjectFinanceService.createJournalEntry({
      projectId,
      type: 'budget_allocation',
      amount: allocation.allocatedAmount,
      description: `Budget allocation for ${allocation.category}`,
      reference: allocation._id.toString(),
      createdBy: userId
    });
    
    res.status(201).json(allocation);
  } catch (error) {
    res.status(400).json({ message: 'Error creating budget allocation', error });
  }
};

export const updateBudgetAllocation = async (req: Request, res: Response) => {
  try {
    const { projectId, allocationId } = req.params;
    
    const allocation = await BudgetAllocation.findOneAndUpdate(
      { _id: allocationId, projectId },
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');
    
    if (!allocation) {
      return res.status(404).json({ message: 'Budget allocation not found' });
    }
    
    res.json(allocation);
  } catch (error) {
    res.status(400).json({ message: 'Error updating budget allocation', error });
  }
};

// Expense Management
export const getProjectExpenses = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { status, category, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    const filter: any = { projectId };
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }
    
    const expenses = await Expense.find(filter)
      .populate('employeeId', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Expense.countDocuments(filter);
    
    res.json({
      expenses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project expenses', error });
  }
};

export const createProjectExpense = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    
    const expense = new Expense({
      ...req.body,
      projectId,
      employeeId: req.body.employeeId || userId,
      sourceModule: 'PMS'
    });
    
    await expense.save();
    await expense.populate('employeeId', 'firstName lastName');
    
    // Update project expense references
    await Project.findByIdAndUpdate(projectId, {
      $push: { 'finance.expenseIds': expense._id }
    });
    
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: 'Error creating project expense', error });
  }
};

export const approveExpense = async (req: Request, res: Response) => {
  try {
    const { projectId, expenseId } = req.params;
    const { status, comments } = req.body;
    const userId = req.user?.id;
    
    const expense = await Expense.findOneAndUpdate(
      { _id: expenseId, projectId },
      {
        status,
        approvedBy: status === 'approved' ? userId : undefined,
        approvedAt: status === 'approved' ? new Date() : undefined,
        comments
      },
      { new: true }
    ).populate('employeeId', 'firstName lastName');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Create ledger transaction if approved
    if (status === 'approved') {
      await ProjectFinanceService.createLedgerTransaction({
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
  } catch (error) {
    res.status(400).json({ message: 'Error updating expense status', error });
  }
};

// Finance Trail
export const getFinanceTrail = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { type, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    const filter: any = { projectId };
    
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }
    
    const transactions = await LedgerTransaction.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await LedgerTransaction.countDocuments(filter);
    
    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching finance trail', error });
  }
};

// Financial Reports
export const getFinancialReports = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { reportType = 'summary', period = 'monthly' } = req.query;
    
    const reports = await ProjectFinanceService.generateReports(
      projectId,
      reportType as string,
      period as string
    );
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error generating financial reports', error });
  }
};

// Cost Centers
export const getCostCenters = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    const costCenters = await CostCenter.find({ projectId })
      .populate('manager', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(costCenters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cost centers', error });
  }
};

export const createCostCenter = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    
    const costCenter = new CostCenter({
      ...req.body,
      projectId,
      createdBy: userId
    });
    
    await costCenter.save();
    await costCenter.populate('manager', 'firstName lastName');
    
    res.status(201).json(costCenter);
  } catch (error) {
    res.status(400).json({ message: 'Error creating cost center', error });
  }
};

export const updateCostCenter = async (req: Request, res: Response) => {
  try {
    const { projectId, costCenterId } = req.params;
    
    const costCenter = await CostCenter.findOneAndUpdate(
      { _id: costCenterId, projectId },
      req.body,
      { new: true, runValidators: true }
    ).populate('manager', 'firstName lastName');
    
    if (!costCenter) {
      return res.status(404).json({ message: 'Cost center not found' });
    }
    
    res.json(costCenter);
  } catch (error) {
    res.status(400).json({ message: 'Error updating cost center', error });
  }
};

// Budget vs Actual Analysis
export const getBudgetVsActual = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    const analysis = await ProjectFinanceService.getBudgetVsActualAnalysis(projectId);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching budget vs actual analysis', error });
  }
};

// Cash Flow Analysis
export const getCashFlowAnalysis = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { period = 'monthly' } = req.query;
    
    const cashFlow = await ProjectFinanceService.getCashFlowAnalysis(projectId, period as string);
    res.json(cashFlow);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cash flow analysis', error });
  }
};