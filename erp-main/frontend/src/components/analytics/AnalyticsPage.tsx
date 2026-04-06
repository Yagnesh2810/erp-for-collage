//path: frontend/src/app/dashboard/analytics/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProductCategoriesChart from "@/components/analytics/ProductCategoriesChart";
import SalesOverTimeChart from "@/components/analytics/SalesOverTimeChart";
import TopSellingProductsChart from "@/components/analytics/TopSellingProductsChart";
import InventoryStatusChart from "@/components/analytics/InventoryStatusChart";
import OrderStatusChart from "@/components/analytics/OrderStatusChart";
import DateRangePicker from "@/components/analytics/DateRangePicker";
import Layout from "../Layout";

export default function AnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  interface SalesDataItem {
    total: number;
    orders: number;
  }

  const [analyticsData, setAnalyticsData] = useState<{
    productCategories: any[];
    salesOverTime: SalesDataItem[];
    topProducts: any[];
    inventoryStatus: any[];
    orderStatus: any[];
  }>({
    productCategories: [],
    salesOverTime: [],
    topProducts: [],
    inventoryStatus: [],
    orderStatus: []
  });
  const [dateRange, setDateRange] = useState({ 
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
    to: new Date() 
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to authenticate
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
          fetchAnalyticsData();
        } else {
          // For development or admin override purposes
          // Comment this section in production if not needed
          console.warn("Authentication failed but proceeding as admin override");
          setIsAuthenticated(true);
          fetchAnalyticsData();
          
          // Uncomment below code for normal authentication flow
          // setIsAuthenticated(false);
          // setError("You must be logged in to view this page");
          // setLoading(false);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        // For admin override, still allow access despite server error
        setIsAuthenticated(true);
        fetchAnalyticsData();
        // setError("Error connecting to the server");
        // setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Format dates for API
      const fromDate = dateRange.from.toISOString().split('T')[0];
      const toDate = dateRange.to.toISOString().split('T')[0];
      
      // Fetch all analytics data
      const [productCategoriesRes, salesOverTimeRes, topProductsRes, inventoryStatusRes, orderStatusRes] = 
        await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/product-categories?from=${fromDate}&to=${toDate}`, {
            credentials: 'include'
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/sales-over-time?from=${fromDate}&to=${toDate}`, {
            credentials: 'include'
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/top-products?from=${fromDate}&to=${toDate}`, {
            credentials: 'include'
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/inventory-status`, {
            credentials: 'include'
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/order-status?from=${fromDate}&to=${toDate}`, {
            credentials: 'include'
          })
        ]);
      
      // Parse all responses
      const [productCategories, salesOverTime, topProducts, inventoryStatus, orderStatus] = 
        await Promise.all([
          productCategoriesRes.json(),
          salesOverTimeRes.json(),
          topProductsRes.json(),
          inventoryStatusRes.json(),
          orderStatusRes.json()
        ]);
      
      setAnalyticsData({
        productCategories: productCategories.data || [],
        salesOverTime: salesOverTime.data || [],
        topProducts: topProducts.data || [],
        inventoryStatus: inventoryStatus.data || [],
        orderStatus: orderStatus.data || []
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to fetch analytics data");
      setLoading(false);
    }
  };

  // Handle date range change - Updated to fix TypeScript error
  const handleDateChange = (value: { from: Date | undefined; to?: Date | undefined }) => {
    if (value.from) {
      setDateRange({ 
        from: value.from, 
        to: value.to || new Date() // Provide a default value if to is undefined
      });
    }
  };

  // When date range changes, fetch new data
  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalyticsData();
    }
  }, [dateRange, isAuthenticated]);

  if (error) {
    return (
        <Layout>
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
        </Layout>
    );
  }

  return (<Layout>
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <DateRangePicker value={dateRange} onChange={handleDateChange} />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Sales</CardTitle>
                  <CardDescription>For selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {loading ? "Loading..." : 
                      `$${analyticsData.salesOverTime.reduce((sum, item) => 
                        sum + (item.total || 0), 0).toLocaleString()}`}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Total Orders</CardTitle>
                  <CardDescription>For selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {loading ? "Loading..." : 
                      analyticsData.salesOverTime.reduce((sum, item) => 
                        sum + (item.orders || 0), 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Avg. Order Value</CardTitle>
                  <CardDescription>For selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {loading ? "Loading..." : (() => {
                      const totalSales = analyticsData.salesOverTime.reduce((sum, item) => 
                        sum + (item.total || 0), 0);
                      const totalOrders = analyticsData.salesOverTime.reduce((sum, item) => 
                        sum + (item.orders || 0), 0);
                      return `$${(totalOrders ? totalSales / totalOrders : 0).toFixed(2)}`;
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 mt-6 md:grid-cols-2">
              <ProductCategoriesChart 
                productData={analyticsData.productCategories}
                isAuthenticated={isAuthenticated}
                loading={loading}
              />
              
              <SalesOverTimeChart 
                salesData={analyticsData.salesOverTime}
                isAuthenticated={isAuthenticated}
                loading={loading}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="sales" className="mt-6">
            <div className="grid gap-6">
              <SalesOverTimeChart 
                salesData={analyticsData.salesOverTime}
                isAuthenticated={isAuthenticated}
                loading={loading}
              />
              <TopSellingProductsChart 
                productsData={analyticsData.topProducts}
                isAuthenticated={isAuthenticated}
                loading={loading}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <ProductCategoriesChart 
                productData={analyticsData.productCategories}
                isAuthenticated={isAuthenticated}
                loading={loading}
              />
              <TopSellingProductsChart 
                productsData={analyticsData.topProducts}
                isAuthenticated={isAuthenticated}
                loading={loading}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="inventory" className="mt-6">
            <InventoryStatusChart 
              inventoryData={analyticsData.inventoryStatus}
              isAuthenticated={isAuthenticated}
              loading={loading}
            />
          </TabsContent>
          
          <TabsContent value="orders" className="mt-6">
            <OrderStatusChart 
              orderData={analyticsData.orderStatus}
              isAuthenticated={isAuthenticated}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </Layout>
  );
}