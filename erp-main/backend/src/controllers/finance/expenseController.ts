import { Request, Response } from 'express';
import Expense from '../../models/finance/Expense';
import { logActivity } from '../../utils/activityLogger';

// Get expense summary for a project
export const getExpenseSummary = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const expenses = await Expense.find({ projectId });
    
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const approvedExpenses = expenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0);
    const pendingExpenses = expenses.filter(exp => exp.status === 'submitted').reduce((sum, exp) => sum + exp.amount, 0);
    const rejectedExpenses = expenses.filter(exp => exp.status === 'rejected').reduce((sum, exp) => sum + exp.amount, 0);
    
    const expensesByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const expensesByStatus = {
      draft: expenses.filter(exp => exp.status === 'draft').reduce((sum, exp) => sum + exp.amount, 0),
      submitted: expenses.filter(exp => exp.status === 'submitted').reduce((sum, exp) => sum + exp.amount, 0),
      approved: expenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0),
      rejected: expenses.filter(exp => exp.status === 'rejected').reduce((sum, exp) => sum + exp.amount, 0),
      reimbursed: expenses.filter(exp => exp.status === 'reimbursed').reduce((sum, exp) => sum + exp.amount, 0)
    };

    res.json({
      success: true,
      data: {
        totalExpenses,
        approvedExpenses,
        pendingExpenses,
        rejectedExpenses,
        expensesByCategory,
        expensesByStatus
      }
    });
  } catch (error) {
    console.error('Error getting expense summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get expense summary'
    });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await Expense.find().populate('employeeId approvedBy');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create expense' });
  }
};

export const approveExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    const expense = await Expense.findByIdAndUpdate(id, {
      status: 'approved',
      approvedBy,
      approvedAt: new Date()
    }, { new: true });
    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: 'Failed to approve expense' });
  }
};