'use client';

import { useState, useEffect } from 'react';
import { ordersAPI, Order } from '@/lib/api/index';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import  io  from 'socket.io-client';

interface CompletionMetrics {
  totalCompletedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalLoyaltyPointsAwarded: number;
  completedToday: number;
  completedThisWeek: number;
  completedThisMonth: number;
  recentlyCompletedOrders: Order[];
}

const OrderCompletionDashboard = () => {
  const [metrics, setMetrics] = useState<CompletionMetrics>({
    totalCompletedOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalLoyaltyPointsAwarded: 0,
    completedToday: 0,
    completedThisWeek: 0,
    completedThisMonth: 0,
    recentlyCompletedOrders: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      setError('API URL not configured');
      return;
    }
    // Connect to socket
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL as string);
    setSocket(socketInstance);

    // Listen for real-time updates
    socketInstance.on('order:completed', handleOrderUpdate);
    socketInstance.on('dashboard:refresh', fetchMetrics);

    // Fetch initial data
    fetchMetrics();

    // Cleanup on unmount
    return () => {
      socketInstance.off('order:completed', handleOrderUpdate);
      socketInstance.off('dashboard:refresh', fetchMetrics);
      socketInstance.disconnect();
    };
  }, []);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      // Get all orders
      const response = await ordersAPI.getAll();
      const allOrders = response.data || [];
      
      // Filter completed orders
      const completedOrders = allOrders.filter((order: Order) => order.status === 'completed');
      
      // Calculate metrics
      const totalCompletedOrders = completedOrders.length;
      const totalRevenue = completedOrders.reduce((sum: number, order: Order) => sum + order.totalAmount, 0);
      const averageOrderValue = totalCompletedOrders > 0 ? totalRevenue / totalCompletedOrders : 0;
      
      // Calculate loyalty points
      const totalLoyaltyPointsAwarded = completedOrders.reduce((sum: number, order: Order) => {
        return sum + (order.loyaltyUpdate?.pointsEarned || 0);
      }, 0);
      
      // Date-based calculations
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const completedToday = completedOrders.filter((order: Order) => 
        new Date(order.completionDate || order.updatedAt) >= today
      ).length;
      
      const completedThisWeek = completedOrders.filter((order: Order) => 
        new Date(order.completionDate || order.updatedAt) >= startOfWeek
      ).length;
      
      const completedThisMonth = completedOrders.filter((order: Order) => 
        new Date(order.completionDate || order.updatedAt) >= startOfMonth
      ).length;
      
      // Get most recently completed orders
      const recentlyCompletedOrders = completedOrders
        .sort((a: Order, b: Order) => {
          const dateA = new Date(a.completionDate || a.updatedAt).getTime();
          const dateB = new Date(b.completionDate || b.updatedAt).getTime();
          return dateB - dateA;
        })
        .slice(0, 5);
      
      setMetrics({
        totalCompletedOrders,
        totalRevenue,
        averageOrderValue,
        totalLoyaltyPointsAwarded,
        completedToday,
        completedThisWeek,
        completedThisMonth,
        recentlyCompletedOrders
      });
    } catch (err) {
      setError('Failed to fetch completion metrics');
      toast.error('Failed to fetch completion metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderUpdate = () => {
    // Refresh data when orders are completed
    fetchMetrics();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-md">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Order Completion Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Total Completed</h3>
          <p className="text-2xl font-bold">{metrics.totalCompletedOrders}</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Revenue</h3>
          <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Avg. Order Value</h3>
          <p className="text-2xl font-bold">{formatCurrency(metrics.averageOrderValue)}</p>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-indigo-800">Loyalty Points</h3>
          <p className="text-2xl font-bold">{metrics.totalLoyaltyPointsAwarded}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-medium text-green-800">Today</h3>
          <p className="text-xl font-bold">{metrics.completedToday}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-medium text-green-800">This Week</h3>
          <p className="text-xl font-bold">{metrics.completedThisWeek}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-medium text-green-800">This Month</h3>
          <p className="text-xl font-bold">{metrics.completedThisMonth}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Recently Completed Orders</h3>
        <div className="overflow-x-auto">
          {metrics.recentlyCompletedOrders.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.recentlyCompletedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.completionDate || order.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof order.customer === 'object' ? order.customer.name : 'Customer'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.loyaltyUpdate?.pointsEarned || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/dashboard/orders/${order._id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-4 text-gray-500">No completed orders yet.</div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/dashboard/orders?status=completed"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
        >
          View All Completed Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderCompletionDashboard;