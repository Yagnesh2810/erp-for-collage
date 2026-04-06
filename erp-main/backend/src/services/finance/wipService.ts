import WorkOrder from '../../models/finance/WorkOrder';

export class WIPService {
  static async calculateWorkOrderCosts(workOrderId: string) {
    const workOrder = await WorkOrder.findById(workOrderId);
    if (!workOrder) throw new Error('Work order not found');

    // Calculate total costs
    workOrder.totalCost = workOrder.materialCost + workOrder.laborCost + workOrder.overheadCost;
    await workOrder.save();

    return workOrder;
  }

  static async getWIPValuation() {
    const inProgressOrders = await WorkOrder.find({ status: 'in_progress' });
    
    const totalWIP = inProgressOrders.reduce((sum, order) => sum + order.totalCost, 0);
    
    return {
      totalWIPValue: totalWIP,
      orderCount: inProgressOrders.length,
      orders: inProgressOrders
    };
  }

  static async allocateOverhead(workOrderId: string, overheadRate: number, allocationBase: 'labor_hours' | 'machine_hours' | 'material_cost') {
    const workOrder = await WorkOrder.findById(workOrderId);
    if (!workOrder) throw new Error('Work order not found');

    let overheadAmount = 0;
    
    switch (allocationBase) {
      case 'material_cost':
        overheadAmount = workOrder.materialCost * overheadRate;
        break;
      case 'labor_hours':
        // Assuming labor cost represents hours * rate, we'd need labor hours
        overheadAmount = (workOrder.laborCost / 20) * overheadRate; // Assuming $20/hour
        break;
      default:
        overheadAmount = workOrder.materialCost * overheadRate;
    }

    workOrder.overheadCost = overheadAmount;
    workOrder.totalCost = workOrder.materialCost + workOrder.laborCost + workOrder.overheadCost;
    await workOrder.save();

    return workOrder;
  }
}