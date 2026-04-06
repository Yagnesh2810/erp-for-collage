import api from './client';

export interface RealTimeMetrics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalCustomers: number;
  employeeCount: number;
  activeProjects: number;
  lowStockItems: number;
  totalProducts: number;
  timestamp: string;
}

export interface SystemHealth {
  status: string;
  connectedClients: number;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  timestamp: string;
}

/**
 * Get real-time dashboard metrics
 */
export const getRealTimeMetrics = async (): Promise<RealTimeMetrics> => {
  const response = await api.get('/realtime/metrics');
  return response.data.data;
};

/**
 * Trigger dashboard refresh for all connected clients
 */
export const triggerDashboardRefresh = async (): Promise<void> => {
  await api.post('/realtime/refresh');
};

/**
 * Send notification to all clients
 */
export const sendNotification = async (notification: {
  type?: string;
  message: string;
  data?: any;
}): Promise<void> => {
  await api.post('/realtime/notify', notification);
};

/**
 * Get system health status
 */
export const getSystemHealth = async (): Promise<SystemHealth> => {
  const response = await api.get('/realtime/health');
  return response.data.data;
};

export default {
  getRealTimeMetrics,
  triggerDashboardRefresh,
  sendNotification,
  getSystemHealth
};