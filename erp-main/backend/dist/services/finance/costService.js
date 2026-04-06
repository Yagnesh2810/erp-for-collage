"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostService = void 0;
const CostCenter_1 = __importDefault(require("../../models/finance/CostCenter"));
class CostService {
    static async allocateCosts(fromCostCenter, allocations) {
        const sourceCenter = await CostCenter_1.default.findById(fromCostCenter);
        if (!sourceCenter)
            throw new Error('Source cost center not found');
        const totalAllocationPercentage = allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
        if (totalAllocationPercentage !== 100) {
            throw new Error('Total allocation percentage must equal 100%');
        }
        for (const allocation of allocations) {
            const targetCenter = await CostCenter_1.default.findById(allocation.costCenterId);
            if (targetCenter) {
                const allocatedAmount = (sourceCenter.actualCosts * allocation.percentage) / 100;
                targetCenter.actualCosts += allocatedAmount;
                targetCenter.variance = targetCenter.budget - targetCenter.actualCosts;
                await targetCenter.save();
            }
        }
        // Reset source center costs after allocation
        sourceCenter.actualCosts = 0;
        sourceCenter.variance = sourceCenter.budget;
        await sourceCenter.save();
    }
    static async calculateCostCenterVariances() {
        const costCenters = await CostCenter_1.default.find({ isActive: true });
        for (const center of costCenters) {
            center.variance = center.budget - center.actualCosts;
            await center.save();
        }
        return costCenters;
    }
}
exports.CostService = CostService;
