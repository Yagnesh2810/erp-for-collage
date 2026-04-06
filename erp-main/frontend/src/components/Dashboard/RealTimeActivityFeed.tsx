"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  UserPlus, 
  TrendingUp, 
  AlertTriangle,
  Briefcase,
  RefreshCw
} from 'lucide-react';

interface RealTimeEvent {
  type: string;
  data: any;
  timestamp: Date;
}

interface RealTimeActivityFeedProps {
  events: RealTimeEvent[];
  isConnected: boolean;
}

const RealTimeActivityFeed: React.FC<RealTimeActivityFeedProps> = ({ events, isConnected }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'order:new':
        return <ShoppingCart className="h-4 w-4 text-green-600" />;
      case 'order:updated':
        return <ShoppingCart className="h-4 w-4 text-blue-600" />;
      case 'customer:new':
        return <UserPlus className="h-4 w-4 text-purple-600" />;
      case 'inventory:updated':
        return <Package className="h-4 w-4 text-orange-600" />;
      case 'inventory:low-stock':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'employee:created':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'employee:updated':
        return <Users className="h-4 w-4 text-indigo-600" />;
      case 'project:created':
        return <Briefcase className="h-4 w-4 text-green-600" />;
      case 'project:updated':
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case 'analytics:updated':
        return <TrendingUp className="h-4 w-4 text-cyan-600" />;
      case 'dashboard:refresh':
        return <RefreshCw className="h-4 w-4 text-gray-600" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getEventMessage = (event: RealTimeEvent) => {
    switch (event.type) {
      case 'order:new':
        return `New order #${event.data.orderNumber} from ${event.data.customer?.name || 'Customer'}`;
      case 'order:updated':
        return `Order #${event.data.orderNumber || event.data._id} status changed to ${event.data.status}`;
      case 'customer:new':
        return `New customer ${event.data.name} registered`;
      case 'inventory:updated':
        return `Inventory updated for ${event.data.productId?.name || 'product'}`;
      case 'inventory:low-stock':
        return `Low stock alert: ${event.data.name || 'Product'} (${event.data.quantity} remaining)`;
      case 'employee:created':
        return `New employee ${event.data.firstName} ${event.data.lastName} added`;
      case 'employee:updated':
        return `Employee ${event.data.firstName} ${event.data.lastName} updated`;
      case 'project:created':
        return `New project "${event.data.name}" created`;
      case 'project:updated':
        return `Project "${event.data.name}" updated`;
      case 'analytics:updated':
        return 'Analytics data refreshed';
      case 'dashboard:refresh':
        return 'Dashboard data refreshed';
      default:
        return `${event.type} event occurred`;
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'order:new':
        return <Badge variant="default" className="text-xs">New Order</Badge>;
      case 'order:updated':
        return <Badge variant="secondary" className="text-xs">Order Update</Badge>;
      case 'customer:new':
        return <Badge variant="default" className="text-xs">New Customer</Badge>;
      case 'inventory:updated':
        return <Badge variant="outline" className="text-xs">Inventory</Badge>;
      case 'inventory:low-stock':
        return <Badge variant="destructive" className="text-xs">Low Stock</Badge>;
      case 'employee:created':
        return <Badge variant="default" className="text-xs">New Employee</Badge>;
      case 'employee:updated':
        return <Badge variant="secondary" className="text-xs">Employee Update</Badge>;
      case 'project:created':
        return <Badge variant="default" className="text-xs">New Project</Badge>;
      case 'project:updated':
        return <Badge variant="secondary" className="text-xs">Project Update</Badge>;
      case 'analytics:updated':
        return <Badge variant="outline" className="text-xs">Analytics</Badge>;
      case 'dashboard:refresh':
        return <Badge variant="outline" className="text-xs">Refresh</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Event</Badge>;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <Card className="h-96">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Real-time Activity</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80 px-6">
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Events will appear here in real-time</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {events.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      {getEventBadge(event.type)}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {getEventMessage(event)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RealTimeActivityFeed;