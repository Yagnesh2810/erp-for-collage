import mongoose from 'mongoose';

export class ProjectFinanceUtils {
  
  // Calculate budget utilization percentage
  static calculateBudgetUtilization(spent: number, budget: number): number {
    if (budget <= 0) return 0;
    return Math.round((spent / budget) * 100);
  }

  // Calculate variance between budgeted and actual amounts
  static calculateVariance(actual: number, budgeted: number): {
    amount: number;
    percentage: number;
    status: 'over' | 'under' | 'on-track';
  } {
    const amount = actual - budgeted;
    const percentage = budgeted > 0 ? (amount / budgeted) * 100 : 0;
    
    let status: 'over' | 'under' | 'on-track' = 'on-track';
    if (Math.abs(percentage) > 5) {
      status = amount > 0 ? 'over' : 'under';
    }

    return {
      amount: Math.round(amount * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      status
    };
  }

  // Calculate burn rate (spending rate per period)
  static calculateBurnRate(expenses: any[], periodDays: number = 30): number {
    if (expenses.length === 0) return 0;
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const oldestExpense = new Date(Math.min(...expenses.map(e => new Date(e.date).getTime())));
    const daysSinceStart = Math.max(1, Math.ceil((Date.now() - oldestExpense.getTime()) / (1000 * 60 * 60 * 24)));
    
    return Math.round((totalExpenses / daysSinceStart) * periodDays * 100) / 100;
  }

  // Calculate project runway (how long budget will last)
  static calculateRunway(remainingBudget: number, burnRate: number): number {
    if (burnRate <= 0) return Infinity;
    return Math.round((remainingBudget / burnRate) * 100) / 100;
  }

  // Calculate ROI (Return on Investment)
  static calculateROI(revenue: number, investment: number): number {
    if (investment <= 0) return 0;
    return Math.round(((revenue - investment) / investment) * 100 * 100) / 100;
  }

  // Calculate profit margin
  static calculateProfitMargin(revenue: number, expenses: number): number {
    if (revenue <= 0) return 0;
    return Math.round(((revenue - expenses) / revenue) * 100 * 100) / 100;
  }

  // Generate account code for different transaction types
  static generateAccountCode(type: string, category?: string): string {
    const codes = {
      'expense': {
        'Development': '6001',
        'Marketing': '6002',
        'Infrastructure': '6003',
        'Operations': '6004',
        'Travel': '6005',
        'Other': '6999'
      },
      'revenue': {
        'Project Revenue': '4001',
        'Consulting': '4002',
        'Other': '4999'
      },
      'budget_allocation': '1001',
      'transfer': '2001'
    };

    if (type === 'expense' || type === 'revenue') {
      return codes[type as keyof typeof codes][category as keyof typeof codes[typeof type]] || 
             codes[type as keyof typeof codes]['Other' as keyof typeof codes[typeof type]];
    }

    return codes[type as keyof typeof codes] as string || '9999';
  }

  // Generate reference number for transactions
  static generateReferenceNumber(type: string, projectId: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const projectCode = projectId.slice(-4).toUpperCase();
    const typeCode = type.substring(0, 3).toUpperCase();
    
    return `${typeCode}-${projectCode}-${timestamp}`;
  }

  // Validate budget allocation
  static validateBudgetAllocation(allocation: any, projectBudget: number, existingAllocations: any[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (allocation.allocatedAmount <= 0) {
      errors.push('Allocated amount must be greater than 0');
    }

    const totalAllocated = existingAllocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
    if (totalAllocated + allocation.allocatedAmount > projectBudget) {
      errors.push('Total allocations cannot exceed project budget');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Calculate cost center efficiency
  static calculateCostCenterEfficiency(costCenter: any): {
    efficiency: number;
    status: 'excellent' | 'good' | 'average' | 'poor';
    recommendations: string[];
  } {
    const utilization = this.calculateBudgetUtilization(costCenter.spent, costCenter.budget);
    const variance = this.calculateVariance(costCenter.spent, costCenter.budget);
    
    let efficiency = 100;
    let status: 'excellent' | 'good' | 'average' | 'poor' = 'excellent';
    const recommendations: string[] = [];

    // Adjust efficiency based on utilization and variance
    if (utilization > 100) {
      efficiency -= (utilization - 100) * 0.5;
      recommendations.push('Review budget allocation - overspending detected');
    }

    if (Math.abs(variance.percentage) > 20) {
      efficiency -= Math.abs(variance.percentage) * 0.3;
      recommendations.push('Improve budget planning accuracy');
    }

    // Determine status
    if (efficiency >= 90) status = 'excellent';
    else if (efficiency >= 75) status = 'good';
    else if (efficiency >= 60) status = 'average';
    else status = 'poor';

    if (status === 'poor') {
      recommendations.push('Consider restructuring cost center management');
    }

    return {
      efficiency: Math.max(0, Math.round(efficiency)),
      status,
      recommendations
    };
  }

  // Format currency for display
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Calculate financial health score
  static calculateFinancialHealthScore(project: any): {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    factors: any[];
  } {
    let score = 100;
    const factors = [];

    // Budget utilization factor (30% weight)
    const utilization = this.calculateBudgetUtilization(project.spentBudget || 0, project.budget);
    let utilizationScore = 100;
    if (utilization > 90) {
      utilizationScore = Math.max(0, 100 - (utilization - 90) * 5);
      factors.push({ factor: 'Budget Utilization', impact: 'negative', description: 'High budget utilization' });
    } else if (utilization < 50) {
      utilizationScore = 50 + utilization;
      factors.push({ factor: 'Budget Utilization', impact: 'neutral', description: 'Low budget utilization' });
    }
    score = score * 0.7 + utilizationScore * 0.3;

    // Profit/Loss factor (40% weight)
    const profitLoss = project.finance?.profitLoss || 0;
    let profitScore = 100;
    if (profitLoss < 0) {
      profitScore = Math.max(0, 100 + (profitLoss / project.budget) * 100);
      factors.push({ factor: 'Profitability', impact: 'negative', description: 'Project showing losses' });
    } else {
      factors.push({ factor: 'Profitability', impact: 'positive', description: 'Project is profitable' });
    }
    score = score * 0.6 + profitScore * 0.4;

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return {
      score: Math.round(score),
      grade,
      factors
    };
  }
}