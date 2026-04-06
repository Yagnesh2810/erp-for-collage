'use client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ReportsPage() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Reports</h1>
            <p className="text-muted-foreground mt-1">Balance sheet, P&L, cash flow, and custom reports</p>
          </div>
          <Button>+ Generate Report</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-semibold mb-1">Balance Sheet</h3>
              <p className="text-sm text-muted-foreground">Assets, liabilities, and equity</p>
              <Badge variant="outline" className="mt-2">Monthly</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-semibold mb-1">P&L Statement</h3>
              <p className="text-sm text-muted-foreground">Revenue, expenses, and profit</p>
              <Badge variant="outline" className="mt-2">Monthly</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="text-2xl mb-2">💸</div>
              <h3 className="font-semibold mb-1">Cash Flow</h3>
              <p className="text-sm text-muted-foreground">Operating, investing, financing</p>
              <Badge variant="outline" className="mt-2">Weekly</Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-semibold mb-1">Trial Balance</h3>
              <p className="text-sm text-muted-foreground">Account balances verification</p>
              <Badge variant="outline" className="mt-2">Daily</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Financial reporting features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}