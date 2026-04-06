//path: frontend\src\app\dashboard\page.tsx

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import StatsCards from "@/components/Dashboard/StatsCards";
import SalesChart from "@/components/Dashboard/SalesChart";
import ProductCategoriesChart from "@/components/Dashboard/ProductCategoriesChart";
import InventoryStatus from "@/components/Dashboard/InventoryStatus";
import RecentOrders from "@/components/Dashboard/RecentOrders";
import QuickActions from "@/components/Dashboard/QuickActions";
import OrdersDashboard from "@/components/Dashboard/OrdersDashboard";
import CustomersDashboard from "@/components/Dashboard/CustomersDashboard";
import FinanceDashboard from "@/components/Dashboard/FinanceDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShoppingCart,
  Users,
  BarChart4,
  TrendingUp,
  ShieldCheck,
  UserCog,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  DollarSign
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  getOrderStats,
  getCustomerStats
} from "@/lib/api/index";
import { getInventorySummary, type InventorySummary } from "@/lib/api/inventoryAPI";
import { initializeSocket, getSocket } from "@/lib/socket";
import { useRealTimeDashboard } from "@/hooks/useRealTimeDashboard";

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

interface SalesDataItem {
  name: string;
  sales: number;
  revenue: number;
}

interface ProductDataItem {
  name: string;
  value: number;
}

interface InventoryDataItem {
  name: string;
  value: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customer: { name: string };
  createdAt: string;
  status: string;
  totalAmount: number;
}

const Dashboard = () => {
  const { user, loading, isAuthenticated, hasMinimumRole } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    totalProducts: 0,
    employeeCount: 0,
    activeProjects: 0,
  });

  const {
    stats: realTimeStats,
    events: realTimeEvents,
    lastUpdated: realTimeLastUpdated,
    isConnected: realTimeConnected
  } = useRealTimeDashboard(stats, isAuthenticated);

  const [salesData, setSalesData] = useState<SalesDataItem[]>([]);
  const [productData, setProductData] = useState<ProductDataItem[]>([]);
  const [inventoryData, setInventoryData] = useState<InventoryDataItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef<any>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recentOrdersRef = useRef<RecentOrder[]>([]);

  useEffect(() => {
    recentOrdersRef.current = recentOrders;
  }, [recentOrders]);

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setDataLoading(true);
      setDataError(null);

      const [orderStatsData, customerStatsData] = await Promise.all([
        getOrderStats().catch(err => {
          console.error("Error fetching order stats:", err);
          return null;
        }),
        getCustomerStats().catch(err => {
          console.error("Error fetching customer stats:", err);
          return null;
        })
      ]);

      let inventorySummaryData: InventorySummary | null = null;
      try {
        inventorySummaryData = await getInventorySummary();
      } catch (err) {
        console.error("Error fetching inventory summary:", err);
        inventorySummaryData = null;
      }

      setStats({
        totalOrders: orderStatsData?.totalOrders || 0,
        totalRevenue: orderStatsData?.totalRevenue || 0,
        pendingOrders: orderStatsData?.pendingOrders || 0,
        lowStockItems: inventorySummaryData?.lowStockCount || 0,
        totalCustomers: customerStatsData?.totalCount || 0,
        totalProducts: inventorySummaryData?.totalItems || 0,
        employeeCount: 0,
        activeProjects: 0,
      });

      if (orderStatsData?.monthlySales && Array.isArray(orderStatsData.monthlySales)) {
        setSalesData(orderStatsData.monthlySales.map((item: any) => ({
          name: item.month || 'Unknown',
          sales: item.orderCount || 0,
          revenue: item.revenue || 0
        })));
      }

      if (orderStatsData?.categoryDistribution && Array.isArray(orderStatsData.categoryDistribution)) {
        setProductData(orderStatsData.categoryDistribution.map((item: any) => ({
          name: item.category || 'Unknown',
          value: item.percentage || 0
        })));
      }

      const healthyStock = inventorySummaryData?.healthyStockCount ?? 0;
      const lowStockCount = inventorySummaryData?.lowStockCount ?? 0;
      const outOfStockCount = inventorySummaryData?.outOfStockCount ?? 0;

      setInventoryData([
        { name: 'In Stock', value: healthyStock },
        { name: 'Low Stock', value: lowStockCount },
        { name: 'Out of Stock', value: outOfStockCount },
      ]);

      if (orderStatsData?.recentOrders && Array.isArray(orderStatsData.recentOrders)) {
        setRecentOrders(orderStatsData.recentOrders);
      }

    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setDataError("Failed to load dashboard data. Please try refreshing the page.");
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setDataLoading(false);
      return;
    }

    fetchDashboardData();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, fetchDashboardData]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSalesData([
        { name: 'Jan', sales: 12, revenue: 4200 },
        { name: 'Feb', sales: 19, revenue: 6800 },
        { name: 'Mar', sales: 15, revenue: 5100 },
        { name: 'Apr', sales: 27, revenue: 9250 },
        { name: 'May', sales: 25, revenue: 8600 },
        { name: 'Jun', sales: 30, revenue: 12400 },
      ]);

      setProductData([
        { name: 'Electronics', value: 35 },
        { name: 'Clothing', value: 25 },
        { name: 'Accessories', value: 20 },
        { name: 'Home & Garden', value: 15 },
        { name: 'Other', value: 5 },
      ]);

      setInventoryData([
        { name: 'In Stock', value: 30 },
        { name: 'Low Stock', value: 12 },
        { name: 'Out of Stock', value: 5 },
      ]);

      setRecentOrders([
        { _id: "demo1", orderNumber: "ORD123", customer: { name: "John Doe" }, createdAt: "2024-02-20", status: "Shipped", totalAmount: 199.99 },
        { _id: "demo2", orderNumber: "ORD124", customer: { name: "Alice Smith" }, createdAt: "2024-02-21", status: "Pending", totalAmount: 49.99 },
        { _id: "demo3", orderNumber: "ORD125", customer: { name: "Robert Johnson" }, createdAt: "2024-02-22", status: "Delivered", totalAmount: 129.50 },
      ]);

      setDataLoading(false);
    }
  }, [isAuthenticated]);

  if (loading || !mounted) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <DashboardHeader
          user={user}
          isAuthenticated={isAuthenticated}
          socketConnected={socketConnected}
        />

        {dataError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-center">
              <span>{dataError}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDataError(null);
                  fetchDashboardData();
                }}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isAuthenticated && (
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Welcome to Hisab ERP</h2>
              <p className="text-muted-foreground mb-4">
                Please log in to access your dashboard and view real-time data.
              </p>
              <Button
                onClick={() => router.push("/login")}
                size="lg"
              >
                Login to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <Tabs defaultValue="overview" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
              {mounted && hasMinimumRole(UserRole.ADMIN) && (
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              )}
              {mounted && hasMinimumRole(UserRole.SUPER_ADMIN) && (
                <TabsTrigger value="admin">Admin</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <StatsCards
                stats={realTimeStats}
                isAuthenticated={isAuthenticated}
                loading={dataLoading}
              />

              {isAuthenticated && (
                <>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <SalesChart
                      salesData={salesData}
                      isAuthenticated={isAuthenticated}
                      loading={dataLoading}
                      onRefresh={fetchDashboardData}
                    />
                    <ProductCategoriesChart
                      productData={productData}
                      isAuthenticated={isAuthenticated}
                      loading={dataLoading}
                      onRefresh={fetchDashboardData}
                    />
                  </div>

                  <div className="grid gap-6 lg:grid-cols-4">
                    <div className="lg:col-span-2">
                      <RecentOrders
                        orders={recentOrders}
                        isAuthenticated={isAuthenticated}
                        loading={dataLoading}
                        router={router}
                        onRefresh={fetchDashboardData}
                      />
                    </div>
                  </div>
                </>
              )}

              {!isAuthenticated && (
                <RecentOrders
                  orders={recentOrders}
                  isAuthenticated={isAuthenticated}
                  loading={dataLoading}
                  router={router}
                  onRefresh={fetchDashboardData}
                />
              )}

              <QuickActions
                isAuthenticated={isAuthenticated}
                router={router}
              />
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <OrdersDashboard isAuthenticated={isAuthenticated} />
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
              <InventoryStatus
                inventoryData={inventoryData}
                isAuthenticated={isAuthenticated}
                loading={dataLoading}
                onRefresh={fetchDashboardData}
              />
            </TabsContent>

            <TabsContent value="customers" className="space-y-4">
              <CustomersDashboard isAuthenticated={isAuthenticated} />
            </TabsContent>

            <TabsContent value="finance" className="space-y-4">
              <FinanceDashboard isAuthenticated={isAuthenticated} />
            </TabsContent>

            {mounted && hasMinimumRole(UserRole.ADMIN) && (
              <TabsContent value="analytics" className="space-y-6">
                {isAuthenticated ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BarChart4 className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-medium mb-2">Analytics Dashboard</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Access detailed analytics and business intelligence reports.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <BarChart4 className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-medium mb-2">Analytics Dashboard</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Access detailed analytics and business intelligence reports.
                      </p>
                      <Button
                        onClick={() => router.push("/login")}
                        size="lg"
                      >
                        Login to View Analytics
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}

            {mounted && hasMinimumRole(UserRole.SUPER_ADMIN) && (
              <TabsContent value="admin" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <UserCog className="h-5 w-5 mr-2 text-primary" />
                        User Management
                      </CardTitle>
                      <CardDescription>
                        Manage system users and permissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create, update, and manage user accounts and their access levels.
                      </p>
                      <Button
                        onClick={() => router.push("/dashboard/users")}
                        className="w-full"
                      >
                        Manage Users
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="h-5 w-5 mr-2 text-primary" />
                        System Settings
                      </CardTitle>
                      <CardDescription>
                        Configure global system preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Adjust system-wide settings, notifications, and default behaviors.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/settings")}
                        className="w-full"
                      >
                        System Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;