//project\frontend\src\app\dashboard\orders\page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { ordersAPI } from '@/lib/api/index';

interface Product {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
}

interface Order {
  _id: string;
  customer: Customer;
  products: Product[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  search: string;
  status: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const OrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    dateRange: {
      startDate: '',
      endDate: ''
    },
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Debug logging
  useEffect(() => {
    console.log("Auth token exists:", !!localStorage.getItem("auth-token"));
    console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log("Fetching orders...");
        const response = await ordersAPI.getAll();
        console.log("Raw API response:", response);
        
        if (response && response.data) {
          const orderData = Array.isArray(response.data) ? response.data : [];
          setOrders(orderData);
          setFilteredOrders(orderData);
          calculateOrderStats(orderData);
        } else if (Array.isArray(response)) {
          setOrders(response);
          setFilteredOrders(response);
          calculateOrderStats(response);
        } else {
          console.error("Unexpected response structure:", response);
          setError('Unexpected API response format');
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error details:", err);
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Calculate order statistics
  const calculateOrderStats = (orderData: Order[]) => {
    const stats = {
      total: orderData.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orderData.forEach(order => {
      if (stats.hasOwnProperty(order.status)) {
        stats[order.status as keyof typeof stats] += 1;
      }
    });

    setOrderStats(stats);
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...orders];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(order => 
        order._id.toLowerCase().includes(searchLower) ||
        order.customer.name.toLowerCase().includes(searchLower) ||
        order.customer.email.toLowerCase().includes(searchLower) ||
        order.shippingAddress.city.toLowerCase().includes(searchLower) ||
        order.shippingAddress.country.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter(order => order.status === filters.status);
    }

    // Apply date filter
    if (filters.dateRange.startDate) {
      const startDate = new Date(filters.dateRange.startDate);
      result = result.filter(order => new Date(order.createdAt) >= startDate);
    }

    if (filters.dateRange.endDate) {
      const endDate = new Date(filters.dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      result = result.filter(order => new Date(order.createdAt) <= endDate);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'customerName':
          aValue = a.customer.name;
          bValue = b.customer.name;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(result);
  }, [orders, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startDate' || name === 'endDate') {
      setFilters({
        ...filters,
        dateRange: {
          ...filters.dateRange,
          [name]: value
        }
      });
    } else {
      setFilters({
        ...filters,
        [name]: value
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      dateRange: {
        startDate: '',
        endDate: ''
      },
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const statusColors = {
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    shipped: 'bg-purple-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500',
  };

  const exportToCSV = () => {
    // Prepare the CSV data
    const headers = ['Order ID', 'Customer', 'Email', 'Date', 'Status', 'Total Amount'];
    const csvRows = [headers];

    filteredOrders.forEach(order => {
      const row = [
        order._id,
        order.customer.name,
        order.customer.email,
        new Date(order.createdAt).toLocaleDateString(),
        order.status,
        order.totalAmount.toFixed(2)
      ];
      csvRows.push(row);
    });

    // Convert to CSV format
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (        
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>     
      </Layout>
    );
  }

  if (error) {
    return (      
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-red-100 p-4 rounded-md">
            <p className="text-red-800">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>       
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
            <Link 
              href="/dashboard/orders/new" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Order
            </Link>
          </div>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Total', value: orderStats.total },
            { label: 'Pending', value: orderStats.pending, color: statusColors.pending },
            { label: 'Processing', value: orderStats.processing, color: statusColors.processing },
            { label: 'Shipped', value: orderStats.shipped, color: statusColors.shipped },
            { label: 'Delivered', value: orderStats.delivered, color: statusColors.delivered },
            { label: 'Cancelled', value: orderStats.cancelled, color: statusColors.cancelled },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className="bg-card p-4 rounded-lg shadow-sm border border-border"
            >
              {stat.color ? (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
              )}
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters Section */}
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2 text-foreground">Filters & Sorting</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Search</label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by ID, customer, location..."
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">From Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.dateRange.startDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">To Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.dateRange.endDate}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm text-muted-foreground mb-1">Sort By</label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="createdAt">Date</option>
                  <option value="totalAmount">Amount</option>
                  <option value="status">Status</option>
                  <option value="customerName">Customer</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-muted-foreground mb-1">Order</label>
                <select
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2 flex items-end justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-border bg-background text-foreground rounded-md hover:bg-muted"
              >
                Reset Filters
              </button>
            </div>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Amount</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-muted transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-foreground">
                        {order._id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-foreground">{order.customer.name}</div>
                        <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-foreground">${order.totalAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/orders/${order._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link
                          href={`/dashboard/orders/${order._id}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrdersPage;
