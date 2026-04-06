"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard, 
  PieChart,
  BarChart3,
  Calculator,
  FileText,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getSocket } from "@/lib/socket";

interface FinanceStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  monthlyGrowth: number;
  pendingInvoices: number;
  overdueInvoices: number;
  cashFlow: number;
  profitMargin: number;
}

interface FinanceDashboardProps {
  isAuthenticated: boolean;
}

const FinanceDashboard: React.FC<FinanceDashboardProps> = ({ isAuthenticated }) => {
  const router = useRouter();
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    monthlyGrowth: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    cashFlow: 0,
    profitMargin: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinanceData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Mock finance data (replace with actual API calls)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setStats({
        totalRevenue: 125680.50,
        totalExpenses: 89420.25,
        netProfit: 36260.25,
        monthlyGrowth: 12.5,
        pendingInvoices: 8,
        overdueInvoices: 3,
        cashFlow: 45890.75,
        profitMargin: 28.8
      });
    } catch (err: any) {
      console.error("Error fetching finance data:", err);
      setError("Failed to load finance data");
      toast({
        title: "Error",
        description: "Failed to load finance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  // Real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (socket) {
      const handleFinanceUpdate = (data: any) => {
        setStats(prev => ({ ...prev, ...data }));
        toast({
          title: "Finance Update",
          description: "Financial data has been updated",
        });
      };

      socket.on("finance:updated", handleFinanceUpdate);

      return () => {
        socket.off("finance:updated", handleFinanceUpdate);
      };
    }
  }, [isAuthenticated]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (!isAuthenticated) {
    return (
      <Card className="theme-card theme-shadow theme-transition">
        <CardContent className="p-8 text-center">
          <DollarSign className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2 text-foreground">Finance Management</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Please log in to access finance management features.
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
              fetchFinanceData();
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
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="theme-card theme-shadow theme-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                {loading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</p>
                )}
                {!loading && (
                  <div className="flex items-center mt-1">
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">{formatPercentage(stats.monthlyGrowth)}</span>
                  </div>
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
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                {loading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalExpenses)}</p>
                )}
                {!loading && (
                  <div className="flex items-center mt-1">
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-xs text-red-600">-2.3%</span>
                  </div>
                )}
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="theme-card theme-shadow theme-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                {loading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.netProfit)}</p>
                )}
                {!loading && (
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">{formatPercentage(stats.profitMargin)}</span>
                  </div>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="theme-card theme-shadow theme-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cash Flow</p>
                {loading ? (
                  <Skeleton className="h-8 w-24 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.cashFlow)}</p>
                )}
                {!loading && (
                  <p className="text-xs text-muted-foreground mt-1">Available funds</p>
                )}
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Finance Overview */}
      <Card className="theme-card theme-shadow theme-transition">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="theme-text">Financial Overview</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFinanceData}
            disabled={loading}
            className="theme-button theme-focusable theme-transition"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profit & Loss Summary */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Profit & Loss Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <span className="text-sm font-medium">Revenue</span>
                    <span className="font-semibold text-green-600">{formatCurrency(stats.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <span className="text-sm font-medium">Expenses</span>
                    <span className="font-semibold text-red-600">-{formatCurrency(stats.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                    <span className="text-sm font-bold">Net Profit</span>
                    <span className="font-bold text-blue-600">{formatCurrency(stats.netProfit)}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Status */}
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Invoice Status</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <span className="text-sm font-medium">Pending Invoices</span>
                    <span className="font-semibold text-yellow-600">{stats.pendingInvoices}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <span className="text-sm font-medium">Overdue Invoices</span>
                    <span className="font-semibold text-red-600">{stats.overdueInvoices}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                    <span className="text-sm font-medium">Profit Margin</span>
                    <span className="font-semibold text-gray-600">{stats.profitMargin.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="theme-card theme-shadow theme-transition">
        <CardHeader>
          <CardTitle className="theme-text">Finance Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push("/dashboard/finance/budgeting")}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 theme-button theme-focusable theme-transition"
            >
              <Calculator className="h-6 w-6" />
              <span className="text-sm font-medium">Budgeting</span>
            </Button>
            
            <Button
              onClick={() => router.push("/dashboard/finance/expenses")}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 theme-button theme-focusable theme-transition"
            >
              <CreditCard className="h-6 w-6" />
              <span className="text-sm font-medium">Expenses</span>
            </Button>
            
            <Button
              onClick={() => router.push("/dashboard/finance/reports")}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 theme-button theme-focusable theme-transition"
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm font-medium">Reports</span>
            </Button>
            
            <Button
              onClick={() => router.push("/dashboard/finance/analytics")}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 theme-button theme-focusable theme-transition"
            >
              <PieChart className="h-6 w-6" />
              <span className="text-sm font-medium">Analytics</span>
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <Button
              onClick={() => router.push("/dashboard/finance")}
              size="lg"
              className="theme-button theme-focusable theme-transition"
            >
              Go to Finance Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceDashboard;