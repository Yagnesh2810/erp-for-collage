import { Request, Response, NextFunction } from 'express';
import Expense from '../../models/finance/Expense';

export const checkExpenseApprovalRights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id).populate('employeeId');
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Check if expense is in submittable status
    if (expense.status !== 'submitted') {
      return res.status(400).json({ error: 'Expense is not in submitted status' });
    }

    // Add expense to request for controller use
    req.body.expense = expense;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Expense approval validation failed' });
  }
};