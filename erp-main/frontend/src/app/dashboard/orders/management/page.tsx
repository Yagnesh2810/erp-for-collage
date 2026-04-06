'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import FulfillmentDashboard from '@/components/FulfillmentDashboard';
import OrderCompletionDashboard from '@/components/OrderCompletionDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function OrderManagementDashboard() {
  const [activeTab, setActiveTab] = useState('fulfillment');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Order Management Dashboard</h1>
        
        <Tabs defaultValue="fulfillment" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
            <TabsTrigger value="completion">Completion & Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fulfillment" className="mt-6">
            <FulfillmentDashboard />
          </TabsContent>
          
          <TabsContent value="completion" className="mt-6">
            <OrderCompletionDashboard />
          </TabsContent>
        </Tabs>
        
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Order Processing Guidelines</h2>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Fulfillment Process</h3>
            
            <ol className="list-decimal pl-6 mb-6 space-y-2">
              <li>Orders in "Processing" status are ready to be fulfilled</li>
              <li>Verify inventory availability before fulfillment</li>
              <li>Add tracking information when shipping an order</li>
              <li>Update order status to "Fulfilled" once shipped</li>
              <li>Notify customer with tracking details</li>
              <li>Check for inventory reorder alerts after fulfillment</li>
            </ol>
            
            <h3 className="text-lg font-semibold mb-4">Completion Process</h3>
            
            <ol className="list-decimal pl-6 space-y-2">
              <li>Confirm delivery with customer if necessary</li>
              <li>Reconcile payment information</li>
              <li>Update loyalty points for the customer</li>
              <li>Generate final invoice if not already done</li>
              <li>Update order status to "Completed"</li>
              <li>Archive order if appropriate</li>
            </ol>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-md">
              <h4 className="text-md font-semibold mb-2 text-blue-800">SLA Reminder</h4>
              <p className="text-blue-700">
                Remember that agents have a 24-hour SLA to respond at each order stage. 
                If more time is needed, please share an update with the customer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}