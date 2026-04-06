/**
 * Utility functions for generating unique numbers for various entities
 */

/**
 * Generate BOM Number
 */
export const generateBOMNumber = async (): Promise<string> => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BOM-${year}${month}-${random}`;
};

/**
 * Generate Work Order Number
 */
export const generateWorkOrderNumber = async (): Promise<string> => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `WO-${year}${month}-${random}`;
};

/**
 * Generate QC Number
 */
export const generateQCNumber = async (): Promise<string> => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `QC-${year}${month}-${random}`;
};

/**
 * Generate Machine Number
 */
export const generateMachineNumber = async (): Promise<string> => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MCH-${year}-${random}`;
};

/**
 * Generate Batch/Lot Number
 */
export const generateBatchNumber = async (): Promise<string> => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BATCH-${year}${month}${day}-${random}`;
};

/**
 * Generate Sprint Number
 */
export const generateSprintNumber = async (): Promise<string> => {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SPR-${random}`;
};

/**
 * Generate Bug/Ticket Number
 */
export const generateBugNumber = async (): Promise<string> => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `BUG-${year}-${random}`;
};

/**
 * Generate Support Ticket Number
 */
export const generateTicketNumber = async (): Promise<string> => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `TKT-${year}${month}-${random}`;
};

/**
 * Generate Appointment Number
 */
export const generateAppointmentNumber = async (): Promise<string> => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `APT-${year}${month}${day}-${random}`;
};

/**
 * Generate Contract Number
 */
export const generateContractNumber = async (): Promise<string> => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CNT-${year}-${random}`;
};

/**
 * Generate Subscription Number
 */
export const generateSubscriptionNumber = async (): Promise<string> => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `SUB-${year}-${random}`;
};
