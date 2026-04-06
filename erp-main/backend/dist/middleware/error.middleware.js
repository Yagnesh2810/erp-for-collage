"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../utils/logger");
const errorMiddleware = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Enhanced logging
    logger_1.logger.error(`Error ${err.message} on ${req.method} ${req.path}`, {
        error: err,
        body: req.body,
        params: req.params,
        query: req.query
    });
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Invalid ID format';
        error = new Error(message);
        error.statusCode = 400;
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        const message = field ? `${field} already exists` : 'Duplicate field value';
        error = new Error(message);
        error.statusCode = 400;
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors || {})
            .map((val) => val.message)
            .join(', ');
        error = new Error(message);
        error.statusCode = 400;
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new Error(message);
        error.statusCode = 401;
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new Error(message);
        error.statusCode = 401;
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.default = errorMiddleware;
