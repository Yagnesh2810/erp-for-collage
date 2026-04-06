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
exports.updateUserRole = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = __importStar(require("../models/User"));
const logger_1 = require("../utils/logger");
const socket_utils_1 = require("../utils/socket.utils");
// Get all users (admin access)
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find().select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    }
    catch (error) {
        logger_1.logger.error(`Get all users error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message || 'Error retrieving users'
        });
    }
};
exports.getAllUsers = getAllUsers;
// Get user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            user
        });
    }
    catch (error) {
        logger_1.logger.error(`Get user by ID error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message || 'Error retrieving user'
        });
    }
};
exports.getUserById = getUserById;
// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;
        // Validate role
        if (!Object.values(User_1.UserRole).includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }
        // Get user to update
        const userToUpdate = await User_1.default.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Role update permission checks
        if (req.user) {
            // Cannot update a user with higher role than yourself
            const roleHierarchy = {
                [User_1.UserRole.ROOT]: 4,
                [User_1.UserRole.SUPER_ADMIN]: 3,
                [User_1.UserRole.ADMIN]: 2,
                [User_1.UserRole.NORMAL]: 1
            };
            const currentUserRole = req.user.role;
            const targetUserCurrentRole = userToUpdate.role;
            // Check if trying to update a user with higher or equal role
            if (roleHierarchy[targetUserCurrentRole] >= roleHierarchy[currentUserRole]) {
                return res.status(403).json({
                    success: false,
                    message: 'You cannot modify a user with equal or higher role than yours'
                });
            }
            // Check if trying to assign a role higher than or equal to your own
            if (roleHierarchy[role] >= roleHierarchy[currentUserRole]) {
                return res.status(403).json({
                    success: false,
                    message: 'You cannot assign a role equal to or higher than your own'
                });
            }
            // Only ROOT can assign ROOT role
            if (role === User_1.UserRole.ROOT && req.user.role !== User_1.UserRole.ROOT) {
                return res.status(403).json({
                    success: false,
                    message: 'Only ROOT users can assign ROOT role'
                });
            }
        }
        // Update user role
        const updatedUser = await User_1.default.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        logger_1.logger.info(`Updated role for user ${updatedUser.email} to ${role}`);
        // Emit roleUpdated event to the affected user
        (0, socket_utils_1.emitToUser)(userId, 'roleUpdated', {
            userId: userId,
            newRole: role
        });
        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            user: updatedUser
        });
    }
    catch (error) {
        logger_1.logger.error(`Update user role error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating user role'
        });
    }
};
exports.updateUserRole = updateUserRole;
