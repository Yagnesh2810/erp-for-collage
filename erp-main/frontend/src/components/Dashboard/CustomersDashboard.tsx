"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Mail, 
  Phone,
  MapPin,
  RefreshCw,
  Eye,
  Edit,
  AlertCircle
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getCustomerStats } from "@/lib/api/index";
import { getSocket } from "@/lib/socket";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  totalRevenue: number;
  recentCustomers: Customer[];
}

interface CustomersDashboardProps {
  isAuthenticated: boolean;
}

const CustomersDashboard: React.FC<CustomersDashboardProps> = ({ isAuthenticated }) => {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomersThisMonth: 0,
    totalRevenue: 0,
    recentCustomers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomersData = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const statsData = await getCustomerStats();
      
      // Mock recent customers data (replace with actual API call)
      const mockRecentCustomers: Customer[] = [
        {
          _id: "1",
          name: "John Doe",
          email: "john@example.com",
          phone: "+1 234-567-8900",
          address: "123 Main St, City, State",
          totalOrders: 5,
          totalSpent: 1250.00,
          status: "active",
          createdAt: new Date().toISOString()
        },
        {
          _id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+1 234-567-8901",
          address: "456 Oak Ave, City, State",
          totalOrders: 3,
          totalSpent: 890.50,
          status: "active",
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          _id: "3",
          name: "Bob Johnson",
          email: "bob@example.com",
          phone: "+1 234-567-8902",
          totalOrders: 8,
          totalSpent: 2100.75,
          status: "active",
          createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
          _id: "4",
          name: "Alice Brown",
          email: "alice@example.com",
          totalOrders: 2,
          totalSpent: 450.25,
          status: "inactive",
          createdAt: new Date(Date.now() - 259200000).toISOString()
        },
        {
          _id: "5",
          name: "Charlie Wilson",
          email: "charlie@example.com",
          phone: "+1 234-567-8904",
          totalOrders: 12,
          totalSpent: 3200.00,
          status: "active",
          createdAt: new Date(Date.now() - 345600000).toISOString()
        }
      ];

      setCustomers(mockRecentCustomers);
      setStats({
        totalCustomers: statsData?.totalCount || 156,
        activeCustomers: statsData?.activeCount || 142,
        newCustomersThisMonth: statsData?.newThisMonth || 23,
        totalRevenue: statsData?.totalRevenue || 45680.50,
        recentCustomers: mockRecentCustomers
      });
    } catch (err: any) {
      console.error("Error fetching customers data:", err);
      setError("Failed to load customers data");
      toast({
        title: "Error",
        description: "Failed to load customers data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCustomersData();
  }, [fetchCustomersData]);

  // Real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (socket) {
      const handleNewCustomer = (customer: Customer) => {
        setCustomers(prev => [customer, ...prev.slice(0, 4)]);
        setStats(prev => ({
          ...prev,
          totalCustomers: prev.totalCustomers + 1,
          activeCustomers: customer.status === "active" ? prev.activeCustomers + 1 : prev.activeCustomers,
          recentCustomers: [customer, ...prev.recentCustomers.slice(0, 4)]
        }));
        toast({
          title: "New Customer",
          description: `${customer.name} has been added`,
        });
      };

      const handleCustomerUpdated = (customer: Customer) => {
        setCustomers(prev => prev.map(c => c._id === customer._id ? customer : c));
        setStats(prev => ({
          ...prev,
          recentCustomers: prev.recentCustomers.map(c => c._id === customer._id ? customer : c)
        }));
      };

      socket.on("customer:new", handleNewCustomer);
      socket.on("customer:updated", handleCustomerUpdated);

      return () => {
        socket.off("customer:new", handleNewCustomer);
        socket.off("customer:updated", handleCustomerUpdated);
      };
    }
  }, [isAuthenticated]);

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  if (!isAuthenticated) {
    return (
      <Card className="theme-card theme-shadow theme-transition">
        <CardContent className="p-8 text-center">
          <Users className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-2 text-foreground">Customer Management</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Please log in to access customer management features.
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
              fetchCustomersData();
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="theme-card theme-shadow theme-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.totalCustomers}</p>
                )}
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="theme-card theme-shadow theme-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                {loading ? (
                  <Skeleton className="h-8 w-16 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.activeCustomers}</p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="theme-card theme-shadow theme-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                {loading ? (
                  <Skeleton className="h-8 w-12 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.newCustomersThisMonth}</p>
                )}
              </div>
              <UserPlus className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="theme-card theme-shadow theme-transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer Revenue</p>
                {loading ? (
                  <Skeleton className="h-8 w-20 mt-2" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      <Card className="theme-card theme-shadow theme-transition">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="theme-text">Recent Customers</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCustomersData}
              disabled={loading}
              className="theme-button theme-focusable theme-transition"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => router.push("/dashboard/customers/new")}
              size="sm"
              className="theme-button theme-focusable theme-transition"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No customers found</p>
              <Button
                onClick={() => router.push("/dashboard/customers/new")}
                className="mt-4 theme-button theme-focusable theme-transition"
              >
                Add First Customer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {customers.map((customer) => (
                <div key={customer._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 theme-transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-foreground">{customer.name}</h4>
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{customer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {customer.totalOrders} orders
                    </p>
                    <p className="font-semibold text-foreground">${customer.totalSpent.toLocaleString()}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/customers/${customer._id}`)}
                        className="theme-button theme-focusable theme-transition"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/customers/${customer._id}/edit`)}
                        className="theme-button theme-focusable theme-transition"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {customers.length > 0 && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/customers")}
                className="theme-button theme-focusable theme-transition"
              >
                View All Customers
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersDashboard;