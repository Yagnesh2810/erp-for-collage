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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSetting = exports.bulkUpdateSettings = exports.updateSetting = exports.getSettings = void 0;
const Settings_1 = __importStar(require("../models/Settings"));
const mongoose_1 = __importDefault(require("mongoose"));
// Get settings based on scope and optional identifiers
const getSettings = async (req, res) => {
    try {
        const { scope, key } = req.query;
        const userId = req.user?.id;
        const query = {};
        // Apply filters based on provided parameters
        if (scope) {
            query.scope = scope;
        }
        if (key) {
            query.key = key;
        }
        // For user scope, ensure we're querying the current user's settings
        if (scope === Settings_1.SettingScope.USER && userId) {
            query.userId = userId;
        }
        // Execute the query
        const settings = await Settings_1.default.find(query);
        // Transform into key-value pairs if requested
        if (req.query.format === 'keyValue') {
            const keyValueSettings = settings.reduce((acc, setting) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {});
            return res.status(200).json(keyValueSettings);
        }
        // Return as array by default
        return res.status(200).json(settings);
    }
    catch (error) {
        console.error('Error fetching settings:', error);
        return res.status(500).json({ message: 'Failed to fetch settings' });
    }
};
exports.getSettings = getSettings;
// Update a specific setting
const updateSetting = async (req, res) => {
    try {
        const { key, value, scope } = req.body;
        if (!key || value === undefined || !scope) {
            return res.status(400).json({ message: 'Key, value, and scope are required' });
        }
        const userId = req.user?.id;
        // For user settings, ensure we're updating the current user's settings
        if (scope === Settings_1.SettingScope.USER && !userId) {
            return res.status(401).json({ message: 'User ID is required for user settings' });
        }
        // Prepare the query to find the existing setting
        const query = { key, scope };
        if (scope === Settings_1.SettingScope.USER) {
            query.userId = userId;
        }
        // Update or create the setting
        const updatedSetting = await Settings_1.default.findOneAndUpdate(query, { value, ...query }, { new: true, upsert: true });
        return res.status(200).json(updatedSetting);
    }
    catch (error) {
        console.error('Error updating setting:', error);
        return res.status(500).json({ message: 'Failed to update setting' });
    }
};
exports.updateSetting = updateSetting;
// Bulk update settings
const bulkUpdateSettings = async (req, res) => {
    try {
        const { settings, scope } = req.body;
        if (!settings || !Array.isArray(settings) || !scope) {
            return res.status(400).json({ message: 'Valid settings array and scope are required' });
        }
        const userId = req.user?.id;
        // For user settings, ensure we're updating the current user's settings
        if (scope === Settings_1.SettingScope.USER && !userId) {
            return res.status(401).json({ message: 'User ID is required for user settings' });
        }
        // Start a session for transaction
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const results = [];
            for (const { key, value } of settings) {
                // Prepare the query to find the existing setting
                const query = { key, scope };
                if (scope === Settings_1.SettingScope.USER) {
                    query.userId = userId;
                }
                // Update or create the setting
                const updatedSetting = await Settings_1.default.findOneAndUpdate(query, { value, ...query }, { new: true, upsert: true, session });
                results.push(updatedSetting);
            }
            // Commit the transaction
            await session.commitTransaction();
            return res.status(200).json(results);
        }
        catch (error) {
            // Abort the transaction on error
            await session.abortTransaction();
            throw error;
        }
        finally {
            // End the session
            session.endSession();
        }
    }
    catch (error) {
        console.error('Error bulk updating settings:', error);
        return res.status(500).json({ message: 'Failed to update settings' });
    }
};
exports.bulkUpdateSettings = bulkUpdateSettings;
// Delete a setting
const deleteSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const setting = await Settings_1.default.findById(id);
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        // Ensure users can only delete their own settings
        if (setting.scope === Settings_1.SettingScope.USER && setting.userId?.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this setting' });
        }
        await Settings_1.default.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Setting deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting setting:', error);
        return res.status(500).json({ message: 'Failed to delete setting' });
    }
};
exports.deleteSetting = deleteSetting;
