import { Request, Response } from 'express';
import CostCenter from '../../models/finance/CostCenter';

export const getCostCenters = async (req: Request, res: Response) => {
  try {
    const costCenters = await CostCenter.find({ isActive: true }).populate('managerId parentId');
    res.json(costCenters);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cost centers' });
  }
};

export const createCostCenter = async (req: Request, res: Response) => {
  try {
    const costCenter = new CostCenter(req.body);
    await costCenter.save();
    res.status(201).json(costCenter);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create cost center' });
  }
};

export const updateCostCenter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const costCenter = await CostCenter.findByIdAndUpdate(id, req.body, { new: true });
    res.json(costCenter);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update cost center' });
  }
};