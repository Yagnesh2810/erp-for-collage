import { Request, Response } from 'express';
import Budget from '../../models/finance/Budget';
import BudgetAllocation from '../../models/finance/BudgetAllocation';

export const getBudgets = async (req: Request, res: Response) => {
  try {
    const budgets = await Budget.find().populate('createdBy approvedBy');
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
};

export const createBudget = async (req: Request, res: Response) => {
  try {
    const budget = new Budget(req.body);
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create budget' });
  }
};

export const getBudgetAllocations = async (req: Request, res: Response) => {
  try {
    const { budgetId } = req.params;
    const allocations = await BudgetAllocation.find({ budgetId }).populate('accountId costCenterId');
    res.json(allocations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget allocations' });
  }
};