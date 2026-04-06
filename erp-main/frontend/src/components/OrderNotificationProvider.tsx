'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { Bell, CheckCircle, Package, TruckIcon, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define more specific types for better type safety
interface NotificationData {
  orderId?: string;
  orderNumber?: string;
  productId?: string;
  productName?: string;
  quantity?: number;
  reorderPoint?: number;
  urgent?: boolean;
  [key: string]: any; // Allow for additional properties
}

interface Notification {
  id: string;
  type: 'fulfillment' | 'completion' | 'inventory' | 'alert' | string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: NotificationData;
}

const OrderNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [socket, setSocket] = useState<any>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize socket URL to prevent unnecessary re-renders
  const socketUrl = useMemo(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is not configured');
    }
    return process.env.NEXT_PUBLIC_API_URL;
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.notification-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Add notification handler with useCallback to prevent recreation on re-renders
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      // Check if notification with same ID already exists
      if (prev.some(n => n.id === notification.id)) {
        return prev;
      }
      return [notification, ...prev].slice(0, 100); // Keep max 100 notifications
    });
  }, []);

  // Socket connection and event handlers
  useEffect(() => {
    setIsLoading(true);
    
    try {
      if (!socketUrl) {
        throw new Error('Socket URL is not configured');
      }

      const socketInstance = io(socketUrl, {
        reconnectionAttempts: 5,
        timeout: 10000,
      });
      
      socketInstance.on('connect', () => {
        setIsLoading(false);
        setError(null);
      });
      
      socketInstance.on('connect_error', (err: Error) => {
        setIsLoading(false);
        setError(`Failed to connect to notification service: ${err.message}`);
        console.error('Socket connection error:', err);
      });
      
      setSocket(socketInstance);

      // Event handlers
      const eventHandlers = {
        'order:fulfilled': handleOrderFulfilled,
        'order:completed': handleOrderCompleted,
        'inventory:reorder-alert': handleReorderAlert,
        'inventory:low-stock': handleLowStockAlert,
        'fulfillment:alert': handleFulfillmentAlert
      };
      
      // Register all event handlers
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        socketInstance.on(event, handler);
      });
      
      // Cleanup on unmount
      return () => {
        Object.entries(eventHandlers).forEach(([event, handler]) => {
          socketInstance.off(event, handler);
        });
        socketInstance.disconnect();
      };
    } catch (err) {
      setIsLoading(false);
      setError('Failed to initialize notification service');
      console.error('Socket initialization error:', err);
      return () => {}; // Return empty cleanup function
    }
  }, [socketUrl]);

  // Calculate unread count whenever notifications change
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Handle various notification types
  const handleOrderFulfilled = useCallback((order: any) => {
    if (!order?._id || !order?.orderNumber) {
      console.warn('Received invalid order data for fulfillment notification', order);
      return;
    }
    
    const notification: Notification = {
      id: `fulfill-${order._id}-${Date.now()}`,
      type: 'fulfillment',
      title: 'Order Fulfilled',
      message: `Order ${order.orderNumber} has been fulfilled and is ready for shipment.`,
      timestamp: new Date(),
      read: false,
      data: { orderId: order._id, orderNumber: order.orderNumber }
    };
    
    addNotification(notification);
    
    // Also show toast
    toast.success(`Order ${order.orderNumber} fulfilled`, {
      icon: '📦',
      duration: 5000
    });
  }, [addNotification]);

  const handleOrderCompleted = useCallback((order: any) => {
    if (!order?._id || !order?.orderNumber) {
      console.warn('Received invalid order data for completion notification', order);
      return;
    }
    
    const notification: Notification = {
      id: `complete-${order._id}-${Date.now()}`,
      type: 'completion',
      title: 'Order Completed',
      message: `Order ${order.orderNumber} has been completed successfully.`,
      timestamp: new Date(),
      read: false,
      data: { orderId: order._id, orderNumber: order.orderNumber }
    };
    
    addNotification(notification);
    
    // Also show toast
    toast.success(`Order ${order.orderNumber} completed`, {
      icon: '✅',
      duration: 5000
    });
  }, [addNotification]);

  const handleReorderAlert = useCallback((product: any) => {
    if (!product?._id || !product?.productId?.name) {
      console.warn('Received invalid product data for reorder alert', product);
      return;
    }
    
    const notification: Notification = {
      id: `reorder-${product._id}-${Date.now()}`,
      type: 'inventory',
      title: 'Reorder Alert',
      message: `Inventory for ${product.productId.name} has reached the reorder point. Please restock.`,
      timestamp: new Date(),
      read: false,
      data: { 
        productId: product.productId._id,
        productName: product.productId.name,
        quantity: product.quantity,
        reorderPoint: product.reorderPoint
      }
    };
    
    addNotification(notification);
    
    // Also show toast for urgent alerts
    toast.error(`Low stock: ${product.productId.name}`, {
      icon: '⚠️',
      duration: 7000
    });
  }, [addNotification]);

  const handleLowStockAlert = useCallback((product: any) => {
    if (!product?._id || !product?.productId?.name) {
      console.warn('Received invalid product data for low stock alert', product);
      return;
    }
    
    const notification: Notification = {
      id: `lowstock-${product._id}-${Date.now()}`,
      type: 'inventory',
      title: 'Low Stock Alert',
      message: `Inventory for ${product.productId.name} is running low.`,
      timestamp: new Date(),
      read: false,
      data: { 
        productId: product.productId._id,
        productName: product.productId.name,
        quantity: product.quantity
      }
    };
    
    addNotification(notification);
  }, [addNotification]);

  const handleFulfillmentAlert = useCallback((data: any) => {
    if (!data?.message) {
      console.warn('Received invalid data for fulfillment alert', data);
      return;
    }
    
    const notification: Notification = {
      id: `alert-${Date.now()}`,
      type: 'alert',
      title: data.title || 'Fulfillment Alert',
      message: data.message,
      timestamp: new Date(),
      read: false,
      data: data
    };
    
    addNotification(notification);
    
    // Show toast for urgent alerts
    if (data.urgent) {
      toast(data.message, {
        icon: '🔔',
        duration: 5000
      });
    }
  }, [addNotification]);

  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Remove a single notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Notification Icon based on type
  const getNotificationIcon = useCallback((type: string) => {
    switch (type) {
      case 'fulfillment':
        return <Package className="h-5 w-5 text-indigo-500" />;
      case 'completion':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inventory':
        return <TruckIcon className="h-5 w-5 text-orange-500" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  }, []);

  // Format timestamp
  const formatTimestamp = useCallback((date: Date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    
    // If it's today, just show the time
    if (now.toDateString() === notificationDate.toDateString()) {
      return notificationDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // If it's yesterday, show "Yesterday" and time
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === notificationDate.toDateString()) {
      return `Yesterday, ${notificationDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })}`;
    }
    
    // Otherwise show date and time
    return notificationDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: Notification[] } = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.timestamp);
      const dateKey = date.toDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(notification);
    });
    
    return groups;
  }, [notifications]);

  // Format date for group headers
  const formatGroupDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  return (
    <div className="notification-container relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[1.25rem] h-5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg z-50 overflow-hidden border border-gray-200">
          <div className="p-3 bg-gray-100 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <div
                  onClick={markAllAsRead}
                  className="text-xs h-7 px-2 rounded hover:bg-gray-200 transition-colors cursor-pointer flex items-center"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      markAllAsRead();
                    }
                  }}
                >
                  Mark all as read
                </div>
              )}
              {notifications.length > 0 && (
                <div
                  onClick={clearNotifications}
                  className="text-xs h-7 px-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors cursor-pointer flex items-center"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      clearNotifications();
                    }
                  }}
                >
                  Clear all
                </div>
              )}
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                Connecting to notification service...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No notifications</p>
                <p className="text-xs mt-1 text-gray-400">New notifications will appear here</p>
              </div>
            ) : (
              <div>
                {Object.entries(groupedNotifications).map(([dateKey, dateNotifications]) => (
                  <div key={dateKey}>
                    <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 border-b border-t">
                      {formatGroupDate(dateKey)}
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {dateNotifications.map((notification) => (
                        <li 
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 transition-colors duration-150 ${notification.read ? 'opacity-70' : 'bg-blue-50'}`}
                        >
                          <div className="flex items-start group">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div 
                              className="ml-3 flex-1 cursor-pointer" 
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp)}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                            </div>
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="ml-2 h-6 w-6 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center cursor-pointer"
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeNotification(notification.id);
                                }
                              }}
                              aria-label="Remove notification"
                            >
                              <X className="h-3 w-3" />
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderNotification;