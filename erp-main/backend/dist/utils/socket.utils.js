"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitNotification = exports.emitLowStockAlert = exports.emitInventoryUpdated = exports.emitOrderUpdated = exports.emitOrderCreated = exports.getConnectedClientsCount = exports.emitToRoom = exports.emitToUser = exports.emitToAll = void 0;
const server_1 = require("../server");
const logger_1 = require("./logger");
// Emit to all connected clients
const emitToAll = (event, data) => {
    try {
        server_1.io.emit(event, data);
        logger_1.logger.info(`📡 Emitted ${event} to all clients`);
    }
    catch (error) {
        logger_1.logger.error(`Failed to emit ${event}:`, error);
    }
};
exports.emitToAll = emitToAll;
// Emit to specific user room
const emitToUser = (userId, event, data) => {
    try {
        server_1.io.to(`user-${userId}`).emit(event, data);
        logger_1.logger.info(`📡 Emitted ${event} to user ${userId}`);
    }
    catch (error) {
        logger_1.logger.error(`Failed to emit ${event} to user ${userId}:`, error);
    }
};
exports.emitToUser = emitToUser;
// Emit to specific room
const emitToRoom = (room, event, data) => {
    try {
        server_1.io.to(room).emit(event, data);
        logger_1.logger.info(`📡 Emitted ${event} to room ${room}`);
    }
    catch (error) {
        logger_1.logger.error(`Failed to emit ${event} to room ${room}:`, error);
    }
};
exports.emitToRoom = emitToRoom;
// Get connected clients count
const getConnectedClientsCount = () => {
    try {
        return server_1.io.engine.clientsCount;
    }
    catch (error) {
        logger_1.logger.error("Failed to get clients count:", error);
        return 0;
    }
};
exports.getConnectedClientsCount = getConnectedClientsCount;
// ERP-specific event emitters
const emitOrderCreated = (orderData) => {
    (0, exports.emitToAll)("order:created", orderData);
};
exports.emitOrderCreated = emitOrderCreated;
const emitOrderUpdated = (orderData) => {
    (0, exports.emitToAll)("order:updated", orderData);
};
exports.emitOrderUpdated = emitOrderUpdated;
const emitInventoryUpdated = (inventoryData) => {
    (0, exports.emitToAll)("inventory:updated", inventoryData);
};
exports.emitInventoryUpdated = emitInventoryUpdated;
const emitLowStockAlert = (stockData) => {
    (0, exports.emitToAll)("inventory:low-stock", stockData);
};
exports.emitLowStockAlert = emitLowStockAlert;
const emitNotification = (userId, notification) => {
    (0, exports.emitToUser)(userId, "notification", notification);
};
exports.emitNotification = emitNotification;
