//path: backend/src/controllers/projectFinanceController.ts
import { Request, Response } from 'express';
import Project from '../models/Project';
import Expense from '../models/finance/Expense';
import Invoice from '../models/finance/Invoice';
import Budget from '../models/finance/Budget';

// Get project finance overview
export const getProjectFinance = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const expenses = await Expense.find({ 
      projectId, 
      status: { $in: ['approved', 'reimbursed'] } 
    }).populate('employeeId', 'firstName lastName');

    const invoices = await Invoice.find({ projectId }).sort({ createdAt: -1 });

    const financeData = {
      budget: project.budget,
      totalExpenses: project.finance?.totalExpenses || 0,
      totalRevenue: project.finance?.totalRevenue || 0,
      profitLoss: project.finance?.profitLoss || 0,
      remainingBudget: project.budget - (project.finance?.totalExpenses || 0),
      expenses: expenses,
      invoices: invoices
    };

    res.json(financeData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project finance data', error });
  }
};

// Create project expense
export const createProjectExpense = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const expenseData = {
      ...req.body,
      projectId,
      sourceModule: 'PMS'
    };

    const expense = new Expense(expenseData);
    await expense.save();
    await expense.populate('employeeId', 'firstName lastName');

    // Update project expense references
    await Project.findByIdAndUpdate(projectId, {
      $push: { 'finance.expenseIds': expense._id }
    });

    // Emit socket event
    const { io } = await import('../server');
    io.emit('project:finance:updated', { projectId, expense });

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: 'Error creating project expense', error });
  }
};

// Update project expense
export const updateProjectExpense = async (req: Request, res: Response) => {
  try {
    const { projectId, expenseId } = req.params;
    
    const expense = await Expense.findOneAndUpdate(
      { _id: expenseId, projectId },
      req.body,
      { new: true, runValidators: true }
    ).populate('employeeId', 'firstName lastName');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Emit socket event
    const { io } = await import('../server');
    io.emit('project:finance:updated', { projectId, expense });

    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: 'Error updating project expense', error });
  }
};

// Delete project expense
export const deleteProjectExpense = async (req: Request, res: Response) => {
  try {
    const { projectId, expenseId } = req.params;
    
    const expense = await Expense.findOneAndDelete({ _id: expenseId, projectId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Remove from project expense references
    await Project.findByIdAndUpdate(projectId, {
      $pull: { 'finance.expenseIds': expenseId }
    });

    // Emit socket event
    const { io } = await import('../server');
    io.emit('project:finance:updated', { projectId, deletedExpenseId: expenseId });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project expense', error });
  }
};

// Update project budget
export const updateProjectBudget = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { budget } = req.body;
    
    const project = await Project.findByIdAndUpdate(
      projectId,
      { budget },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Emit socket event
    const { io } = await import('../server');
    io.emit('project:finance:updated', { projectId, budget });

    res.json({ budget: project.budget });
  } catch (error) {
    res.status(400).json({ message: 'Error updating project budget', error });
  }
};

// Get project financial reports
export const getProjectFinanceReports = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const expenses = await Expense.find({ 
      projectId, 
      status: { $in: ['approved', 'reimbursed'] } 
    }).populate('employeeId', 'firstName lastName');

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Monthly expense breakdown
    const monthlyExpenses = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const reports = {
      summary: {
        budget: project.budget,
        totalExpenses: project.finance?.totalExpenses || 0,
        remainingBudget: project.budget - (project.finance?.totalExpenses || 0),
        budgetUtilization: ((project.finance?.totalExpenses || 0) / project.budget) * 100
      },
      expensesByCategory,
      monthlyExpenses,
      recentExpenses: expenses.slice(-10)
    };

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error generating project finance reports', error });
  }
};