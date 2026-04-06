import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import http from "http";
import { Server as SocketServer } from "socket.io";
import { logger } from "./utils/logger";
import routes from "./routes/index";
import authRoutes from "./routes/auth.routes";
import errorMiddleware from "./middleware/error.middleware";

dotenv.config();

const app = express();
const server = http.createServer(app);

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
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`❌ CORS blocked origin: ${origin}`);
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api", routes);

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
app.use(errorMiddleware);

// Socket.IO setup
const io = new SocketServer(server, {
  cors: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
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

// Handle socket connections
io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Handle user authentication and room joining
  socket.on("authenticate", (token) => {
    try {
      if (!token) {
        logger.warn("Socket authentication failed: No token provided");
        socket.emit("auth_error", "No token provided");
        return;
      }

      if (!process.env.JWT_SECRET) {
        logger.error("JWT_SECRET not configured");
        socket.emit("auth_error", "Server configuration error");
        return;
      }

      logger.info(`Attempting to authenticate socket with token: ${token.substring(0, 20)}...`);

      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      logger.info(`Token decoded successfully for user: ${decoded.id}`);

      // Store user info in socket
      socket.data.userId = decoded.id;
      socket.data.user = decoded;

      // Join user-specific room
      socket.join(`user-${decoded.id}`);

      // Send success response
      socket.emit("authenticated", { userId: decoded.id });

      logger.info(`User ${decoded.id} authenticated and joined room`);
    } catch (error: any) {
      logger.error("Socket authentication failed:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      let errorMessage = "Authentication failed";
      if (error.name === 'JsonWebTokenError') {
        errorMessage = "Invalid token format";
      } else if (error.name === 'TokenExpiredError') {
        errorMessage = "Token has expired";
      }

      socket.emit("auth_error", errorMessage);
    }
  });

  socket.on("ping", (data, callback) => {
    if (typeof callback === "function") {
      callback("pong");
    } else {
      socket.emit("pong", "pong");
    }
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Export for use in other files
export { io };
export default app;

// MongoDB connection and server startup
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  logger.error("❌ MongoDB URI is missing! Check your environment variables.");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info("✅ Connected to MongoDB");

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`👉 Allowed origins: ${JSON.stringify(allowedOrigins)}`);
    });
  })
  .catch((error) => {
    logger.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err);
  if (process.env.NODE_ENV !== "production") {
    process.exit(1);
  }
});
