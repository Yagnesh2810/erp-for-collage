//path: frontend\src\components\Dashboard\InventoryStatus.tsx
'use client';

import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, AlertTriangle, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Fixed interface to ensure no undefined values
interface InventoryStatusProps {
  inventoryData: Array<{name: string; value: number}>;
  isAuthenticated: boolean;
  loading: boolean;
  onRefresh?: () => Promise<void>;
}

// Define colors for inventory status
const INVENTORY_COLORS = {
  'In Stock': '#10B981', // Green
  'Low Stock': '#F59E0B', // Amber
  'Out of Stock': '#EF4444', // Red
  // Fallbacks
  'default1': '#6B7280',
  'default2': '#1F2937',
};

const InventoryStatus: React.FC<InventoryStatusProps> = ({
  inventoryData,
  isAuthenticated,
  loading,
  onRefresh
}) => {
  const [refreshing, setRefreshing] = React.useState(false);

  // For demo, we'll add some additional inventory data
  const topLowStockItems = [
    { id: 1, name: "Product A", sku: "SKU001", current: 5, minimum: 10, status: "Low Stock" },
    { id: 2, name: "Product B", sku: "SKU002", current: 3, minimum: 15, status: "Low Stock" },
    { id: 3, name: "Product C", sku: "SKU003", current: 0, minimum: 8, status: "Out of Stock" },
    { id: 4, name: "Product D", sku: "SKU004", current: 2, minimum: 12, status: "Low Stock" },
    { id: 5, name: "Product E", sku: "SKU005", current: 0, minimum: 5, status: "Out of Stock" },
  ];

  // Calculate totals with proper type safety
  const totalItems = inventoryData.reduce((sum, item) => sum + item.value, 0);
  const inStockItem = inventoryData.find(item => item.name === 'In Stock');
  const lowStockItem = inventoryData.find(item => item.name === 'Low Stock');
  const outOfStockItem = inventoryData.find(item => item.name === 'Out of Stock');
  
  const inStock = inStockItem ? inStockItem.value : 0;
  const lowStock = lowStockItem ? lowStockItem.value : 0;
  const outOfStock = outOfStockItem ? outOfStockItem.value : 0;
  
  const percentLowStock = totalItems ? (lowStock / totalItems) * 100 : 0;
  const percentOutOfStock = totalItems ? (outOfStock / totalItems) * 100 : 0;

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border border-border shadow-theme-medium rounded-md text-card-foreground">
          <p className="font-medium text-theme-heading">{payload[0].name}</p>
          <p className="text-theme-primary">{payload[0].value} items</p>
          <p className="text-theme-secondary">{((payload[0].value / totalItems) * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Stock':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Low Stock':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'Out of Stock':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* In Stock Card */}
        <Card className="bg-card shadow-theme-light hover:shadow-theme-medium transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-theme-secondary">In Stock</p>
                <h3 className="text-2xl font-bold mt-1 text-theme-heading">{loading ? <Skeleton className="h-8 w-16" /> : inStock}</h3>
              </div>
              <div className="h-12 w-12 bg-theme-success rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-theme-success" />
              </div>
            </div>
            <div className="mt-4 text-sm text-theme-secondary">
              {!loading && 
                <span>{totalItems > 0 ? ((inStock / totalItems) * 100).toFixed(1) : 0}% of inventory</span>
              }
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Card */}
        <Card className="bg-card shadow-theme-light hover:shadow-theme-medium transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-theme-secondary">Low Stock</p>
                <h3 className="text-2xl font-bold mt-1 text-theme-heading">{loading ? <Skeleton className="h-8 w-16" /> : lowStock}</h3>
              </div>
              <div className="h-12 w-12 bg-theme-warning rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-theme-warning" />
              </div>
            </div>
            <div className="mt-4 text-sm text-theme-secondary">
              {!loading && 
                <span>{lowStock} items need attention</span>
              }
            </div>
          </CardContent>
        </Card>

        {/* Out of Stock Card */}
        <Card className="bg-card shadow-theme-light hover:shadow-theme-medium transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-theme-secondary">Out of Stock</p>
                <h3 className="text-2xl font-bold mt-1 text-theme-heading">{loading ? <Skeleton className="h-8 w-16" /> : outOfStock}</h3>
              </div>
              <div className="h-12 w-12 bg-theme-danger rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-theme-danger" />
              </div>
            </div>
            <div className="mt-4 text-sm text-theme-secondary">
              {!loading && 
                <span>Requires immediate reordering</span>
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Card */}
      <Card className="bg-card shadow-theme-light hover:shadow-theme-medium overflow-hidden transition-all">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>
                Current inventory levels and stock status
              </CardDescription>
            </div>
            {isAuthenticated && onRefresh && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing || loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart" className="mt-2">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
              <TabsTrigger value="items">Low Stock Items</TabsTrigger>
            </TabsList>
            
            {/* Chart View Tab */}
            <TabsContent value="chart">
              <div className="h-80">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Skeleton className="h-[300px] w-full" />
                  </div>
                ) : isAuthenticated ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={inventoryData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      barSize={60}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name, props) => {
                          return [`${value} products`, props.payload.name];
                        }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderRadius: '6px',
                          boxShadow: '0 2px 5px hsl(var(--shadow-light))',
                          border: '1px solid hsl(var(--border))',
                          color: 'hsl(var(--card-foreground))'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        name="Products" 
                        radius={[4, 4, 0, 0]}
                      >
                        {inventoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={INVENTORY_COLORS[entry.name as keyof typeof INVENTORY_COLORS] || '#8884d8'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Package className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-center">Please log in to view inventory data.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Distribution Tab */}
            <TabsContent value="distribution">
              <div className="h-80">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Skeleton className="h-[300px] w-[300px] max-w-full rounded-full mx-auto" />
                  </div>
                ) : isAuthenticated ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={inventoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {inventoryData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={INVENTORY_COLORS[entry.name as keyof typeof INVENTORY_COLORS] || '#8884d8'} 
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="flex flex-col justify-center space-y-4 p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span className="font-medium">In Stock</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-lg font-semibold">{inStock}</span>
                            <span className="ml-1 text-sm text-gray-500">items</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                            <span className="font-medium">Low Stock</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-lg font-semibold">{lowStock}</span>
                            <span className="ml-1 text-sm text-gray-500">items</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                            <span className="font-medium">Out of Stock</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-lg font-semibold">{outOfStock}</span>
                            <span className="ml-1 text-sm text-gray-500">items</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Inventory Health</span>
                            <span className="text-sm font-medium">
                              {percentLowStock + percentOutOfStock > 25 ? 'Needs Attention' : 'Good'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                percentLowStock + percentOutOfStock > 25 ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${100 - percentLowStock - percentOutOfStock}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Package className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-center">Please log in to view inventory data.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Low Stock Items Tab */}
            <TabsContent value="items">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : isAuthenticated ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left font-medium">Product</th>
                        <th className="py-3 text-left font-medium">SKU</th>
                        <th className="py-3 text-right font-medium">Current</th>
                        <th className="py-3 text-right font-medium">Minimum</th>
                        <th className="py-3 text-center font-medium">Status</th>
                        <th className="py-3 text-right font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topLowStockItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 font-medium">{item.name}</td>
                          <td className="py-3 text-gray-500">{item.sku}</td>
                          <td className="py-3 text-right">{item.current}</td>
                          <td className="py-3 text-right">{item.minimum}</td>
                          <td className="py-3">
                            <div className="flex items-center justify-center">
                              <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === 'Out of Stock' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {getStatusIcon(item.status)}
                                <span className="ml-1">{item.status}</span>
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Reorder
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Package className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center">Please log in to view inventory data.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </p>
          <div className="text-sm text-gray-500">
            {totalItems > 0 && isAuthenticated ? (
              <>
                <span className="font-medium">{lowStock + outOfStock}</span> out of <span className="font-medium">{totalItems}</span> products need attention
              </>
            ) : null}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InventoryStatus;