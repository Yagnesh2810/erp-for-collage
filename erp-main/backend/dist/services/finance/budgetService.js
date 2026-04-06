"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetService = void 0;
const BudgetAllocation_1 = __importDefault(require("../../models/finance/BudgetAllocation"));
const Account_1 = __importDefault(require("../../models/finance/Account"));
class BudgetService {
    static async calculateBudgetVsActual(budgetId) {
        const allocations = await BudgetAllocation_1.default.find({ budgetId }).populate('accountId');
        for (const allocation of allocations) {
            const account = await Account_1.default.findById(allocation.accountId);
            if (account) {
                allocation.actualAmount = account.balance;
                allocation.variance = allocation.allocatedAmount - account.balance;
                await allocation.save();
            }
        }
        return allocations;
    }
    static async getBudgetUtilization(budgetId) {
        const allocations = await BudgetAllocation_1.default.find({ budgetId });
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
exports.BudgetService = BudgetService;
