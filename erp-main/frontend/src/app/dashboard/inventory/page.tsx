//path: frontend\src\app\dashboard\inventory\page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import inventoryService, { InventoryItem, InventorySummary } from "@/lib/services/inventoryService";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  Package, 
  Search, 
  Plus, 
  Loader2,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  BarChart2,
  Clock,
  ArrowRight,
  Edit
} from "lucide-react";
import { 
  LineChart, 
  BarChart,
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from "recharts";

const InventoryDashboard = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // State variables
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [totalItems, setTotalItems] = useState(0);
  const [currentTab, setCurrentTab] = useState("overview");

  // Fetch inventory data
  const fetchInventory = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await inventoryService.getInventory(
        currentPage, 
        10, 
        statusFilter === "all" ? "" : statusFilter, 
        locationFilter === "all" ? "" : locationFilter, 
        searchQuery
      );
      
      setInventory(response.data);
      setTotalPages(response.pages);
      setTotalItems(response.total);
      setError("");
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setError("Failed to fetch inventory data");
    } finally {
      setLoading(false);
    }
  }, [currentPage, isAuthenticated, locationFilter, searchQuery, statusFilter]);
  
  // Fetch summary data
  const fetchSummary = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await inventoryService.getInventorySummary();
      setSummary(response.data);
    } catch (err) {
      console.error("Failed to fetch inventory summary:", err);
    }
  }, [isAuthenticated]);
  
  // Load data on component mount and when filters change
  useEffect(() => {
    if (isAuthenticated) {
      fetchInventory();
      fetchSummary();
    }
  }, [isAuthenticated, fetchInventory, fetchSummary]);
  
  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchInventory();
  };
  
  // Handle search with Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Create chart data from summary
  const getChartData = () => {
    if (!summary) return [];
    
    return [
      { name: 'In Stock', value: summary.healthyStockCount, fill: '#10B981' },
      { name: 'Low Stock', value: summary.lowStockCount, fill: '#F59E0B' },
      { name: 'Out of Stock', value: summary.outOfStockCount, fill: '#EF4444' },
    ];
  };
  
  // Get top products chart data
  const getTopProductsData = () => {
    if (!summary || !summary.topProducts) return [];
    return summary.topProducts.map(product => ({
      name: product.productName,
      value: product.quantity,
      amount: product.value
    }));
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="flex-1 space-y-4 p-6 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
            <p className="text-muted-foreground mt-1">
              Manage your stock levels and product inventory
            </p>
          </div>
          {isAuthenticated && (
            <Button 
              onClick={() => router.push('/dashboard/inventory/add')}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add Inventory
            </Button>
          )}
        </div>

        {/* Login Prompt */}
        {!isAuthenticated && (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">You are not logged in</h2>
              <p className="text-muted-foreground mb-4">Please log in to view inventory data.</p>
              <Button
                onClick={() => router.push("/login")}
                className="bg-primary hover:bg-primary/90 text-white py-2 px-6 rounded-md"
              >
                Login
              </Button>
            </CardContent>
          </Card>
        )}

        {isAuthenticated && (
          <Tabs defaultValue="overview" className="space-y-4" onValueChange={setCurrentTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="items">Inventory Items</TabsTrigger>
              <TabsTrigger value="lowstock">Low Stock</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Stats Cards */}
              {summary && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary.totalItems}</div>
                      <p className="text-xs text-muted-foreground">
                        Total inventory items
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow duration-200" onClick={() => setCurrentTab("lowstock")} style={{cursor: "pointer"}}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary.lowStockCount}</div>
                      <p className="text-xs text-amber-500">
                        Items below reorder point
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow duration-200" onClick={() => setCurrentTab("lowstock")} style={{cursor: "pointer"}}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary.outOfStockCount}</div>
                      <p className="text-xs text-red-500">
                        Items that need immediate attention
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(summary.totalValue)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Current inventory value
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Inventory Status Chart */}
                <Card className="col-span-4 hover:shadow-md transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle>Inventory Status</CardTitle>
                    <CardDescription>Current inventory levels by status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getChartData()}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [value, "Items"]}
                          />
                          <Legend />
                          <Bar dataKey="value" name="Items" fill="#8884d8" radius={[4, 4, 0, 0]}>
                            {getChartData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Products Chart */}
                <Card className="col-span-3 hover:shadow-md transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>Products with highest quantity in stock</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={getTopProductsData()}
                          margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                          <Tooltip 
                            formatter={(value, name, props) => {
                              if (name === "value") return [value, "Quantity"];
                              if (name === "amount") return [formatCurrency(value as number), "Value"];
                              return [value, name];
                            }}
                          />
                          <Legend />
                          <Bar dataKey="value" name="Quantity" fill="#8884d8" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common inventory tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button
                      onClick={() => router.push("/dashboard/inventory/add")}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" /> Add Inventory
                    </Button>
                    <Button
                      onClick={() => setCurrentTab("lowstock")}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                      variant="outline"
                    >
                      <AlertTriangle className="h-4 w-4" /> View Low Stock
                    </Button>
                    <Button
                      onClick={() => router.push("/dashboard/products/add")}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <Package className="h-4 w-4" /> Add Product
                    </Button>
                    <Button
                      onClick={() => router.push("/reports/inventory")}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      variant="outline"
                    >
                      <BarChart2 className="h-4 w-4" /> Inventory Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Items Tab */}
            <TabsContent value="items" className="space-y-4">
              {/* Filters */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>Inventory Filters</CardTitle>
                  <CardDescription>Search and filter your inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        className="w-full bg-background text-foreground"
                      />
                      <Button variant="outline" onClick={handleSearch}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Select 
                      value={statusFilter} 
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="bg-background text-foreground">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="in-stock">In Stock</SelectItem>
                        <SelectItem value="low-stock">Low Stock</SelectItem>
                        <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={locationFilter} 
                      onValueChange={setLocationFilter}
                    >
                      <SelectTrigger className="bg-background text-foreground">
                        <SelectValue placeholder="Filter by location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                        <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                        <SelectItem value="Store Front">Store Front</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory Table */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>Inventory Items</CardTitle>
                  <CardDescription>
                    Showing {inventory.length} of {totalItems} items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : error ? (
                    <div className="flex justify-center items-center h-32 text-red-500">
                      <AlertCircle className="h-6 w-6 mr-2" />
                      {error}
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-border">
                          <thead>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Quantity</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Updated</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-card divide-y divide-border">
                          {inventory.map((item) => (
  <tr key={item._id} className="hover:bg-muted">
    <td className="px-4 py-3 whitespace-nowrap">
      {item.productId?.name || 'Unknown Product'}
    </td>
    <td className="px-4 py-3 whitespace-nowrap">
      {item.productId?.sku || 'N/A'}
    </td>
    <td className="px-4 py-3 whitespace-nowrap">
      {item.quantity}
    </td>
    <td className="px-4 py-3 whitespace-nowrap">
      <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusBadgeColor(item.status)}`}>
        {item.status === 'in-stock' ? 'In Stock' : 
         item.status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
      </span>
    </td>
    <td className="px-4 py-3 whitespace-nowrap">
      {item.location}
    </td>
    <td className="px-4 py-3 whitespace-nowrap">
      {new Date(item.lastUpdated).toLocaleDateString()}
    </td>
    <td className="px-4 py-3 whitespace-nowrap">
      <div className="flex space-x-2">
        <button
          onClick={() => router.push(`/dashboard/inventory/${item._id}`)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View
        </button>
        <button
          onClick={() => router.push(`/dashboard/inventory/${item._id}`)}
          className="text-green-600 hover:text-green-800 text-sm font-medium ml-2"
        >
          Edit Stock
        </button>
      </div>
    </td>
  </tr>
))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }).map((_, index) => (
                              <Button
                                key={index}
                                variant={currentPage === index + 1 ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(index + 1)}
                                className="w-8 h-8 p-0"
                              >
                                {index + 1}
                              </Button>
                            )).slice(
                              Math.max(0, currentPage - 3),
                              Math.min(totalPages, currentPage + 2)
                            )}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Low Stock Tab */}
            <TabsContent value="lowstock" className="space-y-4">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>Low Stock Items</CardTitle>
                  <CardDescription>Items that need to be reordered soon</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full divide-y divide-border">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Stock</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Reorder Point</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                        {inventory
  .filter(item => item.status === 'low-stock' || item.status === 'out-of-stock')
  .map((item) => (
    <tr key={item._id} className="hover:bg-muted">
      <td className="px-4 py-3 whitespace-nowrap">
        {item.productId?.name || 'Unknown Product'}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {item.quantity}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {item.reorderPoint}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {item.location}
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusBadgeColor(item.status)}`}>
          {item.status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <Button 
          size="sm"
          variant="outline"
          onClick={() => router.push(`/dashboard/inventory/${item._id}`)}
        >
          <Edit className="h-4 w-4 mr-1" /> Edit Stock
        </Button>
      </td>
    </tr>
  ))}
                        </tbody>
                      </table>
                      
                      {inventory.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length === 0 && (
                        <div className="text-center py-8">
                          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-medium text-foreground">No low stock items</h3>
                          <p className="text-sm text-muted-foreground mt-1">All items are adequately stocked</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Reordering Information */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>Reordering Information</CardTitle>
                  <CardDescription>Guidelines for restocking inventory</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-md border-l-4 border-blue-500 hover:bg-muted/80 transition-colors duration-200">
                      <h3 className="font-medium text-foreground mb-2">Reorder Process</h3>
                      <p className="text-muted-foreground text-sm">Items marked as "Low Stock" should be reordered within 5 business days to avoid stockouts.</p>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-md border-l-4 border-amber-500 hover:bg-muted/80 transition-colors duration-200">
                      <h3 className="font-medium text-foreground mb-2">Priority Restocking</h3>
                      <p className="text-muted-foreground text-sm">Items that are "Out of Stock" should be prioritized for immediate reordering.</p>
                    </div>
                    
                    <Button className="w-full" onClick={() => router.push('/dashboard/suppliers')}>
                      Contact Suppliers
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default InventoryDashboard;