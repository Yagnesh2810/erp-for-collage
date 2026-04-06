import { Request, Response, NextFunction } from 'express';
import FiscalPeriod from '../../models/finance/FiscalPeriod';

export const checkFiscalPeriodOpen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentDate = new Date();
    const activePeriod = await FiscalPeriod.findOne({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    });

    if (!activePeriod) {
      return res.status(400).json({ error: 'No active fiscal period found' });
    }

    if (activePeriod.isClosed) {
      return res.status(400).json({ error: 'Current fiscal period is closed' });
    }

    req.body.fiscalPeriod = activePeriod;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to check fiscal period' });
  }
};