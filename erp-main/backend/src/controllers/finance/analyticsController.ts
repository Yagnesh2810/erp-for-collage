import { Request, Response } from 'express';
import FinanceMetric from '../../models/finance/FinanceMetric';

export const getKPIs = async (req: Request, res: Response) => {
  try {
    const kpis = await FinanceMetric.find({ type: 'kpi', isActive: true });
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
};

export const getFinancialRatios = async (req: Request, res: Response) => {
  try {
    const ratios = await FinanceMetric.find({ type: 'ratio', isActive: true });
    res.json(ratios);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch financial ratios' });
  }
};

export const createMetric = async (req: Request, res: Response) => {
  try {
    const metric = new FinanceMetric(req.body);
    await metric.save();
    res.status(201).json(metric);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create metric' });
  }
};