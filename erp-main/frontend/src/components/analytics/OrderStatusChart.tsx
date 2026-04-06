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
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface OrderStatusChartProps {
  orderData: any[];
  isAuthenticated: boolean;
  loading: boolean;
}

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({
  orderData,
  isAuthenticated,
  loading
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Group orders by status
  const ordersByStatus = orderData.reduce<Record<string, any[]>>((acc, order) => {
    const status = order.status || 'Unknown';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(order);
    return acc;
  }, {});

  // Format data for chart
  const pieData = Object.entries(ordersByStatus).map(([status, orders]) => ({
    name: status,
    value: orders.length,
    orders: orders
  }));

  // Define colors for order statuses
  const statusColors = {
    'Pending': '#F59E0B',    // Amber
    'Processing': '#60A5FA',  // Blue
    'Shipped': '#10B981',     // Emerald
    'Delivered': '#8B5CF6',   // Purple
    'Cancelled': '#EF4444',   // Red
    'Unknown': '#6B7280'      // Gray
  };

  // Get color for a status
  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || statusColors.Unknown;
  };

  // Handle active shape for pie chart
  const renderActiveShape = (props: any) => {
    const {
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value, name
    } = props;

    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} className="text-sm font-medium">
          {name}
        </text>
        <text x={cx} y={cy} dy={0} textAnchor="middle" className="text-base font-bold">
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <text x={cx} y={cy} dy={20} textAnchor="middle" className="text-xs text-gray-500">
          Count: {value}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  // Handle pie enter
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip bg-white p-3 border border-gray-200 rounded-md shadow-sm">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-sm">{`Count: ${data.value} (${((data.value / orderData.length) * 100).toFixed(1)}%)`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
        <CardDescription>
          Distribution of orders by status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Chart View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart">
            <div className="h-[400px] w-full">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-[300px] w-[300px] max-w-full rounded-full mx-auto" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      animationDuration={800}
                      animationBegin={300}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getStatusColor(entry.name)}
                          stroke="white"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      wrapperStyle={{ 
                        paddingLeft: '20px',
                        fontSize: '12px',
                        lineHeight: '20px'
                      }}
                      iconType="circle"
                      iconSize={8}
                    />
                  </PieChart>
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
              <div>
                <div className="flex flex-wrap gap-4 mb-4">
                  {pieData.map((statusGroup) => (
                    <div 
                      key={statusGroup.name}
                      className="flex items-center space-x-2"
                    >
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getStatusColor(statusGroup.name) }} 
                      />
                      <span className="text-sm">
                        {statusGroup.name}: {statusGroup.value} 
                        ({((statusGroup.value / orderData.length) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderData.slice(0, 10).map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-medium">{order.orderNumber || order._id}</TableCell>
                          <TableCell>{order.customer?.name || 'N/A'}</TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>${order.total?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>
                            <span
                              className="px-2 py-1 rounded-full text-xs"
                              style={{
                                backgroundColor: `${getStatusColor(order.status)}20`,
                                color: getStatusColor(order.status)
                              }}
                            >
                              {order.status || 'Unknown'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {orderData.length > 10 && (
                    <div className="text-center mt-2 text-sm text-gray-500">
                      Showing 10 of {orderData.length} orders
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OrderStatusChart;