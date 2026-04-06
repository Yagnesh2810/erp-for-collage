"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id || decoded.userId,
            email: decoded.email,
            role: decoded.role || User_1.UserRole.NORMAL
        };
        next();
    }
    catch (error) {
        // For development, allow requests without valid tokens
        if (process.env.NODE_ENV === 'development') {
            req.user = {
                id: '507f1f77bcf86cd799439011',
                email: 'dev@example.com',
                role: User_1.UserRole.ADMIN
            };
            return next();
        }
        res.status(401).json({ error: 'Invalid token.' });
    }
};
exports.auth = auth;
const authorize = (roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: 'Access denied. User not authenticated.' });
        }
        if (!roles.includes(user.role)) {
            return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
        }
        next();
    };
};
exports.authorize = authorize;
