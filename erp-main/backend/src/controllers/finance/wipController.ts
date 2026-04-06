import { Request, Response } from 'express';
import WorkOrder from '../../models/finance/WorkOrder';

export const getWorkOrders = async (req: Request, res: Response) => {
  try {
    const workOrders = await WorkOrder.find().populate('productId');
    res.json(workOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
};

export const createWorkOrder = async (req: Request, res: Response) => {
  try {
    const workOrder = new WorkOrder(req.body);
    await workOrder.save();
    res.status(201).json(workOrder);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create work order' });
  }
};

export const updateWorkOrderCosts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { materialCost, laborCost, overheadCost } = req.body;
    const totalCost = materialCost + laborCost + overheadCost;
    
    const workOrder = await WorkOrder.findByIdAndUpdate(id, {
      materialCost,
      laborCost,
      overheadCost,
      totalCost
    }, { new: true });
    
    res.json(workOrder);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update work order costs' });
  }
};