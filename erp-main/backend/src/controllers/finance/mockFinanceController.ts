import { Request, Response } from 'express';

// Mock budget overview
export const getBudgetOverview = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    res.json({
      success: true,
      data: {
        totalBudget: 100000,
        spentAmount: 45000,
        remainingBudget: 55000,
        budgetUtilization: 45
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get budget overview'
    });
  }
};

// Mock expense summary
export const getExpenseSummary = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    res.json({
      success: true,
      data: {
        totalExpenses: 25000,
        approvedExpenses: 20000,
        pendingExpenses: 3000,
        rejectedExpenses: 2000,
        expensesByCategory: {
          'Travel': 8000,
          'Equipment': 12000,
          'Software': 5000
        },
        expensesByStatus: {
          draft: 1000,
          submitted: 3000,
          approved: 20000,
          rejected: 2000,
          reimbursed: 18000
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get expense summary'
    });
  }
};

// Mock invoice summary
export const getInvoiceSummary = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    res.json({
      success: true,
      data: {
        totalInvoices: 75000,
        paidInvoices: 60000,
        unpaidInvoices: 15000,
        overdueInvoices: 5000
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get invoice summary'
    });
  }
};

// Mock payment summary
export const getPaymentSummary = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    
    res.json({
      success: true,
      data: {
        totalPayments: 60000,
        pendingPayments: 15000,
        totalIncoming: 75000,
        totalOutgoing: 25000
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get payment summary'
    });
  }
};