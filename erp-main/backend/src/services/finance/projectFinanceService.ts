import mongoose from 'mongoose';
import Project from '../../models/Project';
import Expense from '../../models/finance/Expense';
import BudgetAllocation from '../../models/finance/BudgetAllocation';
import CostCenter from '../../models/finance/CostCenter';
import LedgerTransaction from '../../models/finance/LedgerTransaction';
import JournalEntry from '../../models/finance/JournalEntry';

export class ProjectFinanceService {

  static async getFinanceOverview(projectId: string) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const [expenses, budgetAllocations, costCenters] = await Promise.all([
      Expense.find({ projectId, status: { $in: ['approved', 'reimbursed'] } }),
      BudgetAllocation.find({ projectId }),
      CostCenter.find({ projectId })
    ]);

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalAllocated = budgetAllocations.reduce((sum, allocation) => sum + allocation.allocatedAmount, 0);
    const totalSpent = budgetAllocations.reduce((sum, allocation) => sum + allocation.spentAmount, 0);

    return {
      totalBudget: project.budget,
      allocatedBudget: totalAllocated,
      spentAmount: totalExpenses,
      remainingBudget: project.budget - totalExpenses,
      totalExpenses,
      totalRevenue: project.finance?.totalRevenue || 0,
      profitLoss: (project.finance?.totalRevenue || 0) - totalExpenses,
      budgetUtilization: project.budget > 0 ? (totalExpenses / project.budget) * 100 : 0,
      costCentersCount: costCenters.length,
      expensesCount: expenses.length
    };
  }

  static async createJournalEntry(data: {
    projectId: string;
    type: string;
    amount: number;
    description: string;
    reference: string;
    createdBy: string;
  }) {
    const journalEntry = new JournalEntry({
      projectId: data.projectId,
      entryType: data.type,
      description: data.description,
      reference: data.reference,
      totalAmount: data.amount,
      entries: [
        {
          accountCode: this.getAccountCode(data.type),
          debit: data.type === 'expense' ? data.amount : 0,
          credit: data.type === 'expense' ? 0 : data.amount,
          description: data.description
        }
      ],
      createdBy: data.createdBy,
      status: 'posted'
    });

    await journalEntry.save();
    return journalEntry;
  }

  static async createLedgerTransaction(data: {
    projectId: string;
    type: string;
    amount: number;
    description: string;
    category: string;
    reference: string;
    createdBy: string;
  }) {
    const transaction = new LedgerTransaction({
      projectId: data.projectId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      category: data.category,
      reference: data.reference,
      accountCode: this.getAccountCode(data.type),
      createdBy: data.createdBy,
      status: 'completed'
    });

    await transaction.save();

    // Update project finance totals
    await this.updateProjectFinanceTotals(data.projectId);

    return transaction;
  }

  static async updateProjectFinanceTotals(projectId: string) {
    const [expenses, revenues] = await Promise.all([
      LedgerTransaction.find({ projectId, type: 'expense', status: 'completed' }),
      LedgerTransaction.find({ projectId, type: 'revenue', status: 'completed' })
    ]);

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalRevenue = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);

    await Project.findByIdAndUpdate(projectId, {
      'finance.totalExpenses': totalExpenses,
      'finance.totalRevenue': totalRevenue,
      'finance.profitLoss': totalRevenue - totalExpenses,
      spentBudget: totalExpenses
    });
  }

  static async generateReports(projectId: string, reportType: string, period: string) {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    switch (reportType) {
      case 'budget-vs-actual':
        return this.getBudgetVsActualReport(projectId, period);
      case 'expense-breakdown':
        return this.getExpenseBreakdownReport(projectId, period);
      case 'cash-flow':
        return this.getCashFlowReport(projectId, period);
      case 'profitability':
        return this.getProfitabilityReport(projectId, period);
      default:
        return this.getSummaryReport(projectId);
    }
  }

  static async getBudgetVsActualAnalysis(projectId: string) {
    const [project, budgetAllocations, expenses] = await Promise.all([
      Project.findById(projectId),
      BudgetAllocation.find({ projectId }),
      Expense.find({ projectId, status: { $in: ['approved', 'reimbursed'] } })
    ]);

    if (!project) {
      throw new Error('Project not found');
    }

    const categoryAnalysis = budgetAllocations.map(allocation => {
      const categoryExpenses = expenses.filter(exp => exp.category === allocation.category);
      const actualSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      return {
        category: allocation.category,
        budgeted: allocation.allocatedAmount,
        actual: actualSpent,
        variance: actualSpent - allocation.allocatedAmount,
        variancePercent: allocation.allocatedAmount > 0 ?
          ((actualSpent - allocation.allocatedAmount) / allocation.allocatedAmount) * 100 : 0
      };
    });

    return {
      overall: {
        totalBudget: project.budget,
        totalSpent: expenses.reduce((sum, exp) => sum + exp.amount, 0),
        variance: expenses.reduce((sum, exp) => sum + exp.amount, 0) - project.budget
      },
      byCategory: categoryAnalysis
    };
  }

  static async getCashFlowAnalysis(projectId: string, period: string) {
    const transactions = await LedgerTransaction.find({ projectId })
      .sort({ createdAt: 1 });

    const groupedData = this.groupTransactionsByPeriod(transactions, period);

    return Object.entries(groupedData).map(([period, transactions]) => {
      const inflow = (transactions as any[])
        .filter(t => t.type === 'revenue')
        .reduce((sum, t) => sum + t.amount, 0);

      const outflow = (transactions as any[])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        period,
        inflow,
        outflow,
        netFlow: inflow - outflow
      };
    });
  }

  private static async getBudgetVsActualReport(projectId: string, period: string) {
    const expenses = await Expense.find({
      projectId,
      status: { $in: ['approved', 'reimbursed'] }
    });

    const budgetAllocations = await BudgetAllocation.find({ projectId });

    const groupedExpenses = this.groupExpensesByPeriod(expenses, period);
    const groupedBudget = this.groupBudgetByPeriod(budgetAllocations, period);

    return Object.keys({ ...groupedExpenses, ...groupedBudget }).map(period => ({
      period,
      budget: groupedBudget[period] || 0,
      actual: groupedExpenses[period] || 0
    }));
  }

  private static async getExpenseBreakdownReport(projectId: string, period: string) {
    const expenses = await Expense.find({
      projectId,
      status: { $in: ['approved', 'reimbursed'] }
    });

    const breakdown = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return Object.entries(breakdown).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    }));
  }

  private static async getCashFlowReport(projectId: string, period: string) {
    return this.getCashFlowAnalysis(projectId, period);
  }

  private static async getProfitabilityReport(projectId: string, period: string) {
    const transactions = await LedgerTransaction.find({ projectId });
    const groupedData = this.groupTransactionsByPeriod(transactions, period);

    return Object.entries(groupedData).map(([period, transactions]) => {
      const revenue = (transactions as any[])
        .filter(t => t.type === 'revenue')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = (transactions as any[])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        period,
        revenue,
        expenses,
        profit: revenue - expenses,
        margin: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0
      };
    });
  }

  private static async getSummaryReport(projectId: string) {
    return this.getFinanceOverview(projectId);
  }

  private static groupExpensesByPeriod(expenses: any[], period: string) {
    return expenses.reduce((acc, expense) => {
      const key = this.getPeriodKey(expense.date, period);
      acc[key] = (acc[key] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private static groupBudgetByPeriod(budgetAllocations: any[], period: string) {
    return budgetAllocations.reduce((acc, allocation) => {
      const key = this.getPeriodKey(allocation.createdAt, period);
      acc[key] = (acc[key] || 0) + allocation.allocatedAmount;
      return acc;
    }, {} as Record<string, number>);
  }

  private static groupTransactionsByPeriod(transactions: any[], period: string) {
    return transactions.reduce((acc, transaction) => {
      const key = this.getPeriodKey(transaction.createdAt, period);
      if (!acc[key]) acc[key] = [];
      acc[key].push(transaction);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private static getPeriodKey(date: Date, period: string): string {
    const d = new Date(date);
    switch (period) {
      case 'daily':
        return d.toISOString().split('T')[0];
      case 'weekly':
        const week = Math.ceil(d.getDate() / 7);
        return `${d.getFullYear()}-${d.getMonth() + 1}-W${week}`;
      case 'monthly':
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      case 'quarterly':
        const quarter = Math.ceil((d.getMonth() + 1) / 3);
        return `${d.getFullYear()}-Q${quarter}`;
      case 'yearly':
        return d.getFullYear().toString();
      default:
        return d.toISOString().split('T')[0];
    }
  }

  private static getAccountCode(type: string): string {
    const accountCodes = {
      'expense': '6000',
      'revenue': '4000',
      'budget_allocation': '1000',
      'transfer': '2000'
    };
    return accountCodes[type as keyof typeof accountCodes] || '9000';
  }
}