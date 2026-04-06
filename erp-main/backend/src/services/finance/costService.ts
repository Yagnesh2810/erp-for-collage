import CostCenter from '../../models/finance/CostCenter';

export class CostService {
  static async allocateCosts(fromCostCenter: string, allocations: any[]) {
    const sourceCenter = await CostCenter.findById(fromCostCenter);
    if (!sourceCenter) throw new Error('Source cost center not found');

    const totalAllocationPercentage = allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
    if (totalAllocationPercentage !== 100) {
      throw new Error('Total allocation percentage must equal 100%');
    }

    for (const allocation of allocations) {
      const targetCenter = await CostCenter.findById(allocation.costCenterId);
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
    const costCenters = await CostCenter.find({ isActive: true });
    
    for (const center of costCenters) {
      center.variance = center.budget - center.actualCosts;
      await center.save();
    }
    
    return costCenters;
  }
}