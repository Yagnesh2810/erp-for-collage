'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Area,
  AreaChart
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon, AreaChart as AreaChartIcon } from "lucide-react";

interface SalesChartProps {
  salesData: Array<{ name: string; sales: number; revenue: number }>;
  isAuthenticated: boolean;
  loading: boolean;
  onRefresh?: () => Promise<void>;
}

const SalesChart: React.FC<SalesChartProps> = ({
  salesData,
  isAuthenticated,
  loading,
  onRefresh
}) => {
  const [chartType, setChartType] = useState("line");
  const [refreshing, setRefreshing] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getAverageRevenue = () => {
    if (!salesData.length) return 0;
    const total = salesData.reduce((sum, item) => sum + item.revenue, 0);
    return total / salesData.length;
  };

  const calculateTrend = () => {
    if (salesData.length < 2) return { trend: 0, isPositive: true };
    const lastMonth = salesData[salesData.length - 1];
    const previousMonth = salesData[salesData.length - 2];
    if (!lastMonth || !previousMonth) return { trend: 0, isPositive: true };
    const percentChange = previousMonth.revenue > 0
      ? ((lastMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
      : 0;
    return {
      trend: Math.abs(percentChange),
      isPositive: percentChange >= 0
    };
  };

  const { trend, isPositive } = calculateTrend();
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.sales, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 border border-border/50 backdrop-blur-md rounded-xl shadow-xl p-3 text-card-foreground">
          <p className="font-semibold text-sm mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-mono font-medium">{formatCurrency(payload[0].value)}</span>
            </div>
            {payload[1] && (
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                <span className="text-muted-foreground">Orders:</span>
                <span className="font-mono font-medium">{payload[1].value}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  return (
    <Card className="col-span-4 border-none shadow-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold tracking-tight">Sales Overview</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">Monthly revenue and order trends</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-secondary/50 p-1 rounded-lg border border-border/50 backdrop-blur-sm">
              <Button
                variant={chartType === "line" ? "default" : "ghost"}
                size="icon"
                onClick={() => setChartType("line")}
                className={`h-8 w-8 rounded-md transition-all ${chartType === 'line' ? 'shadow-sm' : 'hover:bg-background/50'}`}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "bar" ? "default" : "ghost"}
                size="icon"
                onClick={() => setChartType("bar")}
                className={`h-8 w-8 rounded-md transition-all ${chartType === 'bar' ? 'shadow-sm' : 'hover:bg-background/50'}`}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === "area" ? "default" : "ghost"}
                size="icon"
                onClick={() => setChartType("area")}
                className={`h-8 w-8 rounded-md transition-all ${chartType === 'area' ? 'shadow-sm' : 'hover:bg-background/50'}`}
              >
                <AreaChartIcon className="h-4 w-4" />
              </Button>
            </div>
            {isAuthenticated && onRefresh && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                className="h-9 w-9 border-dashed bg-transparent"
                disabled={refreshing || loading}
              >
                <RefreshCw className={`h-4 w-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="h-[350px] w-full">
          {loading ? (
            <div className="w-full h-full flex flex-col gap-4 justify-center items-center">
              <Skeleton className="h-[250px] w-full rounded-xl" />
            </div>
          ) : !isAuthenticated ? (
            <div className="w-full h-full flex items-center justify-center flex-col gap-3">
              <div className="bg-muted/30 p-4 rounded-full">
                <LineChartIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Please log in to view sales data.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} stroke="#888" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: '#888' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}`}
                    dx={10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={getAverageRevenue()} yAxisId="right" stroke="#f59e0b" strokeDasharray="3 3" />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="sales"
                    stroke="#a78bfa"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                    name="Orders"
                  />
                </AreaChart>
              ) : chartType === "bar" ? (
                <BarChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sales" name="Orders" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <ComposedChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" fill="#6366f1" stroke="#6366f1" fillOpacity={0.1} name="Revenue" />
                  <Bar dataKey="sales" fill="#a78bfa" name="Orders" radius={[4, 4, 0, 0]} barSize={32} />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t border-border/40 pt-4 bg-muted/10">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center text-sm">
          <div className="flex items-center gap-8 mb-2 sm:mb-0">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Total Revenue</p>
              <p className="font-bold text-xl text-foreground">{formatCurrency(totalRevenue)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Total Orders</p>
              <p className="font-bold text-xl text-foreground">{totalOrders}</p>
            </div>
          </div>

          {trend > 0 && salesData.length > 0 && (
            <div className={`flex items-center px-3 py-1.5 rounded-full border ${isPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'}`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1.5" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1.5" />
              )}
              <span className="font-semibold text-xs">{trend.toFixed(1)}% {isPositive ? 'increase' : 'decrease'}</span>
              <span className="text-muted-foreground/60 text-[10px] ml-1.5 uppercase tracking-wide font-medium font-mono">vs prev month</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default SalesChart;