"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerManualBackup = exports.updateBackupSettings = exports.updateNotificationSettings = exports.updateSecuritySettings = exports.updateGeneralSettings = exports.getAdminSettings = exports.getActivityLogs = exports.deleteAdminUser = exports.updateAdminUser = exports.createAdminUser = exports.getAdminUsers = exports.getAdminStats = void 0;
const User_1 = __importDefault(require("../models/User"));
const ActivityLog_1 = __importDefault(require("../models/ActivityLog"));
const AdminSettings_1 = __importDefault(require("../models/AdminSettings"));
const logger_1 = require("../utils/logger");
// Get admin stats
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User_1.default.countDocuments();
        const activeUsers = await User_1.default.countDocuments({ status: 'active' });
        const pendingApprovals = await User_1.default.countDocuments({ status: 'pending' });
        const systemAlerts = await ActivityLog_1.default.countDocuments({ status: 'error' });
        res.json({
            totalUsers,
            activeUsers,
            pendingApprovals,
            systemAlerts
        });
    }
    catch (error) {
        logger_1.logger.error(`Get admin stats error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getAdminStats = getAdminStats;
// Get all users for admin
const getAdminUsers = async (req, res) => {
    try {
        const users = await User_1.default.find().select('-password').populate('roles').sort({ createdAt: -1 });
        const formattedUsers = users.map(user => ({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            roles: user.roles || [],
            status: user.status || 'active',
            lastLogin: user.lastLogin || user.createdAt
        }));
        res.json(formattedUsers);
    }
    catch (error) {
        logger_1.logger.error(`Get admin users error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getAdminUsers = getAdminUsers;
// Create user
const createAdminUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const user = await User_1.default.create({ name, email, password, role });
        // Log activity
        await ActivityLog_1.default.create({
            user: req.user?.name || 'Admin',
            action: 'create',
            resource: 'user',
            status: 'success',
            details: `Created user: ${email}`,
            ipAddress: req.ip || 'unknown'
        });
        res.status(201).json({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status || 'active',
            lastLogin: user.createdAt
        });
    }
    catch (error) {
        logger_1.logger.error(`Create admin user error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.createAdminUser = createAdminUser;
// Update user
const updateAdminUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        const user = await User_1.default.findByIdAndUpdate(userId, updates, { new: true }).populate('roles').select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Log activity
        await ActivityLog_1.default.create({
            user: req.user?.name || 'Admin',
            action: 'update',
            resource: 'user',
            status: 'success',
            details: `Updated user: ${user.email}`,
            ipAddress: req.ip || 'unknown'
        });
        res.json({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            roles: user.roles || [],
            status: user.status || 'active',
            lastLogin: user.lastLogin || user.createdAt
        });
    }
    catch (error) {
        logger_1.logger.error(`Update admin user error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.updateAdminUser = updateAdminUser;
// Delete user
const deleteAdminUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User_1.default.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Log activity
        await ActivityLog_1.default.create({
            user: req.user?.name || 'Admin',
            action: 'delete',
            resource: 'user',
            status: 'success',
            details: `Deleted user: ${user.email}`,
            ipAddress: req.ip || 'unknown'
        });
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        logger_1.logger.error(`Delete admin user error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.deleteAdminUser = deleteAdminUser;
// Get activity logs
const getActivityLogs = async (req, res) => {
    try {
        const { action, status, limit = 100 } = req.query;
        const filter = {};
        if (action && action !== 'all')
            filter.action = action;
        if (status && status !== 'all')
            filter.status = status;
        const logs = await ActivityLog_1.default.find(filter)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));
        const formattedLogs = logs.map(log => ({
            id: log._id.toString(),
            timestamp: log.timestamp.toISOString(),
            user: log.user,
            action: log.action,
            resource: log.resource,
            status: log.status,
            details: log.details,
            ipAddress: log.ipAddress
        }));
        res.json(formattedLogs);
    }
    catch (error) {
        logger_1.logger.error(`Get activity logs error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getActivityLogs = getActivityLogs;
// Get admin settings
const getAdminSettings = async (req, res) => {
    try {
        let settings = await AdminSettings_1.default.findOne();
        if (!settings) {
            // Create default settings
            settings = await AdminSettings_1.default.create({});
        }
        res.json(settings);
    }
    catch (error) {
        logger_1.logger.error(`Get admin settings error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.getAdminSettings = getAdminSettings;
// Update general settings
const updateGeneralSettings = async (req, res) => {
    try {
        const settings = await AdminSettings_1.default.findOneAndUpdate({}, { $set: { general: req.body } }, { new: true, upsert: true });
        await ActivityLog_1.default.create({
            user: req.user?.name || 'Admin',
            action: 'update',
            resource: 'settings',
            status: 'success',
            details: 'Updated general settings',
            ipAddress: req.ip || 'unknown'
        });
        res.json(settings?.general);
    }
    catch (error) {
        logger_1.logger.error(`Update general settings error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.updateGeneralSettings = updateGeneralSettings;
// Update security settings
const updateSecuritySettings = async (req, res) => {
    try {
        const settings = await AdminSettings_1.default.findOneAndUpdate({}, { $set: { security: req.body } }, { new: true, upsert: true });
        await ActivityLog_1.default.create({
            user: req.user?.name || 'Admin',
            action: 'update',
            resource: 'settings',
            status: 'success',
            details: 'Updated security settings',
            ipAddress: req.ip || 'unknown'
        });
        res.json(settings?.security);
    }
    catch (error) {
        logger_1.logger.error(`Update security settings error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.updateSecuritySettings = updateSecuritySettings;
// Update notification settings
const updateNotificationSettings = async (req, res) => {
    try {
        const settings = await AdminSettings_1.default.findOneAndUpdate({}, { $set: { notifications: req.body } }, { new: true, upsert: true });
        await ActivityLog_1.default.create({
            user: req.user?.name || 'Admin',
            action: 'update',
            resource: 'settings',
            status: 'success',
            details: 'Updated notification settings',
            ipAddress: req.ip || 'unknown'
        });
        res.json(settings?.notifications);
    }
    catch (error) {
        logger_1.logger.error(`Update notification settings error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.updateNotificationSettings = updateNotificationSettings;
// Update backup settings
const updateBackupSettings = async (req, res) => {
    try {
        const settings = await AdminSettings_1.default.findOneAndUpdate({}, { $set: { backup: req.body } }, { new: true, upsert: true });
        await ActivityLog_1.default.create({
            user: req.user?.name || 'Admin',
            action: 'update',
            resource: 'settings',
            status: 'success',
            details: 'Updated backup settings',
            ipAddress: req.ip || 'unknown'
        });
        res.json(settings?.backup);
    }
    catch (error) {
        logger_1.logger.error(`Update backup settings error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.updateBackupSettings = updateBackupSettings;
// Trigger manual backup
const triggerManualBackup = async (req, res) => {
    try {
        // Simulate backup process
        const timestamp = new Date().toISOString();
        // Update last backup date in settings
        await AdminSettings_1.default.findOneAndUpdate({}, { $set: { 'backup.lastBackupDate': timestamp } }, { upsert: true });
        await ActivityLog_1.default.create({
            user: req.user?.name || 'Admin',
            action: 'create',
            resource: 'backup',
            status: 'success',
            details: 'Manual backup triggered',
            ipAddress: req.ip || 'unknown'
        });
        res.json({ success: true, timestamp });
    }
    catch (error) {
        logger_1.logger.error(`Trigger manual backup error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};
exports.triggerManualBackup = triggerManualBackup;
