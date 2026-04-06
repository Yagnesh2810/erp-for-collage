'use client';

import { useState, useEffect } from 'react';
import { ordersAPI, Order } from '@/lib/api/index';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import  io  from 'socket.io-client';

interface FulfillmentSummary {
  pendingCount: number;
  processingCount: number;
  shippedCount: number;
  fulfilledCount: number;
  completedCount: number;
  cancelledCount: number;
  recentOrders: Order[];
}

const FulfillmentDashboard = () => {
  const [summary, setSummary] = useState<FulfillmentSummary>({
    pendingCount: 0,
    processingCount: 0,
    shippedCount: 0,
    fulfilledCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    recentOrders: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
    }
    
    // Connect to socket
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL);
    setSocket(socketInstance);

    // Listen for real-time updates
    socketInstance.on('order:new', handleOrderUpdate);
    socketInstance.on('order:updated', handleOrderUpdate);
    socketInstance.on('order:fulfilled', handleOrderUpdate);
    socketInstance.on('order:completed', handleOrderUpdate);
    socketInstance.on('dashboard:refresh', fetchSummary);

    // Fetch initial data
    fetchSummary();

    // Cleanup on unmount
    return () => {
      socketInstance.off('order:new', handleOrderUpdate);
      socketInstance.off('order:updated', handleOrderUpdate);
      socketInstance.off('order:fulfilled', handleOrderUpdate);
      socketInstance.off('order:completed', handleOrderUpdate);
      socketInstance.off('dashboard:refresh', fetchSummary);
      socketInstance.disconnect();
    };
  }, []);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      // Get all orders for counting
      const response = await ordersAPI.getAll();
      const orders = response.data || [];

      // Count orders by status
      const pendingCount = orders.filter((order: Order) => order.status === 'pending').length;
      const processingCount = orders.filter((order: Order) => order.status === 'processing').length;
      const shippedCount = orders.filter((order: Order) => order.status === 'shipped').length;
      const fulfilledCount = orders.filter((order: Order) => order.status === 'fulfilled').length;
      const completedCount = orders.filter((order: Order) => order.status === 'completed').length;
      const cancelledCount = orders.filter((order: Order) => order.status === 'cancelled').length;

      // Get most recent orders needing fulfillment
      const recentOrders = orders
        .filter((order: Order) => ['processing', 'shipped'].includes(order.status))
        .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setSummary({
        pendingCount,
        processingCount,
        shippedCount,
        fulfilledCount,
        completedCount,
        cancelledCount,
        recentOrders
      });
    } catch (err) {
      setError('Failed to fetch fulfillment summary');
      toast.error('Failed to fetch fulfillment summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderUpdate = () => {
    // Refresh data when orders are updated
    fetchSummary();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'fulfilled':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
      <h2 className="text-xl font-semibold mb-6">Order Fulfillment Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800">Pending</h3>
          <p className="text-2xl font-bold">{summary.pendingCount}</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Processing</h3>
          <p className="text-2xl font-bold">{summary.processingCount}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Shipped</h3>
          <p className="text-2xl font-bold">{summary.shippedCount}</p>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-indigo-800">Fulfilled</h3>
          <p className="text-2xl font-bold">{summary.fulfilledCount}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Completed</h3>
          <p className="text-2xl font-bold">{summary.completedCount}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">Cancelled</h3>
          <p className="text-2xl font-bold">{summary.cancelledCount}</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Fulfillment Queue</h3>
        <div className="overflow-x-auto">
          {summary.recentOrders.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof order.customer === 'object' ? order.customer.name : 'Customer'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/dashboard/orders/${order._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-4 text-gray-500">No orders in the fulfillment queue.</div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          View All Orders
        </Link>
      </div>
    </div>
  );
};

export default FulfillmentDashboard;