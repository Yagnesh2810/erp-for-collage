import { Request, Response, NextFunction } from 'express';

export const validateCostAllocation = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { allocations } = req.body;

    if (!Array.isArray(allocations)) {
      return res.status(400).json({ error: 'Allocations must be an array' });
    }

    // Check total percentage equals 100%
    const totalPercentage = allocations.reduce((sum: number, alloc: any) => sum + (alloc.percentage || 0), 0);
    
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return res.status(400).json({ error: 'Total allocation percentage must equal 100%' });
    }

    // Validate each allocation
    for (const allocation of allocations) {
      if (!allocation.costCenterId || !allocation.percentage) {
        return res.status(400).json({ error: 'Each allocation must have costCenterId and percentage' });
      }
      
      if (allocation.percentage < 0 || allocation.percentage > 100) {
        return res.status(400).json({ error: 'Allocation percentage must be between 0 and 100' });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Cost allocation validation failed' });
  }
};