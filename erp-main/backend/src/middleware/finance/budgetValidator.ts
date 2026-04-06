import { Request, Response, NextFunction } from 'express';
import Budget from '../../models/finance/Budget';

export const validateBudgetRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fiscalYear, totalAmount } = req.body;

    // Check if budget already exists for fiscal year
    const existingBudget = await Budget.findOne({ fiscalYear, status: { $in: ['approved', 'active'] } });
    if (existingBudget) {
      return res.status(400).json({ error: 'Active budget already exists for this fiscal year' });
    }

    // Validate total amount
    if (totalAmount <= 0) {
      return res.status(400).json({ error: 'Budget amount must be greater than zero' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Budget validation failed' });
  }
};