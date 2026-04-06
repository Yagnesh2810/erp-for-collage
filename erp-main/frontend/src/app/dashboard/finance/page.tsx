'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinance } from '@/hooks/useFinance';
import FinanceDashboard from '@/components/finance/FinanceDashboard';

export default function FinancePage() {
  const { dashboard, loading, fetchDashboard, updateSummary } = useFinance();
  const [summary, setSummary] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (dashboard && (dashboard as any)?.summary) {
      setSummary((dashboard as any).summary);
    }
  }, [dashboard]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span>📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>•</span>
            <span>🕐 {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={updateSummary} 
            disabled={loading}
            aria-label="Refresh financial dashboard data"
            id="refresh-finance-btn"
          >
            {loading ? 'Refreshing...' : 'Refresh Dashboard'}
          </Button>
          <Button
            aria-label="Create new financial transaction"
            id="new-transaction-btn"
          >
            + New Transaction
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
          <TabsTrigger value="overview" aria-label="Finance overview tab">Overview</TabsTrigger>
          <TabsTrigger value="general-ledger" aria-label="General ledger management tab">General Ledger</TabsTrigger>
          <TabsTrigger value="budgeting" aria-label="Budget planning tab">Budgeting</TabsTrigger>
          <TabsTrigger value="accounts" aria-label="Accounts management tab">Accounts</TabsTrigger>
          <TabsTrigger value="expenses" aria-label="Expense management tab">Expenses</TabsTrigger>
          <TabsTrigger value="cost-accounting" aria-label="Cost accounting tab">Cost Accounting</TabsTrigger>
          <TabsTrigger value="wip-accounting" aria-label="Work in progress accounting tab">WIP Accounting</TabsTrigger>
          <TabsTrigger value="reports" aria-label="Financial reports tab">Reports</TabsTrigger>
          <TabsTrigger value="analytics" aria-label="Financial analytics tab">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <Badge variant="secondary">Total</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalAssets)}</div>
                <p className="text-xs text-muted-foreground">↗ +12.3% from last period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
                <Badge variant="secondary">Total</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalLiabilities)}</div>
                <p className="text-xs text-muted-foreground">↘ -2.1% from last period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                <Badge variant={summary.netIncome >= 0 ? "default" : "destructive"}>
                  {summary.netIncome >= 0 ? "Profit" : "Loss"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${summary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(summary.netIncome)}
                </div>
                <p className="text-xs text-muted-foreground">↗ +8.2% from last period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
                <Badge variant="outline">Monthly</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue - summary.totalExpenses)}</div>
                <p className="text-xs text-muted-foreground">Operating cash flow</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/finance/general-ledger">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold mb-1">General Ledger</h3>
                  <p className="text-sm text-muted-foreground">Chart of accounts and journal entries</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/finance/budgeting">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="text-2xl mb-2">📈</div>
                  <h3 className="font-semibold mb-1">Budgeting</h3>
                  <p className="text-sm text-muted-foreground">Budget planning and variance analysis</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/finance/expenses">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="text-2xl mb-2">💳</div>
                  <h3 className="font-semibold mb-1">Expenses</h3>
                  <p className="text-sm text-muted-foreground">Expense claims and approvals</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/finance/reports">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="text-2xl mb-2">📋</div>
                  <h3 className="font-semibold mb-1">Reports</h3>
                  <p className="text-sm text-muted-foreground">Financial statements and reports</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="general-ledger" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <Card className="lg:mt-0">
              <CardHeader>
                <CardTitle>📊 General Ledger</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Chart of accounts, journal entries, and ledger management</p>
                <Button 
                  onClick={() => window.location.href = '/dashboard/finance/general-ledger'}
                  aria-label="Navigate to general ledger management"
                  id="go-to-general-ledger-btn"
                >
                  Go to General Ledger
                </Button>
              </CardContent>
            </Card>
            <Card className="lg:mt-12">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="Create new journal entry"
                    id="new-journal-entry-btn"
                  >
                    New Journal Entry
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="View chart of accounts"
                    id="view-chart-accounts-btn"
                  >
                    View Chart of Accounts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budgeting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <Card className="lg:mt-12">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Budget Overview</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="Create new budget plan"
                    id="create-budget-btn"
                  >
                    Create Budget
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="View budget versus actual comparison"
                    id="budget-vs-actual-btn"
                  >
                    Budget vs Actual
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="lg:mt-0">
              <CardHeader>
                <CardTitle>📈 Budgeting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Budget planning, allocations, and variance analysis</p>
                <Button 
                  onClick={() => window.location.href = '/dashboard/finance/budgeting'}
                  aria-label="Navigate to budget planning and management"
                  id="go-to-budgeting-btn"
                >
                  Go to Budgeting
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <Card className="lg:mt-0">
              <CardHeader>
                <CardTitle>👥 Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Client accounts, aging reports, and credit management</p>
                <Button 
                  onClick={() => window.location.href = '/dashboard/finance/accounts'}
                  aria-label="Navigate to accounts management"
                  id="go-to-accounts-btn"
                >
                  Go to Accounts
                </Button>
              </CardContent>
            </Card>
            <Card className="lg:mt-12">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Account Management</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="View aging reports"
                    id="aging-reports-btn"
                  >
                    Aging Reports
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="Manage credit and collections"
                    id="credit-management-btn"
                  >
                    Credit Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <Card className="lg:mt-12">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Expense Management</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="Submit new expense claim"
                    id="submit-expense-btn"
                  >
                    Submit Expense
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="Approve pending expenses"
                    id="approve-expenses-btn"
                  >
                    Approve Expenses
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="lg:mt-0">
              <CardHeader>
                <CardTitle>💳 Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Expense claims, approvals, and reimbursements</p>
                <Button 
                  onClick={() => window.location.href = '/dashboard/finance/expenses'}
                  aria-label="Navigate to expense management"
                  id="go-to-expenses-btn"
                >
                  Go to Expenses
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cost-accounting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <Card className="lg:mt-0">
              <CardHeader>
                <CardTitle>🏭 Cost Accounting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Cost centers, allocations, and project costs</p>
                <Button 
                  onClick={() => window.location.href = '/dashboard/finance/cost-accounting'}
                  aria-label="Navigate to cost accounting management"
                  id="go-to-cost-accounting-btn"
                >
                  Go to Cost Accounting
                </Button>
              </CardContent>
            </Card>
            <Card className="lg:mt-12">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Cost Management</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="Manage cost centers"
                    id="cost-centers-btn"
                  >
                    Cost Centers
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="View project costs"
                    id="project-costs-btn"
                  >
                    Project Costs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wip-accounting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <Card className="lg:mt-12">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">WIP Management</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="Manage work orders"
                    id="work-orders-btn"
                  >
                    Work Orders
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="Track material consumption"
                    id="material-consumption-btn"
                  >
                    Material Consumption
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="lg:mt-0">
              <CardHeader>
                <CardTitle>⚙️ WIP Accounting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Work orders, material consumption, and production costs</p>
                <Button 
                  onClick={() => window.location.href = '/dashboard/finance/wip-accounting'}
                  aria-label="Navigate to work in progress accounting"
                  id="go-to-wip-accounting-btn"
                >
                  Go to WIP Accounting
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <Card className="lg:mt-0">
              <CardHeader>
                <CardTitle>📋 Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Balance sheet, P&L, cash flow, and custom reports</p>
                <Button 
                  onClick={() => window.location.href = '/dashboard/finance/reports'}
                  aria-label="Navigate to financial reports"
                  id="go-to-reports-btn"
                >
                  Go to Reports
                </Button>
              </CardContent>
            </Card>
            <Card className="lg:mt-12">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Financial Reports</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="View balance sheet report"
                    id="balance-sheet-btn"
                  >
                    Balance Sheet
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="View profit and loss statement"
                    id="pl-statement-btn"
                  >
                    P&L Statement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <Card className="lg:mt-12">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Analytics Tools</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="View financial key performance indicators"
                    id="financial-kpis-btn"
                  >
                    Financial KPIs
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    aria-label="View performance metrics"
                    id="performance-metrics-btn"
                  >
                    Performance Metrics
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="lg:mt-0">
              <CardHeader>
                <CardTitle>📊 Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">KPIs, financial ratios, and performance metrics</p>
                <Button 
                  onClick={() => window.location.href = '/dashboard/finance/analytics'}
                  aria-label="Navigate to financial analytics"
                  id="go-to-analytics-btn"
                >
                  Go to Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </Layout>
  );
}