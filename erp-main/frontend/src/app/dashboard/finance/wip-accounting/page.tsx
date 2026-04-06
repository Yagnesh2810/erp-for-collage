'use client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function WIPAccountingPage() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">WIP Accounting</h1>
            <p className="text-muted-foreground mt-1">Work orders, material consumption, and production costs</p>
          </div>
          <Button>+ New Work Order</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <Badge variant="secondary">In Progress</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">WIP Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$425K</div>
              <Badge variant="outline">Current</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Material Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$185K</div>
              <Badge variant="default">Consumed</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Labor Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$240K</div>
              <Badge variant="outline">Applied</Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Work in Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">WIP accounting features coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}