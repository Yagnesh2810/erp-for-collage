"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const logger_1 = require("./utils/logger");
const index_1 = __importDefault(require("./routes/index"));
const error_middleware_1 = __importDefault(require("./middleware/error.middleware"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Trust proxy for secure cookies and proxies
app.set("trust proxy", 1);
// Use exact environment variables from .env
const allowedOrigins = [
    process.env.CORS_ORIGIN || "http://localhost:3000",
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3000"
].filter((origin, index, arr) => arr.indexOf(origin) === index); // Remove duplicates
// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            logger_1.logger.warn(`❌ CORS blocked origin: ${origin}`);
            callback(null, true); // Allow all origins in development
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.options("*", (0, cors_1.default)(corsOptions));
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// API Routes
app.use("/api", index_1.default);
// Test API endpoint
app.get("/api/test", (req, res) => {
    res.json({ message: "API is working" });
});
// Socket.IO health check
app.get("/api/socket/health", (req, res) => {
    res.json({
        status: "ok",
        socketConnections: io.engine.clientsCount,
        timestamp: new Date().toISOString()
    });
});
// Error handling middleware
app.use(error_middleware_1.default);
// Socket.IO setup
const io = new socket_io_1.Server(server, {
    cors: {
        origin: (origin, callback) => {
            // Allow all origins to prevent production Socket.IO CORS errors
            callback(null, true);
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        credentials: true,
    },
    path: "/socket.io/",
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
});
exports.io = io;
// Handle socket connections
io.on("connection", (socket) => {
    logger_1.logger.info(`User connected: ${socket.id}`);
    // Handle user authentication and room joining
    socket.on("authenticate", (token) => {
        try {
            if (!token) {
                logger_1.logger.warn("Socket authentication failed: No token provided");
                socket.emit("auth_error", "No token provided");
                return;
            }
            if (!process.env.JWT_SECRET) {
                logger_1.logger.error("JWT_SECRET not configured");
                socket.emit("auth_error", "Server configuration error");
                return;
            }
            logger_1.logger.info(`Attempting to authenticate socket with token: ${token.substring(0, 20)}...`);
            const jwt = require("jsonwebtoken");
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            logger_1.logger.info(`Token decoded successfully for user: ${decoded.id}`);
            // Store user info in socket
            socket.data.userId = decoded.id;
            socket.data.user = decoded;
            // Join user-specific room
            socket.join(`user-${decoded.id}`);
            // Send success response
            socket.emit("authenticated", { userId: decoded.id });
            logger_1.logger.info(`User ${decoded.id} authenticated and joined room`);
        }
        catch (error) {
            logger_1.logger.error("Socket authentication failed:", {
                name: error.name,
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            let errorMessage = "Authentication failed";
            if (error.name === 'JsonWebTokenError') {
                errorMessage = "Invalid token format";
            }
            else if (error.name === 'TokenExpiredError') {
                errorMessage = "Token has expired";
            }
            socket.emit("auth_error", errorMessage);
        }
    });
    socket.on("ping", (data, callback) => {
        if (typeof callback === "function") {
            callback("pong");
        }
        else {
            socket.emit("pong", "pong");
        }
    });
    socket.on("disconnect", () => {
        logger_1.logger.info(`User disconnected: ${socket.id}`);
    });
});
exports.default = app;
// MongoDB connection and server startup
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI;
if (!MONGODB_URI) {
    logger_1.logger.error("❌ MongoDB URI is missing! Check your environment variables.");
    process.exit(1);
}
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    logger_1.logger.info("✅ Connected to MongoDB");
    server.listen(PORT, () => {
        logger_1.logger.info(`🚀 Server running on port ${PORT}`);
        logger_1.logger.info(`👉 Allowed origins: ${JSON.stringify(allowedOrigins)}`);
    });
})
    .catch((error) => {
    logger_1.logger.error("❌ MongoDB connection error:", error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    logger_1.logger.error("Unhandled Promise Rejection:", err);
    if (process.env.NODE_ENV !== "production") {
        process.exit(1);
    }
});
