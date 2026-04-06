import Budget from '../../models/finance/Budget';
import BudgetAllocation from '../../models/finance/BudgetAllocation';
import Account from '../../models/finance/Account';

export class BudgetService {
  static async calculateBudgetVsActual(budgetId: string) {
    const allocations = await BudgetAllocation.find({ budgetId }).populate('accountId');
    
    for (const allocation of allocations) {
      const account = await Account.findById(allocation.accountId);
      if (account) {
        allocation.actualAmount = account.balance;
        allocation.variance = allocation.allocatedAmount - account.balance;
        await allocation.save();
      }
    }
    
    return allocations;
  }

  static async getBudgetUtilization(budgetId: string) {
    const allocations = await BudgetAllocation.find({ budgetId });
    const totalBudget = allocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
    const totalActual = allocations.reduce((sum, alloc) => sum + alloc.actualAmount, 0);
    
    return {
      totalBudget,
      totalActual,
      utilization: (totalActual / totalBudget) * 100,
      variance: totalBudget - totalActual
    };
  }
}