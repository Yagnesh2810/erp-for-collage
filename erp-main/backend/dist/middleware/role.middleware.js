"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authorizeHierarchy = exports.authorize = void 0;
const User_1 = require("../models/User");
// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        // Check if user exists and has a role
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden: No role assigned'
            });
        }
        // Check if user's role is included in the allowed roles
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden: Insufficient permissions'
            });
        }
        // User has the required role, proceed
        next();
    };
};
exports.authorize = authorize;
// Role hierarchy middleware
const authorizeHierarchy = (minimumRole) => {
    return (req, res, next) => {
        // Check if user exists and has a role
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden: No role assigned'
            });
        }
        const roleHierarchy = {
            [User_1.UserRole.ROOT]: 4,
            [User_1.UserRole.SUPER_ADMIN]: 3,
            [User_1.UserRole.ADMIN]: 2,
            [User_1.UserRole.NORMAL]: 1
        };
        const userRoleValue = roleHierarchy[req.user.role];
        const requiredRoleValue = roleHierarchy[minimumRole];
        // Check if user's role is sufficient in the hierarchy
        if (userRoleValue < requiredRoleValue) {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden: Insufficient permissions'
            });
        }
        // User has sufficient role, proceed
        next();
    };
};
exports.authorizeHierarchy = authorizeHierarchy;
// Simple role requirement middleware
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden: No role assigned'
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden: Insufficient permissions'
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
