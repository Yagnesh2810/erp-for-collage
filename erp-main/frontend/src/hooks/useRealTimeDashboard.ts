import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/lib/socket';
import { toast } from '@/components/ui/use-toast';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockItems: number;
  totalCustomers: number;
  totalProducts: number;
  employeeCount: number;
  activeProjects: number;
}

interface RealTimeEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export const useRealTimeDashboard = (initialStats: DashboardStats, isAuthenticated: boolean) => {
  const [socket] = useSocket();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Update stats when initial data changes
  useEffect(() => {
    setStats(initialStats);
    setLastUpdated(new Date());
  }, [initialStats]);

  const addEvent = useCallback((type: string, data: any) => {
    const event: RealTimeEvent = {
      type,
      data,
      timestamp: new Date()
    };
    setEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
    setLastUpdated(new Date());
  }, []);

  // Real-time event handlers
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    // Order events
    const handleNewOrder = (order: any) => {
      setStats(prev => ({
        ...prev,
        totalOrders: prev.totalOrders + 1,
        totalRevenue: prev.totalRevenue + (order.totalAmount || 0),
        pendingOrders: order.status === 'pending' ? prev.pendingOrders + 1 : prev.pendingOrders
      }));
      addEvent('order:new', order);
      toast({
        title: "New Order",
        description: `Order #${order.orderNumber} received`,
        variant: "default",
      });
    };

    const handleOrderUpdate = (order: any) => {
      setStats(prev => {
        let pendingChange = 0;
        if (order.previousStatus === 'pending' && order.status !== 'pending') {
          pendingChange = -1;
        } else if (order.previousStatus !== 'pending' && order.status === 'pending') {
          pendingChange = 1;
        }
        
        return {
          ...prev,
          pendingOrders: Math.max(0, prev.pendingOrders + pendingChange)
        };
      });
      addEvent('order:updated', order);
    };

    // Customer events
    const handleNewCustomer = (customer: any) => {
      setStats(prev => ({
        ...prev,
        totalCustomers: prev.totalCustomers + 1
      }));
      addEvent('customer:new', customer);
      toast({
        title: "New Customer",
        description: `${customer.name} joined`,
        variant: "default",
      });
    };

    // Inventory events
    const handleInventoryUpdate = (inventory: any) => {
      addEvent('inventory:updated', inventory);
      if (inventory.status === 'low-stock') {
        toast({
          title: "Low Stock Alert",
          description: `${inventory.productId?.name || 'Product'} is running low`,
          variant: "destructive",
        });
      }
    };

    const handleLowStock = (product: any) => {
      setStats(prev => ({
        ...prev,
        lowStockItems: prev.lowStockItems + 1
      }));
      addEvent('inventory:low-stock', product);
      toast({
        title: "Stock Alert",
        description: `${product.name} needs reordering`,
        variant: "destructive",
      });
    };

    // Employee events
    const handleEmployeeCreated = (employee: any) => {
      setStats(prev => ({
        ...prev,
        employeeCount: prev.employeeCount + 1
      }));
      addEvent('employee:created', employee);
    };

    const handleEmployeeUpdated = (employee: any) => {
      addEvent('employee:updated', employee);
    };

    // Project events
    const handleProjectCreated = (project: any) => {
      setStats(prev => ({
        ...prev,
        activeProjects: prev.activeProjects + 1
      }));
      addEvent('project:created', project);
    };

    const handleProjectUpdated = (project: any) => {
      addEvent('project:updated', project);
    };

    // Analytics events
    const handleAnalyticsUpdate = (data: any) => {
      addEvent('analytics:updated', data);
    };

    // Dashboard refresh
    const handleDashboardRefresh = () => {
      addEvent('dashboard:refresh', {});
      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated",
        variant: "default",
      });
    };

    // Register event listeners
    socket.on('order:new', handleNewOrder);
    socket.on('order:updated', handleOrderUpdate);
    socket.on('customer:new', handleNewCustomer);
    socket.on('inventory:updated', handleInventoryUpdate);
    socket.on('inventory:low-stock', handleLowStock);
    socket.on('employee:created', handleEmployeeCreated);
    socket.on('employee:updated', handleEmployeeUpdated);
    socket.on('project:created', handleProjectCreated);
    socket.on('project:updated', handleProjectUpdated);
    socket.on('analytics:updated', handleAnalyticsUpdate);
    socket.on('dashboard:refresh', handleDashboardRefresh);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:updated', handleOrderUpdate);
      socket.off('customer:new', handleNewCustomer);
      socket.off('inventory:updated', handleInventoryUpdate);
      socket.off('inventory:low-stock', handleLowStock);
      socket.off('employee:created', handleEmployeeCreated);
      socket.off('employee:updated', handleEmployeeUpdated);
      socket.off('project:created', handleProjectCreated);
      socket.off('project:updated', handleProjectUpdated);
      socket.off('analytics:updated', handleAnalyticsUpdate);
      socket.off('dashboard:refresh', handleDashboardRefresh);
    };
  }, [socket, isAuthenticated, addEvent]);

  return {
    stats,
    events,
    lastUpdated,
    isConnected: socket?.connected || false
  };
};