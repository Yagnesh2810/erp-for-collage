"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitProjectExpenseDeleted = exports.emitProjectExpenseUpdated = exports.emitProjectExpenseCreated = exports.emitProjectBudgetUpdated = exports.emitProjectFinanceUpdated = exports.emitSalesMetricsUpdated = exports.emitFulfillmentTeamAlert = exports.emitPaymentReconciled = exports.emitInvoiceGenerated = exports.emitEmployeeCommissionUpdate = exports.emitProductStatsUpdated = exports.emitCustomerNotification = exports.emitSalesTeamAlert = exports.emitDashboardRefresh = exports.emitProductUpdated = exports.emitContactUpdated = exports.emitSupplierUpdated = exports.emitLoyaltyPointsUpdated = exports.emitCustomerUpdated = exports.emitNewCustomer = exports.emitInventoryReorderAlert = exports.emitLowStockAlert = exports.emitInventoryUpdated = exports.emitOrderCompleted = exports.emitOrderFulfilled = exports.emitOrderDeleted = exports.emitOrderUpdated = exports.emitNewOrder = exports.emitOrderCreated = void 0;
const server_1 = require("../server");
/**
 * Socket Event Emitter Utility Functions
 *
 * These functions can be called from your controllers to emit
 * real-time updates to connected clients
 */
// Order events
const emitOrderCreated = (order) => {
    server_1.io.emit('order:new', order);
};
exports.emitOrderCreated = emitOrderCreated;
const emitNewOrder = (order) => {
    server_1.io.emit('order:new', order);
};
exports.emitNewOrder = emitNewOrder;
const emitOrderUpdated = (order) => {
    server_1.io.emit('order:updated', order);
};
exports.emitOrderUpdated = emitOrderUpdated;
const emitOrderDeleted = (orderId) => {
    server_1.io.emit('order:deleted', { _id: orderId });
};
exports.emitOrderDeleted = emitOrderDeleted;
// New order fulfillment events
const emitOrderFulfilled = (order) => {
    server_1.io.emit('order:fulfilled', order);
};
exports.emitOrderFulfilled = emitOrderFulfilled;
const emitOrderCompleted = (order) => {
    server_1.io.emit('order:completed', order);
};
exports.emitOrderCompleted = emitOrderCompleted;
// Inventory events
const emitInventoryUpdated = (inventory) => {
    server_1.io.emit('inventory:updated', inventory);
};
exports.emitInventoryUpdated = emitInventoryUpdated;
const emitLowStockAlert = (product) => {
    server_1.io.emit('inventory:low-stock', product);
};
exports.emitLowStockAlert = emitLowStockAlert;
// New reorder alert
const emitInventoryReorderAlert = (product) => {
    server_1.io.emit('inventory:reorder-alert', product);
};
exports.emitInventoryReorderAlert = emitInventoryReorderAlert;
// Customer events
const emitNewCustomer = (customer) => {
    server_1.io.emit('customer:new', customer);
};
exports.emitNewCustomer = emitNewCustomer;
const emitCustomerUpdated = (customer) => {
    server_1.io.emit('customer:updated', customer);
};
exports.emitCustomerUpdated = emitCustomerUpdated;
// New loyalty points event
const emitLoyaltyPointsUpdated = (data) => {
    server_1.io.emit(`customer:${data.customerId}:loyalty-updated`, data);
    // Also emit to admin dashboard
    server_1.io.emit('loyalty:points-updated', data);
};
exports.emitLoyaltyPointsUpdated = emitLoyaltyPointsUpdated;
// Supplier events
const emitSupplierUpdated = (supplier) => {
    server_1.io.emit('supplier:updated', supplier);
};
exports.emitSupplierUpdated = emitSupplierUpdated;
// Contact events
const emitContactUpdated = (contact) => {
    server_1.io.emit('contact:updated', contact);
};
exports.emitContactUpdated = emitContactUpdated;
// Product events
const emitProductUpdated = (product) => {
    server_1.io.emit('product:updated', product);
};
exports.emitProductUpdated = emitProductUpdated;
// Dashboard refresh event (force clients to reload dashboard data)
const emitDashboardRefresh = () => {
    server_1.io.emit('dashboard:refresh');
};
exports.emitDashboardRefresh = emitDashboardRefresh;
// Sales team alert for new order
const emitSalesTeamAlert = (order) => {
    server_1.io.emit('sales:newOrder', order);
};
exports.emitSalesTeamAlert = emitSalesTeamAlert;
// Customer notification
const emitCustomerNotification = (customerId, notification) => {
    server_1.io.emit(`customer:${customerId}:notification`, notification);
};
exports.emitCustomerNotification = emitCustomerNotification;
// Product stats updated
const emitProductStatsUpdated = (productId, stats) => {
    server_1.io.emit(`product:${productId}:statsUpdated`, stats);
};
exports.emitProductStatsUpdated = emitProductStatsUpdated;
// Employee commission update
const emitEmployeeCommissionUpdate = (employeeId, commission) => {
    server_1.io.emit(`employee:${employeeId}:commissionUpdate`, commission);
};
exports.emitEmployeeCommissionUpdate = emitEmployeeCommissionUpdate;
// New financial events
const emitInvoiceGenerated = (invoice) => {
    server_1.io.emit('finance:invoice-generated', invoice);
};
exports.emitInvoiceGenerated = emitInvoiceGenerated;
const emitPaymentReconciled = (paymentData) => {
    server_1.io.emit('finance:payment-reconciled', paymentData);
};
exports.emitPaymentReconciled = emitPaymentReconciled;
// Fulfillment team alerts
const emitFulfillmentTeamAlert = (data) => {
    server_1.io.emit('fulfillment:alert', data);
};
exports.emitFulfillmentTeamAlert = emitFulfillmentTeamAlert;
// Analytics events
const emitSalesMetricsUpdated = (metrics) => {
    server_1.io.emit('analytics:sales-metrics-updated', metrics);
};
exports.emitSalesMetricsUpdated = emitSalesMetricsUpdated;
// Project Finance events
const emitProjectFinanceUpdated = (projectId, data) => {
    server_1.io.emit('project:finance:updated', { projectId, ...data });
};
exports.emitProjectFinanceUpdated = emitProjectFinanceUpdated;
const emitProjectBudgetUpdated = (projectId, budget) => {
    server_1.io.emit('project:budget:updated', { projectId, budget });
};
exports.emitProjectBudgetUpdated = emitProjectBudgetUpdated;
const emitProjectExpenseCreated = (projectId, expense) => {
    server_1.io.emit('project:expense:created', { projectId, expense });
};
exports.emitProjectExpenseCreated = emitProjectExpenseCreated;
const emitProjectExpenseUpdated = (projectId, expense) => {
    server_1.io.emit('project:expense:updated', { projectId, expense });
};
exports.emitProjectExpenseUpdated = emitProjectExpenseUpdated;
const emitProjectExpenseDeleted = (projectId, expenseId) => {
    server_1.io.emit('project:expense:deleted', { projectId, expenseId });
};
exports.emitProjectExpenseDeleted = emitProjectExpenseDeleted;
