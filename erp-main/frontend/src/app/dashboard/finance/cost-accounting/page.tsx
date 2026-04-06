'use client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CostAccountingPage() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cost Accounting</h1>
            <p className="text-muted-foreground mt-1">Cost centers, allocations, and project costs</p>
          </div>
          <Button>+ New Cost Center</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Cost Centers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <Badge variant="secondary">Active</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Direct Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$285K</div>
              <Badge variant="outline">This Month</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Indirect Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$95K</div>
              <Badge variant="default">Allocated</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Cost Variance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+2.1%</div>
              <Badge variant="outline">Under Budget</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cost Center Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Cost accounting features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}