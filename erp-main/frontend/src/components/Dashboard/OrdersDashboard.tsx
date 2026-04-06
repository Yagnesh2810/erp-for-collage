"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ShoppingCart, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Plus,
  Eye,
  DollarSign
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getAllOrders, getOrderStats, type Order } from "@/lib/api/ordersAPI";
import { getSocket } from "@/lib/socket";

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  recentOrders: Order[];
}

interface OrdersDashboardProps {
  isAuthenticated: boolean;
}

const OrdersDashboard: React.FC<OrdersDashboardProps> = ({ isAuthenticated }) => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrdersData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [ordersData, statsData] = await Promise.all([
        getAllOrders({ limit: 10 }),
        getOrderStats()
      ]);

      const ordersArray = Array.isArray(ordersData) ? ordersData : 
                         Array.isArray(ordersData?.orders) ? ordersData.orders : 
                         Array.isArray(ordersData?.data) ? ordersData.data : [];
      setOrders(ordersArray);
      setStats({
        totalOrders: statsData.totalOrders || 0,
        totalRevenue: statsData.totalRevenue || 0,
        pendingOrders: statsData.pendingOrders || 0,
        completedOrders: statsData.completedOrders || 0,
        recentOrders: statsData.recentOrders || ordersArray.slice(0, 5) || []
      });
    } catch (err: any) {
      console.error("Error fetching orders data:", err);
      setError("Failed to load orders data");
      toast({
        title: "Error",
        description: "Failed to load orders data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchOrdersData();
  }, [fetchOrdersData]);

  // Real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (socket) {
      const handleNewOrder = (order: Order) => {
        setOrders(prev => [order, ...prev.slice(0, 9)]);
        setStats(prev => ({
          ...prev,
          totalOrders: prev.totalOrders + 1,
          totalRevenue: prev.totalRevenue + order.totalAmount,
          pendingOrders: order.status === "pending" ? prev.pendingOrders + 1 : prev.pendingOrders,
          recentOrders: [order, ...prev.recentOrders.slice(0, 4)]
        }));
        toast({
          title: "New Order",
          description: `Order #${order.orderNumber} received`,
        });
      };

      const handleOrderUpdated = (order: Order) => {
        setOrders(prev => prev.map(o => o._id === order._id ? order : o));
        setStats(prev => ({
          ...prev,
          recentOrders: prev.recentOrders.map(o => o._id === order._id ? order : o)
        }));
      };

      socket.on("order:new", handleNewOrder);
      socket.on("order:updated", handleOrderUpdated);

      return () => {
        socket.off("order:new", handleNewOrder);
        socket.off("order:updated", handleOrderUpdated);
      };
    }
  }, [isAuthenticated]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "processing": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "shipped": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="theme-card theme-shadow theme-transition">
        <CardContent className="p-8 text-center">
          <ShoppingCart className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2 text-foreground">Order Management</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Please log in to access order management features.
          </p>
          <Button 
            onClick={() => router.push("/login")}
            variant="outline"
            size="lg"
            className="theme-button theme-touch-target theme-focusable theme-transition"
          >
            Login Required
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="theme-card theme-border theme-transition">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex justify-between items-center">
          <span>{error}</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setError(null);
              fetchOrdersData();
            }}
            className="theme-button theme-focusable theme-transition"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="theme-card theme-shadow theme-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                )}
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="theme-card theme-shadow theme-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</p>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="theme-card theme-shadow theme-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                {loading ? (
                  <Skeleton className="h-8 w-12 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.pendingOrders}</p>
                )}
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="theme-card theme-shadow theme-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Orders</p>
                {loading ? (
                  <Skeleton className="h-8 w-12 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.completedOrders}</p>
                )}
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="theme-card theme-shadow theme-transition">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="theme-text">Recent Orders</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrdersData}
              disabled={loading}
              className="theme-button theme-focusable theme-transition"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => router.push("/dashboard/orders/new")}
              size="sm"
              className="theme-button theme-focusable theme-transition"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No orders found</p>
              <Button
                onClick={() => router.push("/dashboard/orders/new")}
                className="mt-4 theme-button theme-focusable theme-transition"
              >
                Create First Order
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 theme-transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-foreground">#{order.orderNumber}</h4>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Customer: {typeof order.customer === 'string' ? order.customer : order.customer?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">${order.totalAmount.toLocaleString()}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                        className="theme-button theme-focusable theme-transition"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {orders.length > 0 && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/orders")}
                className="theme-button theme-focusable theme-transition"
              >
                View All Orders
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersDashboard;