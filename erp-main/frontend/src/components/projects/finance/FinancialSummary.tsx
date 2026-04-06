"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Target,
  AlertTriangle,
  FileText,
  Calculator
} from "lucide-react";

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

interface FinancialSummaryProps {
  projectId: string;
  financeData: FinanceData;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ 
  projectId, 
  financeData 
}) => {
  const [timeRange, setTimeRange] = useState('6months');

  // Sample data for charts
  const monthlyTrends = [
    { month: 'Aug', revenue: 15000, expenses: 8000, profit: 7000 },
    { month: 'Sep', revenue: 18000, expenses: 12000, profit: 6000 },
    { month: 'Oct', revenue: 22000, expenses: 15000, profit: 7000 },
    { month: 'Nov', revenue: 25000, expenses: 18000, profit: 7000 },
    { month: 'Dec', revenue: 28000, expenses: 20000, profit: 8000 },
    { month: 'Jan', revenue: 32000, expenses: 22000, profit: 10000 }
  ];

  const expenseBreakdown = [
    { name: 'Development', value: 25000, color: '#3B82F6' },
    { name: 'Marketing', value: 18000, color: '#10B981' },
    { name: 'Infrastructure', value: 16000, color: '#F59E0B' },
    { name: 'Operations', value: 12000, color: '#EF4444' },
    { name: 'Other', value: 8000, color: '#8B5CF6' }
  ];

  const revenueVsExpenses = [
    { month: 'Aug', revenue: 15000, expenses: 8000 },
    { month: 'Sep', revenue: 18000, expenses: 12000 },
    { month: 'Oct', revenue: 22000, expenses: 15000 },
    { month: 'Nov', revenue: 25000, expenses: 18000 },
    { month: 'Dec', revenue: 28000, expenses: 20000 },
    { month: 'Jan', revenue: 32000, expenses: 22000 }
  ];

  const cashFlow = [
    { month: 'Aug', inflow: 15000, outflow: 8000, net: 7000 },
    { month: 'Sep', inflow: 18000, outflow: 12000, net: 6000 },
    { month: 'Oct', inflow: 22000, outflow: 15000, net: 7000 },
    { month: 'Nov', inflow: 25000, outflow: 18000, net: 7000 },
    { month: 'Dec', inflow: 28000, outflow: 20000, net: 8000 },
    { month: 'Jan', inflow: 32000, outflow: 22000, net: 10000 }
  ];

  const keyMetrics = [
    {
      title: 'Gross Profit Margin',
      value: '31.25%',
      change: '+2.5%',
      trend: 'up',
      description: 'Revenue minus direct costs'
    },
    {
      title: 'ROI',
      value: '24.5%',
      change: '+1.8%',
      trend: 'up',
      description: 'Return on investment'
    },
    {
      title: 'Burn Rate',
      value: '$22,000',
      change: '-5.2%',
      trend: 'down',
      description: 'Monthly spending rate'
    },
    {
      title: 'Cash Runway',
      value: '8.2 months',
      change: '+0.5 months',
      trend: 'up',
      description: 'Time until funds depleted'
    }
  ];

  const profitLossData = {
    revenue: financeData.revenue,
    totalExpenses: financeData.totalExpenses,
    grossProfit: financeData.revenue - financeData.totalExpenses,
    netProfit: financeData.profitLoss,
    profitMargin: financeData.revenue > 0 ? ((financeData.profitLoss / financeData.revenue) * 100).toFixed(1) : '0'
  };

  // Check if there's any financial data
  const hasFinancialData = financeData.totalBudget > 0 || financeData.revenue > 0 || financeData.totalExpenses > 0;

  if (!hasFinancialData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <PieChartIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Financial Data Available</h3>
            <p className="text-muted-foreground mb-6">
              Start by creating a budget, adding expenses, or generating invoices to see financial analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Add Invoice
              </Button>
              <Button variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
                Record Expense
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Financial Summary & Analytics</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="12months">Last 12 Months</SelectItem>
            <SelectItem value="ytd">Year to Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profit & Loss Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Profit & Loss Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Total Revenue</span>
                  <span className="font-bold text-green-600">${profitLossData.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Total Expenses</span>
                  <span className="font-bold text-red-600">-${profitLossData.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                  <span className="font-medium">Gross Profit</span>
                  <span className={`font-bold ${profitLossData.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(profitLossData.grossProfit).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold">Net Profit</span>
                  <span className={`font-bold text-lg ${profitLossData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(profitLossData.netProfit).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <p className={`text-3xl font-bold ${Number(profitLossData.profitMargin) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitLossData.profitMargin}%
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Budget Utilization</p>
                  <p className="text-3xl font-bold text-blue-600">{financeData.budgetUtilization}%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueVsExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cash Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Cash Flow Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={cashFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="inflow" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Inflow" />
                <Area type="monotone" dataKey="outflow" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Outflow" />
                <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={3} name="Net Cash Flow" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Health Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-green-600">Strengths</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Positive cash flow trend</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Revenue growth of 15% MoM</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Healthy profit margins</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-yellow-600">Areas to Watch</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Infrastructure costs increasing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Budget utilization at 75%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Pending payments: $45K</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-red-600">Risks</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">High dependency on single client</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Seasonal revenue fluctuations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Limited cash reserves</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Financial Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Cost Optimization</h4>
              <p className="text-sm text-blue-700">
                Consider renegotiating infrastructure contracts to reduce monthly costs by 10-15%.
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Revenue Growth</h4>
              <p className="text-sm text-green-700">
                Explore additional revenue streams or upselling opportunities with existing clients.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Cash Flow Management</h4>
              <p className="text-sm text-yellow-700">
                Implement stricter payment terms to improve cash flow and reduce outstanding receivables.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};