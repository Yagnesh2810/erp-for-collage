import { Request, Response } from 'express';
import Order from '../models/Order';
import Customer from '../models/Customer';
import Employee from '../models/Employee';
import Project from '../models/Project';
import Inventory from '../models/Inventory';
import { io } from '../server';

/**
 * Get real-time dashboard metrics
 * @route GET /api/realtime/metrics
 * @access Private
 */
export const getRealTimeMetrics = async (req: Request, res: Response) => {
  try {
    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      totalCustomers,
      employeeCount,
      activeProjects,
      lowStockCount
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      Order.countDocuments({ status: 'pending' }),
      Customer.countDocuments(),
      Employee.countDocuments(),
      Project.countDocuments({ status: { $ne: 'completed' } }),
      Inventory.countDocuments({ quantity: { $lte: 10 } })
    ]);

    const metrics = {
      totalOrders,
      totalRevenue,
      pendingOrders,
      totalCustomers,
      employeeCount,
      activeProjects,
      lowStockItems: lowStockCount,
      totalProducts: await Inventory.countDocuments(),
      timestamp: new Date()
    };

    res.json({ success: true, data: metrics });
  } catch (error) {
    console.error('Error fetching real-time metrics:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Trigger dashboard refresh for all connected clients
 * @route POST /api/realtime/refresh
 * @access Private
 */
export const triggerDashboardRefresh = async (req: Request, res: Response) => {
  try {
    io.emit('dashboard:refresh');
    res.json({ success: true, message: 'Dashboard refresh triggered' });
  } catch (error) {
    console.error('Error triggering dashboard refresh:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Send custom notification to all clients
 * @route POST /api/realtime/notify
 * @access Private
 */
export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { type, message, data } = req.body;
    
    const notification = {
      id: `notification-${Date.now()}`,
      type: type || 'info',
      message: message || 'System notification',
      timestamp: new Date().toISOString(),
      read: false,
      data: data || {}
    };

    io.emit('notification', notification);
    res.json({ success: true, message: 'Notification sent', notification });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get system health status
 * @route GET /api/realtime/health
 * @access Private
 */
export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    const connectedClients = io.engine.clientsCount;
    
    const health = {
      status: 'healthy',
      connectedClients,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date()
    };

    res.json({ success: true, data: health });
  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export default {
  getRealTimeMetrics,
  triggerDashboardRefresh,
  sendNotification,
  getSystemHealth
};