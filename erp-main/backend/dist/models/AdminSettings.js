"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AdminSettingsSchema = new mongoose_1.Schema({
    general: {
        companyName: { type: String, default: 'Your Company' },
        supportEmail: { type: String, default: 'support@company.com' },
        timezone: { type: String, default: 'UTC' },
        dateFormat: { type: String, default: 'YYYY-MM-DD' },
        currency: { type: String, default: 'USD' },
        language: { type: String, default: 'en' }
    },
    security: {
        requireMfa: { type: Boolean, default: false },
        passwordComplexity: { type: String, default: 'medium' },
        sessionTimeout: { type: String, default: '24h' },
        maxLoginAttempts: { type: String, default: '5' },
        allowPasswordReset: { type: Boolean, default: true }
    },
    notifications: {
        emailNotifications: { type: Boolean, default: true },
        systemAlerts: { type: Boolean, default: true },
        userActivityAlerts: { type: Boolean, default: false },
        maintenanceAlerts: { type: Boolean, default: true }
    },
    backup: {
        autoBackup: { type: Boolean, default: true },
        backupFrequency: { type: String, default: 'daily' },
        retentionPeriod: { type: String, default: '30d' },
        lastBackupDate: { type: String, default: () => new Date().toISOString() },
        backupLocation: { type: String, default: 'local' }
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('AdminSettings', AdminSettingsSchema);
