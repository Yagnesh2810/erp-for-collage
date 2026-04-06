"use strict";
/**
 * Utility functions for generating unique numbers for various entities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSubscriptionNumber = exports.generateContractNumber = exports.generateAppointmentNumber = exports.generateTicketNumber = exports.generateBugNumber = exports.generateSprintNumber = exports.generateBatchNumber = exports.generateMachineNumber = exports.generateQCNumber = exports.generateWorkOrderNumber = exports.generateBOMNumber = void 0;
/**
 * Generate BOM Number
 */
const generateBOMNumber = async () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BOM-${year}${month}-${random}`;
};
exports.generateBOMNumber = generateBOMNumber;
/**
 * Generate Work Order Number
 */
const generateWorkOrderNumber = async () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `WO-${year}${month}-${random}`;
};
exports.generateWorkOrderNumber = generateWorkOrderNumber;
/**
 * Generate QC Number
 */
const generateQCNumber = async () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `QC-${year}${month}-${random}`;
};
exports.generateQCNumber = generateQCNumber;
/**
 * Generate Machine Number
 */
const generateMachineNumber = async () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MCH-${year}-${random}`;
};
exports.generateMachineNumber = generateMachineNumber;
/**
 * Generate Batch/Lot Number
 */
const generateBatchNumber = async () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BATCH-${year}${month}${day}-${random}`;
};
exports.generateBatchNumber = generateBatchNumber;
/**
 * Generate Sprint Number
 */
const generateSprintNumber = async () => {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SPR-${random}`;
};
exports.generateSprintNumber = generateSprintNumber;
/**
 * Generate Bug/Ticket Number
 */
const generateBugNumber = async () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `BUG-${year}-${random}`;
};
exports.generateBugNumber = generateBugNumber;
/**
 * Generate Support Ticket Number
 */
const generateTicketNumber = async () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `TKT-${year}${month}-${random}`;
};
exports.generateTicketNumber = generateTicketNumber;
/**
 * Generate Appointment Number
 */
const generateAppointmentNumber = async () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `APT-${year}${month}${day}-${random}`;
};
exports.generateAppointmentNumber = generateAppointmentNumber;
/**
 * Generate Contract Number
 */
const generateContractNumber = async () => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CNT-${year}-${random}`;
};
exports.generateContractNumber = generateContractNumber;
/**
 * Generate Subscription Number
 */
const generateSubscriptionNumber = async () => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `SUB-${year}-${random}`;
};
exports.generateSubscriptionNumber = generateSubscriptionNumber;
