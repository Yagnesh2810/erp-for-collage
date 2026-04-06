"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  FileText,
  Calculator,
  PieChart,
  Receipt,
  CreditCard,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Mock API functions
const getBudgetOverview = async (projectId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mock-finance/budget/${projectId}/overview`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth-token')}` }
  });
  const data = await response.json();
  return data.data;
};

const getExpenseSummary = async (projectId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${projectId}/summary`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth-token')}` }
  });
  const data = await response.json();
  return data.data;
};

const getInvoiceSummary = async (projectId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mock-finance/invoices/${projectId}/summary`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth-token')}` }
  });
  const data = await response.json();
  return data.data;
};

const getPaymentSummary = async (projectId: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mock-finance/payments/${projectId}/summary`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('auth-token')}` }
  });
  const data = await response.json();
  return data.data;
};

interface ProjectFinanceProps {
  projectId: string;
}

interface FinanceData {
  totalBudget: number;
  spentAmount: number;
  remainingBudget: number;
  budgetUtilization: number;
  totalExpenses: number;
  totalInvoices: number;
  totalPayments: number;
  pendingPayments: number;
  profitLoss: number;
  revenue: number;
}

export const ProjectFinance: React.FC<ProjectFinanceProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [financeData, setFinanceData] = useState<FinanceData>({
    totalBudget: 0,
    spentAmount: 0,
    remainingBudget: 0,
    budgetUtilization: 0,
    totalExpenses: 0,
    totalInvoices: 0,
    totalPayments: 0,
    pendingPayments: 0,
    profitLoss: 0,
    revenue: 0
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (projectId) {
      fetchFinanceData();
    }
  }, [projectId]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshFinanceData();
    }, 30000);
    return () => clearInterval(interval);
  }, [projectId]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      
      const [budgetData, expenseData, invoiceData, paymentData] = await Promise.allSettled([
        getBudgetOverview(projectId),
        getExpenseSummary(projectId),
        getInvoiceSummary(projectId),
        getPaymentSummary(projectId)
      ]);
      
      const budget = budgetData.status === 'fulfilled' ? budgetData.value : {
        totalBudget: 0,
        spentAmount: 0,
        remainingBudget: 0,
        budgetUtilization: 0
      };
      
      const expenses = expenseData.status === 'fulfilled' ? expenseData.value : {
        totalExpenses: 0
      };
      
      const invoices = invoiceData.status === 'fulfilled' ? invoiceData.value : {
        totalInvoices: 0,
        paidInvoices: 0,
        unpaidInvoices: 0
      };
      
      const payments = paymentData.status === 'fulfilled' ? paymentData.value : {
        totalPayments: 0,
        pendingPayments: 0,
        totalIncoming: 0,
        totalOutgoing: 0
      };
      
      const revenue = invoices.totalInvoices || invoices.paidInvoices || 0;
      const profitLoss = revenue - expenses.totalExpenses;
      
      setFinanceData({
        totalBudget: budget.totalBudget,
        spentAmount: budget.spentAmount,
        remainingBudget: budget.remainingBudget,
        budgetUtilization: budget.budgetUtilization,
        totalExpenses: expenses.totalExpenses,
        totalInvoices: invoices.totalInvoices,
        totalPayments: payments.totalPayments,
        pendingPayments: payments.pendingPayments,
        profitLoss,
        revenue
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching finance data:', error);
      toast({
        title: "Error",
        description: "Failed to load finance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshFinanceData = async () => {
    if (!loading) {
      await fetchFinanceData();
    }
  };

  const getBudgetStatus = () => {
    const utilization = financeData.budgetUtilization;
    if (utilization >= 90) return { color: "text-red-600", bg: "bg-red-100", label: "Critical" };
    if (utilization >= 75) return { color: "text-yellow-600", bg: "bg-yellow-100", label: "Warning" };
    return { color: "text-green-600", bg: "bg-green-100", label: "Good" };
  };

  const budgetStatus = getBudgetStatus();

  const canViewFinance = user?.permissions?.includes('finance.view') || user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'root';
  const canEditFinance = user?.permissions?.includes('finance.edit') || user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'root';
  const canDeleteFinance = user?.permissions?.includes('finance.delete') || user?.role === 'superadmin' || user?.role === 'root';

  if (!canViewFinance) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">You don't have permission to view finance data.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading finance data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Finance</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={refreshFinanceData} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">${financeData.totalBudget.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Spent Amount</p>
                <p className="text-2xl font-bold">${financeData.spentAmount.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Badge className={`${budgetStatus.bg} ${budgetStatus.color}`}>
                    {financeData.budgetUtilization}%
                  </Badge>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remaining Budget</p>
                <p className="text-2xl font-bold">${financeData.remainingBudget.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  {financeData.totalBudget > 0 ? ((financeData.remainingBudget / financeData.totalBudget) * 100).toFixed(1) : 0}% left
                </p>
              </div>
              <Calculator className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">${financeData.totalInvoices.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
              <FileText className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profit/Loss</p>
                <p className={`text-2xl font-bold ${financeData.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(financeData.profitLoss).toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {financeData.profitLoss >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${financeData.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {financeData.profitLoss >= 0 ? 'Profit' : 'Loss'}
                  </span>
                </div>
              </div>
              <PieChart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Budget Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Budget Usage</span>
              <span className="text-sm text-muted-foreground">
                ${financeData.spentAmount.toLocaleString()} / ${financeData.totalBudget.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  financeData.budgetUtilization >= 90 ? 'bg-red-500' :
                  financeData.budgetUtilization >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(financeData.budgetUtilization, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0%</span>
              <span>{financeData.budgetUtilization}% used</span>
              <span>100%</span>
            </div>
            {financeData.budgetUtilization >= 75 && financeData.totalBudget > 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  {financeData.budgetUtilization >= 90 
                    ? "Critical: Budget utilization is very high" 
                    : "Warning: Budget utilization is approaching limit"}
                </span>
              </div>
            )}
            
            {financeData.totalBudget === 0 && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  No budget has been set for this project. Create a budget to track financial performance.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="budget" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="budget">
            <DollarSign className="h-4 w-4 mr-2" />
            Budget Overview
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <Receipt className="h-4 w-4 mr-2" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="h-4 w-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="summary">
            <BarChart3 className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="budget">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Budget management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Expense management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Invoice management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Payment management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Financial Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-xl font-bold">${financeData.totalBudget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-xl font-bold">${financeData.totalExpenses.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-xl font-bold">${financeData.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Profit/Loss</p>
                    <p className={`text-xl font-bold ${financeData.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(financeData.profitLoss).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};