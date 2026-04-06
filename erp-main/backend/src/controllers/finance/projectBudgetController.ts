import { Request, Response } from 'express';
import ProjectBudget from '../../models/finance/ProjectBudget';
import Expense from '../../models/finance/Expense';
import { logActivity } from '../../utils/activityLogger';

// Get budget overview for a project
export const getBudgetOverview = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const budget = await ProjectBudget.findOne({ projectId });
    
    if (!budget) {
      return res.json({
        success: true,
        data: {
          totalBudget: 0,
          spentAmount: 0,
          remainingBudget: 0,
          budgetUtilization: 0,
          categories: []
        }
      });
    }

    // Get actual expenses to update spent amounts
    const expenses = await Expense.find({ 
      projectId, 
      status: 'approved' 
    });

    // Update spent amounts by category
    budget.categories.forEach(category => {
      const categoryExpenses = expenses.filter(exp => exp.category === category.name);
      category.spentAmount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    });

    // Recalculate totals
    await budget.save();

    res.json({
      success: true,
      data: {
        totalBudget: budget.totalBudget,
        spentAmount: budget.spentAmount,
        remainingBudget: budget.remainingBudget,
        budgetUtilization: budget.budgetUtilization,
        categories: budget.categories
      }
    });
  } catch (error) {
    console.error('Error getting budget overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get budget overview'
    });
  }
};

// Get project budget
export const getProjectBudget = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const budget = await ProjectBudget.findOne({ projectId })
      .populate('createdBy', 'name email');

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Project budget not found'
      });
    }

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    console.error('Error getting project budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project budget'
    });
  }
};

// Create project budget
export const createProjectBudget = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;

    // Check if budget already exists
    const existingBudget = await ProjectBudget.findOne({ projectId });
    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: 'Project budget already exists'
      });
    }

    const budgetData = {
      ...req.body,
      projectId,
      createdBy: userId
    };

    const budget = new ProjectBudget(budgetData);
    await budget.save();

    await logActivity({
      userId,
      action: 'create',
      resource: 'project_budget',
      resourceId: budget._id,
      details: `Created budget for project ${projectId}`,
      metadata: { projectId, totalBudget: budget.totalBudget }
    });

    res.status(201).json({
      success: true,
      data: budget,
      message: 'Project budget created successfully'
    });
  } catch (error) {
    console.error('Error creating project budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project budget'
    });
  }
};

// Update project budget
export const updateProjectBudget = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;

    const budget = await ProjectBudget.findOneAndUpdate(
      { projectId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Project budget not found'
      });
    }

    await logActivity({
      userId,
      action: 'update',
      resource: 'project_budget',
      resourceId: budget._id,
      details: `Updated budget for project ${projectId}`,
      metadata: { projectId, totalBudget: budget.totalBudget }
    });

    res.json({
      success: true,
      data: budget,
      message: 'Project budget updated successfully'
    });
  } catch (error) {
    console.error('Error updating project budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project budget'
    });
  }
};

// Add budget category
export const addBudgetCategory = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;

    const budget = await ProjectBudget.findOne({ projectId });
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Project budget not found'
      });
    }

    const categoryData = {
      ...req.body,
      remainingAmount: req.body.allocatedAmount,
      utilization: 0,
      status: 'active'
    };

    budget.categories.push(categoryData);
    await budget.save();

    await logActivity({
      userId,
      action: 'create',
      resource: 'budget_category',
      resourceId: budget._id,
      details: `Added budget category ${categoryData.name} to project ${projectId}`,
      metadata: { projectId, categoryName: categoryData.name, amount: categoryData.allocatedAmount }
    });

    res.status(201).json({
      success: true,
      data: budget,
      message: 'Budget category added successfully'
    });
  } catch (error) {
    console.error('Error adding budget category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add budget category'
    });
  }
};

// Update budget category
export const updateBudgetCategory = async (req: Request, res: Response) => {
  try {
    const { projectId, categoryId } = req.params;
    const userId = (req as any).user.id;

    const budget = await ProjectBudget.findOne({ projectId });
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Project budget not found'
      });
    }

    const category = budget.categories.find(cat => cat._id?.toString() === categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Budget category not found'
      });
    }

    Object.assign(category, req.body);
    await budget.save();

    await logActivity({
      userId,
      action: 'update',
      resource: 'budget_category',
      resourceId: budget._id,
      details: `Updated budget category ${category.name} in project ${projectId}`,
      metadata: { projectId, categoryName: category.name, amount: category.allocatedAmount }
    });

    res.json({
      success: true,
      data: budget,
      message: 'Budget category updated successfully'
    });
  } catch (error) {
    console.error('Error updating budget category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budget category'
    });
  }
};

// Delete budget category
export const deleteBudgetCategory = async (req: Request, res: Response) => {
  try {
    const { projectId, categoryId } = req.params;
    const userId = (req as any).user.id;

    const budget = await ProjectBudget.findOne({ projectId });
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Project budget not found'
      });
    }

    const categoryIndex = budget.categories.findIndex(cat => cat._id?.toString() === categoryId);
    if (categoryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Budget category not found'
      });
    }

    const categoryName = budget.categories[categoryIndex].name;
    budget.categories.splice(categoryIndex, 1);
    await budget.save();

    await logActivity({
      userId,
      action: 'delete',
      resource: 'budget_category',
      resourceId: budget._id,
      details: `Deleted budget category ${categoryName} from project ${projectId}`,
      metadata: { projectId, categoryName }
    });

    res.json({
      success: true,
      data: budget,
      message: 'Budget category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting budget category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete budget category'
    });
  }
};