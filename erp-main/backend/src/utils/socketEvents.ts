import { io } from '../server';

/**
 * Socket Event Emitter Utility Functions
 * 
 * These functions can be called from your controllers to emit
 * real-time updates to connected clients
 */

// Order events
export const emitOrderCreated = (order: any) => {
  io.emit('order:new', order);
};

export const emitNewOrder = (order: any) => {
  io.emit('order:new', order);
};

export const emitOrderUpdated = (order: any) => {
  io.emit('order:updated', order);
};

export const emitOrderDeleted = (orderId: string) => {
  io.emit('order:deleted', { _id: orderId });
};

// New order fulfillment events
export const emitOrderFulfilled = (order: any) => {
  io.emit('order:fulfilled', order);
};

export const emitOrderCompleted = (order: any) => {
  io.emit('order:completed', order);
};

// Inventory events
export const emitInventoryUpdated = (inventory: any) => {
  io.emit('inventory:updated', inventory);
};

export const emitLowStockAlert = (product: any) => {
  io.emit('inventory:low-stock', product);
};

// New reorder alert
export const emitInventoryReorderAlert = (product: any) => {
  io.emit('inventory:reorder-alert', product);
};

// Customer events
export const emitNewCustomer = (customer: any) => {
  io.emit('customer:new', customer);
};

export const emitCustomerUpdated = (customer: any) => {
  io.emit('customer:updated', customer);
};

// New loyalty points event
export const emitLoyaltyPointsUpdated = (data: any) => {
  io.emit(`customer:${data.customerId}:loyalty-updated`, data);
  // Also emit to admin dashboard
  io.emit('loyalty:points-updated', data);
};

// Supplier events
export const emitSupplierUpdated = (supplier: any) => {
  io.emit('supplier:updated', supplier);
};

// Contact events
export const emitContactUpdated = (contact: any) => {
  io.emit('contact:updated', contact);
};

// Product events
export const emitProductUpdated = (product: any) => {
  io.emit('product:updated', product);
};

// Dashboard refresh event (force clients to reload dashboard data)
export const emitDashboardRefresh = () => {
  io.emit('dashboard:refresh');
};

// Sales team alert for new order
export const emitSalesTeamAlert = (order: any) => {
  io.emit('sales:newOrder', order);
};

// Customer notification
export const emitCustomerNotification = (customerId: string, notification: any) => {
  io.emit(`customer:${customerId}:notification`, notification);
};

// Product stats updated
export const emitProductStatsUpdated = (productId: string, stats: any) => {
  io.emit(`product:${productId}:statsUpdated`, stats);
};

// Employee commission update
export const emitEmployeeCommissionUpdate = (employeeId: string, commission: any) => {
  io.emit(`employee:${employeeId}:commissionUpdate`, commission);
};

// New financial events
export const emitInvoiceGenerated = (invoice: any) => {
  io.emit('finance:invoice-generated', invoice);
};

export const emitPaymentReconciled = (paymentData: any) => {
  io.emit('finance:payment-reconciled', paymentData);
};

// Fulfillment team alerts
export const emitFulfillmentTeamAlert = (data: any) => {
  io.emit('fulfillment:alert', data);
};

// Analytics events
export const emitSalesMetricsUpdated = (metrics: any) => {
  io.emit('analytics:sales-metrics-updated', metrics);
};

// Project Finance events
export const emitProjectFinanceUpdated = (projectId: string, data: any) => {
  io.emit('project:finance:updated', { projectId, ...data });
};

export const emitProjectBudgetUpdated = (projectId: string, budget: number) => {
  io.emit('project:budget:updated', { projectId, budget });
};

export const emitProjectExpenseCreated = (projectId: string, expense: any) => {
  io.emit('project:expense:created', { projectId, expense });
};

export const emitProjectExpenseUpdated = (projectId: string, expense: any) => {
  io.emit('project:expense:updated', { projectId, expense });
};

export const emitProjectExpenseDeleted = (projectId: string, expenseId: string) => {
  io.emit('project:expense:deleted', { projectId, expenseId });
};