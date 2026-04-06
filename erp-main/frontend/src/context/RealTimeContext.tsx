//project\frontend\src\context\RealTimeContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSocket, useSocketEvent, OrderCreatedEvent, OrderUpdatedEvent, InventoryUpdatedEvent, NotificationEvent } from '@/lib/socket';
import { useAuth } from '../contexts/AuthContext';

interface RealTimeContextProps {
  isConnected: boolean;
  connectionError: string | null;
  notifications: NotificationEvent[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const RealTimeContext = createContext<RealTimeContextProps>({
  isConnected: false,
  connectionError: null,
  notifications: [],
  markNotificationAsRead: () => {},
  markAllNotificationsAsRead: () => {},
});

export const useRealTime = () => useContext(RealTimeContext);

// Hook for project finance real-time updates
export const useProjectFinanceRealTime = (projectId: string, onUpdate?: () => void) => {
  useSocketEvent('project:finance:updated', (data) => {
    if (data.projectId === projectId && onUpdate) {
      onUpdate();
    }
  });

  useSocketEvent('project:expense:created', (data) => {
    if (data.projectId === projectId && onUpdate) {
      onUpdate();
    }
  });

  useSocketEvent('project:expense:updated', (data) => {
    if (data.projectId === projectId && onUpdate) {
      onUpdate();
    }
  });

  useSocketEvent('project:expense:deleted', (data) => {
    if (data.projectId === projectId && onUpdate) {
      onUpdate();
    }
  });

  useSocketEvent('project:budget:updated', (data) => {
    if (data.projectId === projectId && onUpdate) {
      onUpdate();
    }
  });
};

interface RealTimeProviderProps {
  children: ReactNode;
}

export const RealTimeProvider: React.FC<RealTimeProviderProps> = ({ children }) => {
  const { user, isAuthenticated, token } = useAuth();
  
  const [socket, isConnected, error] = useSocket(token || undefined);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  // Connect to socket when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !user || typeof window === 'undefined') return;
    
    // Load previous notifications from localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch (e) {
        console.error('Failed to parse saved notifications');
      }
    }
  }, [isAuthenticated, user]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Listen for new notifications
  useSocketEvent<NotificationEvent>('notification', (data) => {
    setNotifications(prev => [data, ...prev]);
  });

  // Listen for new orders
  useSocketEvent<OrderCreatedEvent>('order:new', (data) => {
    const notification: NotificationEvent = {
      id: `order-${data._id}`,
      type: 'order_created',
      message: `New order #${data.orderNumber} has been placed by ${data.customer.name}`,
      timestamp: new Date().toISOString(),
      read: false,
      link: `/dashboard/orders/${data._id}`
    };
    
    setNotifications(prev => [notification, ...prev]);
  });

  // Listen for order updates
  useSocketEvent<OrderUpdatedEvent>('order:updated', (data) => {
    const notification: NotificationEvent = {
      id: `order-update-${data._id}-${Date.now()}`,
      type: 'order_updated',
      message: `Order #${data._id} status changed to ${data.status}`,
      timestamp: new Date().toISOString(),
      read: false,
      link: `/dashboard/orders/${data._id}`
    };
    
    setNotifications(prev => [notification, ...prev]);
  });

  // Listen for inventory updates
  useSocketEvent<InventoryUpdatedEvent>('inventory:update', (data) => {
    if (data.status === 'low-stock' || data.status === 'out-of-stock') {
      const notification: NotificationEvent = {
        id: `inventory-${data.productId}-${Date.now()}`,
        type: 'inventory_alert',
        message: data.status === 'low-stock' 
          ? `Product is running low on stock (${data.quantity} remaining)` 
          : 'Product is out of stock!',
        timestamp: new Date().toISOString(),
        read: false,
        link: `/dashboard/inventory`
      };
      
      setNotifications(prev => [notification, ...prev]);
    }
  });

  // Listen for project finance updates
  useSocketEvent('project:finance:updated', (data) => {
    const notification: NotificationEvent = {
      id: `project-finance-${data.projectId}-${Date.now()}`,
      type: 'project_finance_updated',
      message: `Project finance data has been updated`,
      timestamp: new Date().toISOString(),
      read: false,
      link: `/dashboard/projects/${data.projectId}`
    };
    
    setNotifications(prev => [notification, ...prev]);
  });

  // Listen for project expense creation
  useSocketEvent('project:expense:created', (data) => {
    const notification: NotificationEvent = {
      id: `project-expense-${data.projectId}-${Date.now()}`,
      type: 'project_expense_created',
      message: `New expense added to project: $${data.expense.amount}`,
      timestamp: new Date().toISOString(),
      read: false,
      link: `/dashboard/projects/${data.projectId}`
    };
    
    setNotifications(prev => [notification, ...prev]);
  });

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  return (
    <RealTimeContext.Provider
      value={{
        isConnected,
        connectionError: error,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </RealTimeContext.Provider>
  );
};

export default RealTimeContext;