'use client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsPage() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Analytics</h1>
            <p className="text-muted-foreground mt-1">KPIs, financial ratios, and performance metrics</p>
          </div>
          <Button>+ Create Dashboard</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">15.2%</div>
              <Badge variant="default">YTD</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42.8%</div>
              <Badge variant="outline">This Quarter</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Current Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4</div>
              <Badge variant="secondary">Healthy</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Debt-to-Equity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0.35</div>
              <Badge variant="default">Low Risk</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Revenue analytics coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Expense analytics coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}