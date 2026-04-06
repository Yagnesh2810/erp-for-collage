// path: frontend/src/lib/socket.ts
import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Global singleton
let socket: Socket | null = null;
let isConnecting = false;

// Initialize socket with safe singleton + reconnection
export const initializeSocket = (token?: string): Socket | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!API_URL) {
    console.warn("⚠️ NEXT_PUBLIC_API_URL environment variable is not set");
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  if (isConnecting) {
    return socket;
  }

  isConnecting = true;
  console.log(`🔌 Initializing socket connection to: ${API_URL}`);

  // Disconnect existing socket if any
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(API_URL, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
    autoConnect: true,
    path: "/socket.io/",
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket?.id);
    isConnecting = false;

    // Authenticate after connection
    let authToken = token;
    if (!authToken && typeof window !== 'undefined') {
      authToken = localStorage.getItem('auth-token') || undefined;
    }

    if (authToken) {
      console.log("🔐 Attempting socket authentication...");
      socket?.emit("authenticate", authToken);
    }
  });

  socket.on("disconnect", (reason: string) => {
    console.warn("⚠️ Socket disconnected:", reason);
    isConnecting = false;
  });

  socket.on("connect_error", (err: Error) => {
    console.error("❌ Socket connection error:", err.message);
    isConnecting = false;
  });

  socket.on("reconnect", (attemptNumber: number) => {
    console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
  });

  socket.on("reconnect_error", (err: Error) => {
    console.error("❌ Socket reconnection error:", err.message);
  });

  socket.on("reconnect_failed", () => {
    console.error("❌ Socket reconnection failed - max attempts reached");
  });

  socket.on("auth_error", (error: string) => {
    console.error("❌ Socket authentication failed:", error);
    // Clear invalid token if authentication fails
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
    }
  });

  socket.on("authenticated", (data: any) => {
    console.log("✅ Socket authenticated successfully for user:", data?.userId);
  });

  return socket;
};

// Disconnect socket safely
export const disconnectSocket = (): void => {
  if (socket) {
    console.log("🔌 Disconnecting socket...");
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    isConnecting = false;
  }
};

// Get socket instance
export const getSocket = (): Socket | null => socket;

// Hook for socket state
export const useSocket = (
  token?: string
): [Socket | null, boolean, string | null] => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const s = initializeSocket(token);
    if (!s) return;

    const onConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = () => setIsConnected(false);

    const onError = (err: Error) => {
      setIsConnected(false);
      setError(err.message);
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onError);

    setIsConnected(s.connected);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("connect_error", onError);
    };
  }, [token, mounted]);

  return [socket, isConnected, error];
};

// Hook for listening to specific events
export const useSocketEvent = <T>(
  event: string,
  callback: (data: T) => void,
  deps: any[] = []
): void => {
  useEffect(() => {
    if (!socket) return;
    socket.on(event, callback);
    return () => {
      socket?.off(event, callback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, callback, ...deps]);
};

// Ping server
export const pingServer = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!socket || !socket.connected) {
      resolve(false);
      return;
    }

    const timeout = setTimeout(() => {
      resolve(false);
    }, 5000);

    socket.emit("ping", "test", (response: string) => {
      clearTimeout(timeout);
      resolve(response === "pong");
    });
  });
};

// Generic event helpers
export const onSocketEvent = (event: string, cb: (data: any) => void) => {
  if (!socket) initializeSocket();
  socket?.on(event, cb);
  return () => socket?.off(event, cb);
};

export const emitSocketEvent = (event: string, data: any): boolean => {
  if (!socket || !socket.connected) {
    console.warn(`⚠️ Cannot emit ${event}: socket not connected`);
    return false;
  }
  socket.emit(event, data);
  return true;
};

// Join user room for targeted notifications
export const joinUserRoom = (userId: string): void => {
  if (socket && socket.connected && userId) {
    socket.emit("join-user-room", userId);
  }
};

// ---- Event Types (for ERP) ----
export interface OrderCreatedEvent {
  _id: string;
  orderNumber: string;
  customer: { _id: string; name: string };
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface OrderUpdatedEvent {
  _id: string;
  status: string;
  updatedAt: string;
}

export interface InventoryUpdatedEvent {
  productId: { _id: string; name: string; sku: string; price: number; category: string };
  quantity: number;
  status: string;
  _id: string;
  location: string;
}

export interface LowStockEvent {
  productId: { _id: string; name: string; sku: string };
  quantity: number;
  minimumStockLevel: number;
  reorderPoint: number;
}

export interface NotificationEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}
