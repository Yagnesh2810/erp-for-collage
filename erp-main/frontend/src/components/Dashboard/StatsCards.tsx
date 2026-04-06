"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, TrendingUp, TrendingDown, Minus, DollarSign, ShoppingBag, AlertTriangle, Package, Users, Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/lib/socket";

interface StatsCardsProps {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    lowStockItems: number;
    totalCustomers: number;
    totalProducts: number;
  };
  isAuthenticated: boolean;
  loading: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, isAuthenticated, loading }) => {
  const [socket] = useSocket();
  const [realTimeStats, setRealTimeStats] = useState(stats);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setRealTimeStats(stats);
    setLastUpdated(new Date());
  }, [stats]);

  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleOrderUpdate = (order: any) => {
      setRealTimeStats(prev => ({
        ...prev,
        totalOrders: prev.totalOrders + 1,
        totalRevenue: prev.totalRevenue + (order.totalAmount || 0),
        pendingOrders: order.status === 'pending' ? prev.pendingOrders + 1 : prev.pendingOrders
      }));
      setLastUpdated(new Date());
    };

    const handleInventoryUpdate = () => {
      setLastUpdated(new Date());
    };

    const handleCustomerUpdate = () => {
      setRealTimeStats(prev => ({
        ...prev,
        totalCustomers: prev.totalCustomers + 1
      }));
      setLastUpdated(new Date());
    };

    socket.on('order:new', handleOrderUpdate);
    socket.on('inventory:updated', handleInventoryUpdate);
    socket.on('customer:new', handleCustomerUpdate);

    return () => {
      socket.off('order:new', handleOrderUpdate);
      socket.off('inventory:updated', handleInventoryUpdate);
      socket.off('customer:new', handleCustomerUpdate);
    };
  }, [socket, isAuthenticated]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getTrendIcon = (trend?: string) => {
    if (!trend) return null;
    const value = parseFloat(trend.replace('%', ''));
    if (value > 0) return <TrendingUp className="h-3 w-3" />;
    if (value < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = (trend?: string) => {
    if (!trend) return 'text-muted-foreground';
    const value = parseFloat(trend.replace('%', ''));
    if (value > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (value < 0) return 'text-rose-600 dark:text-rose-400';
    return 'text-muted-foreground';
  };

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(realTimeStats.totalRevenue),
      trend: "+12.3%",
      icon: DollarSign,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
      description: "from last period",
      priority: realTimeStats.totalRevenue !== stats.totalRevenue
    },
    {
      title: "Total Orders",
      value: formatNumber(realTimeStats.totalOrders),
      trend: "+8.2%",
      icon: ShoppingBag,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      description: "from last period",
      priority: realTimeStats.totalOrders !== stats.totalOrders
    },
    {
      title: "Pending Orders",
      value: formatNumber(realTimeStats.pendingOrders),
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      description: "Requires action",
      priority: realTimeStats.pendingOrders !== stats.pendingOrders,
      urgent: realTimeStats.pendingOrders > 10
    },
    {
      title: "Low Stock Items",
      value: formatNumber(realTimeStats.lowStockItems),
      icon: Package,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/30",
      description: "Needs reordering",
      priority: realTimeStats.lowStockItems !== stats.lowStockItems,
      urgent: realTimeStats.lowStockItems > 5
    },
    {
      title: "Total Customers",
      value: formatNumber(realTimeStats.totalCustomers),
      trend: "+5.8%",
      icon: Users,
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950/30",
      description: "customer growth",
      span: "md:col-span-1 lg:col-span-2",
      priority: realTimeStats.totalCustomers !== stats.totalCustomers
    },
    {
      title: "Total Products",
      value: formatNumber(realTimeStats.totalProducts),
      icon: Box,
      color: "text-violet-600 dark:text-violet-400",
      bgColor: "bg-violet-50 dark:bg-violet-950/30",
      description: `Across 8 categories`,
      span: "md:col-span-1 lg:col-span-2",
      priority: false
    }
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Real-time indicator */}
      {isAuthenticated && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${socket?.connected ? 'bg-emerald-400' : 'bg-gray-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${socket?.connected ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
            </span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{socket?.connected ? 'Live Updates' : 'Offline'}</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded-md" suppressHydrationWarning>
            Updated: {mounted ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
          </span>
        </div>
      )}

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className={`
                  border-none shadow-md hover:shadow-xl transition-all duration-300 group
                  ${card.span || ""}
                  bg-card/50 backdrop-blur-sm
                  hover:-translate-y-1
                  ${card.urgent ? 'ring-2 ring-rose-500/30' : ''}
                `}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className={`p-3 rounded-xl w-fit ${card.bgColor} transition-colors group-hover:scale-110 duration-300`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                      {loading ? (
                        <Skeleton className="h-8 w-24" />
                      ) : (
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">{card.value}</h2>
                      )}
                    </div>
                  </div>
                  {isAuthenticated && !loading && (
                    <div className="flex flex-col items-end gap-1">
                      {card.trend && (
                        <Badge variant="secondary" className={`${getTrendColor(card.trend)} bg-background/80 shadow-sm border border-border/50`}>
                          {getTrendIcon(card.trend)}
                          <span className="ml-1 font-semibold">{card.trend}</span>
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground/80 font-medium uppercase tracking-wide">{card.description}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StatsCards;