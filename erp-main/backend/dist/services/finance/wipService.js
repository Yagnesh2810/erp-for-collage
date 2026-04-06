"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WIPService = void 0;
const WorkOrder_1 = __importDefault(require("../../models/finance/WorkOrder"));
class WIPService {
    static async calculateWorkOrderCosts(workOrderId) {
        const workOrder = await WorkOrder_1.default.findById(workOrderId);
        if (!workOrder)
            throw new Error('Work order not found');
        // Calculate total costs
        workOrder.totalCost = workOrder.materialCost + workOrder.laborCost + workOrder.overheadCost;
        await workOrder.save();
        return workOrder;
    }
    static async getWIPValuation() {
        const inProgressOrders = await WorkOrder_1.default.find({ status: 'in_progress' });
        const totalWIP = inProgressOrders.reduce((sum, order) => sum + order.totalCost, 0);
        return {
            totalWIPValue: totalWIP,
            orderCount: inProgressOrders.length,
            orders: inProgressOrders
        };
    }
    static async allocateOverhead(workOrderId, overheadRate, allocationBase) {
        const workOrder = await WorkOrder_1.default.findById(workOrderId);
        if (!workOrder)
            throw new Error('Work order not found');
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
exports.WIPService = WIPService;
