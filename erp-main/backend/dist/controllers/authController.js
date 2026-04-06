"use strict";
//path: backend/src/controllers/authController.ts
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
exports.logout = exports.checkAuth = exports.getCurrentUser = exports.login = exports.checkInitialSetup = exports.register = void 0;
const User_1 = __importStar(require("../models/User"));
const logger_1 = require("../utils/logger");
// Register a new user
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        // Check if all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }
        // Role assignment logic
        let assignedRole = role || User_1.UserRole.NORMAL;
        // Only ROOT and SUPER_ADMIN can create other ROOT and SUPER_ADMIN users
        if (req.user) {
            if ((assignedRole === User_1.UserRole.ROOT || assignedRole === User_1.UserRole.SUPER_ADMIN) &&
                (req.user.role !== User_1.UserRole.ROOT && req.user.role !== User_1.UserRole.SUPER_ADMIN)) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to create users with this role level'
                });
            }
            // Only ROOT can create other ROOT users
            if (assignedRole === User_1.UserRole.ROOT && req.user.role !== User_1.UserRole.ROOT) {
                return res.status(403).json({
                    success: false,
                    message: 'Only ROOT users can create other ROOT users'
                });
            }
        }
        else {
            // For the first user registration (no users exist yet), allow ROOT creation
            const usersCount = await User_1.default.countDocuments();
            if (usersCount === 0) {
                // First user can be ROOT
                assignedRole = User_1.UserRole.ROOT;
            }
            else {
                // If not authenticated and not first user, default to NORMAL
                assignedRole = User_1.UserRole.NORMAL;
            }
        }
        // Create new user
        const user = await User_1.default.create({
            name,
            email,
            password,
            role: assignedRole
        });
        // Remove password from response
        user.password = undefined;
        logger_1.logger.info(`User registered: ${email} with role: ${assignedRole}`);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user,
        });
    }
    catch (error) {
        logger_1.logger.error(`Registration error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message || 'An error occurred during registration',
        });
    }
};
exports.register = register;
/**
* Check if system requires initial setup (no users exist)
*/
const checkInitialSetup = async (req, res) => {
    try {
        // Check if any users exist in the system
        const usersCount = await User_1.default.countDocuments();
        const isInitialSetup = usersCount === 0;
        res.status(200).json({
            success: true,
            isInitialSetup
        });
    }
    catch (error) {
        logger_1.logger.error(`Check initial setup error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message || 'Error checking initial setup status',
        });
    }
};
exports.checkInitialSetup = checkInitialSetup;
// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        logger_1.logger.info(`Login attempt for email: ${email}`);
        // Check if email and password are provided
        if (!email || !password) {
            logger_1.logger.warn('Login attempt without email or password');
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }
        // Find user by email and include password in the result
        const user = await User_1.default.findOne({ email }).select('+password');
        // Check if user exists
        if (!user) {
            logger_1.logger.warn(`Login attempt for non-existent user: ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Check if password is correct
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            logger_1.logger.warn(`Invalid password for user: ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Generate JWT token
        const token = user.generateAuthToken();
        // Set HTTP-only cookie with the token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
            path: '/'
        });
        // Create clean user object for response (remove password)
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        logger_1.logger.info(`User logged in successfully: ${email} with role: ${user.role}`);
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userResponse,
            token,
        });
    }
    catch (error) {
        logger_1.logger.error(`Login error for ${req.body?.email}: ${error.message}`, error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during login. Please try again.',
        });
    }
};
exports.login = login;
// Get current user (me)
const getCurrentUser = async (req, res) => {
    try {
        // User is already attached to req by the auth middleware
        const user = req.user;
        res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        logger_1.logger.error(`Get current user error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message || 'Error retrieving user information',
        });
    }
};
exports.getCurrentUser = getCurrentUser;
// Check authentication status
const checkAuth = async (req, res) => {
    try {
        // User is already attached to req by the auth middleware
        const user = req.user;
        res.status(200).json({
            success: true,
            authenticated: true,
            user,
        });
    }
    catch (error) {
        logger_1.logger.error(`Check auth error: ${error.message}`);
        res.status(500).json({
            success: false,
            authenticated: false,
            message: error.message || 'Error checking authentication',
        });
    }
};
exports.checkAuth = checkAuth;
// Logout user
const logout = (req, res) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        });
        logger_1.logger.info('User logged out');
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        logger_1.logger.error(`Logout error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message || 'Error during logout',
        });
    }
};
exports.logout = logout;
