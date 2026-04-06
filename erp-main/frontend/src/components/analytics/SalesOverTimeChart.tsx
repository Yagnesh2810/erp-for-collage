// path: frontend/src/components/analytics/SalesOverTimeChart.tsx
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface SalesOverTimeChartProps {
  salesData: any[];
  isAuthenticated: boolean;
  loading: boolean;
}

const SalesOverTimeChart: React.FC<SalesOverTimeChartProps> = ({
  salesData,
  isAuthenticated,
  loading
}) => {
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-md shadow-sm">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-sm text-blue-600">{`Sales: $${payload[0].value.toLocaleString()}`}</p>
          {payload[1] && (
            <p className="text-sm text-emerald-600">{`Orders: ${payload[1].value}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle>Sales Over Time</CardTitle>
        <CardDescription>
          Revenue and order volume trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          {loading ? (
            <div className="w-full h-full flex flex-col gap-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="total"
                  name="Sales ($)"
                  stroke="#4F46E5"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesOverTimeChart;