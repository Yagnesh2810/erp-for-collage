//path : frontend/src/components/analytics/InventoryStatusChart.tsx
"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface InventoryStatusChartProps {
  inventoryData: any[];
  isAuthenticated: boolean;
  loading: boolean;
}

const InventoryStatusChart: React.FC<InventoryStatusChartProps> = ({
  inventoryData,
  isAuthenticated,
  loading
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({
    key: 'lowStock',
    direction: 'descending'
  });

  // Sort inventory data based on the current sort configuration
  const sortedData = [...inventoryData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Function to handle sorting
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Determine if a product has low stock (below threshold)
  const getLowStockStatus = (item: any) => {
    return item.currentStock <= item.reorderPoint;
  };

  // Calculate the stock status for products
  const stockLevels = inventoryData.reduce(
    (acc, item) => {
      if (getLowStockStatus(item)) {
        acc.lowStock += 1;
      } else if (item.currentStock > item.reorderPoint * 3) {
        acc.healthy += 1;
      } else {
        acc.medium += 1;
      }
      return acc;
    },
    { lowStock: 0, medium: 0, healthy: 0 }
  );

  // Format data for stock status chart
  const stockStatusData = [
    { name: 'Low Stock', value: stockLevels.lowStock, fill: '#EF4444' },
    { name: 'Medium Stock', value: stockLevels.medium, fill: '#F59E0B' },
    { name: 'Healthy Stock', value: stockLevels.healthy, fill: '#10B981' },
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-sm">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-sm">{`Count: ${data.value}`}</p>
          <p className="text-sm">{`Percentage: ${((data.value / inventoryData.length) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle>Inventory Status</CardTitle>
        <CardDescription>
          Current inventory levels and alert status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart">
            <div className="h-[350px] w-full">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stockStatusData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="value" name="Products">
                      {stockStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="table">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => requestSort('name')}
                      >
                        Product Name
                        {sortConfig.key === 'name' && (
                          <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 text-right"
                        onClick={() => requestSort('currentStock')}
                      >
                        Current Stock
                        {sortConfig.key === 'currentStock' && (
                          <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 text-right"
                        onClick={() => requestSort('reorderPoint')}
                      >
                        Reorder Point
                        {sortConfig.key === 'reorderPoint' && (
                          <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                        )}
                      </TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.map((item) => {
                      const isLowStock = getLowStockStatus(item);
                      
                      return (
                        <TableRow key={item._id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">{item.currentStock}</TableCell>
                          <TableCell className="text-right">{item.reorderPoint}</TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                isLowStock
                                  ? 'bg-red-100 text-red-800'
                                  : item.currentStock > item.reorderPoint * 3
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {isLowStock
                                ? 'Low Stock'
                                : item.currentStock > item.reorderPoint * 3
                                ? 'Healthy'
                                : 'Medium'}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InventoryStatusChart;