"use client";

import React from "react";
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
  ResponsiveContainer
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface TopSellingProductsChartProps {
  productsData: any[];
  isAuthenticated: boolean;
  loading: boolean;
}

const TopSellingProductsChart: React.FC<TopSellingProductsChartProps> = ({
  productsData,
  isAuthenticated,
  loading
}) => {
  // Limit to top 10 products for better visualization
  const topProducts = productsData.slice(0, 10);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-sm">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-sm text-blue-600">{`Quantity: ${payload[0].value}`}</p>
          {payload[1] && (
            <p className="text-sm text-emerald-600">{`Revenue: $${payload[1].value.toLocaleString()}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>
          Products by quantity sold and revenue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          {loading ? (
            <div className="w-full h-full flex flex-col gap-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProducts}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => 
                    value.length > 20 ? `${value.substring(0, 18)}...` : value
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="quantity"
                  name="Quantity Sold"
                  fill="#4F46E5"
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue ($)"
                  fill="#10B981"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopSellingProductsChart;