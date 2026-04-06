"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import inventoryService, { 
  InventoryItem, 
  InventoryTransaction 
} from "@/lib/services/inventoryService";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  AlertCircle, 
  Package, 
  ArrowLeft, 
  Trash, 
  Edit, 
  Clock, 
  AlertTriangle,
  Info
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface UpdateInventoryData {
  quantity: number;
  minimumStockLevel: number;
  maximumStockLevel: number;
  reorderPoint: number;
  location: string;
  notes?: string;
}

interface SellItemsData {
  quantity: number;
  customerInfo: string;
  reason: string;
}

const InventoryDetailPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const inventoryId = params?.id as string;
  
  // State variables
  const [inventory, setInventory] = useState<InventoryItem | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const [transactionPage, setTransactionPage] = useState(1);
  const [totalTransactionPages, setTotalTransactionPages] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [sellData, setSellData] = useState<SellItemsData>({
    quantity: 1,
    customerInfo: '',
    reason: 'Sale to customer'
  });

  // Initialize forms
  const updateForm = useForm<UpdateInventoryData>({
    defaultValues: {
      quantity: 0,
      minimumStockLevel: 5,
      maximumStockLevel: 100,
      reorderPoint: 10,
      location: "",
      notes: ""
    }
  });

  const sellForm = useForm<SellItemsData>({
    defaultValues: {
      quantity: 1,
      customerInfo: '',
      reason: 'Sale to customer'
    }
  });
  
  // Fetch inventory data
  const fetchInventory = useCallback(async () => {
    if (!isAuthenticated || !inventoryId) return;
    
    setLoading(true);
    try {
      const response = await inventoryService.getInventoryById(inventoryId);
      setInventory(response.data);
      
      // Set form default values
      updateForm.reset({
        quantity: response.data.quantity,
        minimumStockLevel: response.data.minimumStockLevel,
        maximumStockLevel: response.data.maximumStockLevel,
        reorderPoint: response.data.reorderPoint,
        location: response.data.location,
        notes: response.data.notes || ""
      });
      
      setError("");
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setError("Failed to fetch inventory data");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, inventoryId, updateForm]);

  // Fetch transaction history
  const fetchTransactions = useCallback(async () => {
    if (!isAuthenticated || !inventoryId) return;
    
    try {
      const response = await inventoryService.getInventoryTransactions(inventoryId, transactionPage, 5);
      setTransactions(response.data);
      setTotalTransactionPages(response.pages);
    } catch (err) {
      console.error("Failed to fetch transaction history:", err);
      toast.error("Could not load transaction history");
    }
  }, [isAuthenticated, inventoryId, transactionPage]);
  
  // Handle selling items
  const handleSellItems = async (data: SellItemsData) => {
    if (!inventory) return;
    
    if (data.quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    
    if (data.quantity > inventory.quantity) {
      toast.error("Insufficient inventory available");
      return;
    }
    
    try {
      await inventoryService.adjustInventory(inventoryId, {
        quantity: data.quantity,
        type: 'issue',
        reason: data.reason,
        notes: data.customerInfo || 'Walk-in customer'
      });
      
      // Refresh data
      await fetchInventory();
      if (activeTab === "transactions") {
        await fetchTransactions();
      }
      
      toast.success(`${data.quantity} items sold successfully`);
      setIsSelling(false);
      sellForm.reset({
        quantity: 1,
        customerInfo: '',
        reason: 'Sale to customer'
      });
    } catch (err) {
      console.error("Failed to process sale:", err);
      toast.error("There was a problem processing the sale");
    }
  };
  
  // Handle form submission for updating inventory
  const onUpdateSubmit = async (data: UpdateInventoryData) => {
    try {
      // Handle quantity adjustment if it changed
      const quantityChange = data.quantity - (inventory?.quantity || 0);
      
      if (quantityChange !== 0) {
        // Call adjust inventory with the difference
        await inventoryService.adjustInventory(inventoryId, {
          quantity: Math.abs(quantityChange),
          type: quantityChange > 0 ? 'receive' : 'issue',
          reason: 'Manual stock edit',
          notes: data.notes || 'Stock quantity edited directly'
        });
      }
      
      // Update other inventory details
      const updateData = {
        minimumStockLevel: data.minimumStockLevel,
        maximumStockLevel: data.maximumStockLevel,
        reorderPoint: data.reorderPoint,
        location: data.location,
        notes: data.notes
      };
      
      await inventoryService.updateInventory(inventoryId, updateData);
      await fetchInventory();
      setIsEditing(false);
      toast.success("The inventory has been updated successfully.");
    } catch (err) {
      console.error("Failed to update inventory:", err);
      toast.error("There was a problem updating the inventory.");
    }
  };

  // Handle inventory deletion
  const handleDelete = async () => {
    try {
      await inventoryService.deleteInventory(inventoryId);
      toast.success("The inventory item has been deleted successfully.");
      router.push("/dashboard/inventory");
    } catch (err: any) {
      console.error("Failed to delete inventory:", err);
      toast.error(err.response?.data?.error || "There was a problem deleting the inventory.");
      setIsDeleting(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated && inventoryId) {
      fetchInventory();
    }
  }, [isAuthenticated, inventoryId, fetchInventory]);
  
  // Load transactions when page changes or tab is activated
  useEffect(() => {
    if (isAuthenticated && inventoryId && activeTab === "transactions") {
      fetchTransactions();
    }
  }, [isAuthenticated, inventoryId, activeTab, fetchTransactions]);
  
  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  // Helper functions for badges
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'in-stock': { bg: "bg-green-500", label: "In Stock" },
      'low-stock': { bg: "bg-yellow-500", label: "Low Stock" },
      'out-of-stock': { bg: "bg-red-500", label: "Out of Stock" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { bg: "", label: status };
    return <Badge className={config.bg}>{config.label}</Badge>;
  };
  
  const getTransactionTypeBadge = (type: string) => {
    const typeConfig = {
      'receive': { bg: "bg-green-500", label: "Receive" },
      'issue': { bg: "bg-blue-500", label: "Issue" },
      'adjustment': { bg: "bg-purple-500", label: "Adjustment" },
      'transfer': { bg: "bg-orange-500", label: "Transfer" },
      'return': { bg: "bg-cyan-500", label: "Return" }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || { bg: "", label: type };
    return <Badge className={config.bg}>{config.label}</Badge>;
  };
  
  // Loading state
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Authentication check
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex-1 space-y-4 p-6 pt-6">
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">You are not logged in</h2>
              <p className="text-muted-foreground mb-4">Please log in to view inventory details.</p>
              <Button
                onClick={() => router.push("/login")}
                className="bg-primary hover:bg-primary/90 text-white py-2 px-6 rounded-md"
              >
                Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Loading data state
  if (loading) {
    return (
      <Layout>
        <div className="flex-1 p-6">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }
  
  // Error or not found state
  if (error || !inventory) {
    return (
      <Layout>
        <div className="flex-1 p-6">
          <div className="flex flex-col justify-center items-center h-64">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-center">{error || "Inventory not found"}</h2>
            <Link href="/dashboard/inventory">
              <Button className="mt-4">Back to Inventory</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Main content
  return (
    <Layout>
      <div className="flex-1 space-y-4 p-6 pt-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard/inventory">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-2xl font-bold">{inventory.productId.name}</h2>
            {getStatusBadge(inventory.status)}
          </div>
          
          <div className="flex space-x-2">
            {/* Delete Dialog */}
            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 h-8 rounded-md px-3 text-xs">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete this inventory item
                    and all its transaction history.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleting(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Sell Dialog */}
            <Dialog open={isSelling} onOpenChange={setIsSelling}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs">
                  Sell Items
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sell Inventory Items</DialogTitle>
                  <DialogDescription>
                    Complete the form below to record a sale.
                  </DialogDescription>
                </DialogHeader>
                <Form {...sellForm}>
                  <form onSubmit={sellForm.handleSubmit(handleSellItems)} className="space-y-4">
                    <FormField
                      control={sellForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                              min={1} 
                              max={inventory.quantity}
                              className="bg-background text-foreground"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={sellForm.control}
                      name="customerInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Information</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Customer name, contact, etc." 
                              className="bg-background text-foreground"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={sellForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              defaultValue="Sale to customer" 
                              className="bg-background text-foreground"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsSelling(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Complete Sale</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Button size="sm" onClick={() => setIsEditing(true)}>Edit Stock</Button>
          </div>
        </div>
        
        {/* Tabs for details and transaction history */}
        <Tabs defaultValue="details" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            {/* Product Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Product Name</p>
                    <p className="text-lg font-semibold">{inventory.productId.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SKU</p>
                    <p className="text-lg">{inventory.productId.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-lg">{inventory.productId.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Price</p>
                    <p className="text-lg">{formatCurrency(inventory.productId.price)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Inventory Status Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Inventory Status</CardTitle>
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Stock
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...updateForm}>
                    <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={updateForm.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Quantity</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                                  min={0}
                                  className="bg-background text-foreground"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      
                        <FormField
                          control={updateForm.control}
                          name="minimumStockLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Minimum Stock Level</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                                  min={0}
                                  className="bg-background text-foreground"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={updateForm.control}
                          name="maximumStockLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Stock Level</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                                  min={0}
                                  className="bg-background text-foreground"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={updateForm.control}
                          name="reorderPoint"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reorder Point</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                                  min={0}
                                  className="bg-background text-foreground"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={updateForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                className="bg-background text-foreground"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={updateForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field}
                                className="bg-background text-foreground"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Quantity</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Package className="h-4 w-4" />
                          <p className="text-2xl font-bold">{inventory.quantity}</p>
                          <div>{getStatusBadge(inventory.status)}</div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p className="text-lg mt-1">{inventory.location}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="h-4 w-4" />
                          <p className="text-lg">
                            {new Date(inventory.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Minimum Stock Level</p>
                        <p className="text-lg mt-1">{inventory.minimumStockLevel}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Maximum Stock Level</p>
                        <p className="text-lg mt-1">{inventory.maximumStockLevel}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Reorder Point</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {inventory.quantity <= inventory.reorderPoint && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <p className="text-lg">{inventory.reorderPoint}</p>
                        </div>
                      </div>
                    </div>
                    
                    {inventory.notes && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-muted-foreground">Notes</p>
                        <p className="mt-1">{inventory.notes}</p>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                      <p className="text-xl font-bold mt-1">
                        {formatCurrency(inventory.quantity * inventory.productId.price)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted border-t border-border">
                <div className="flex w-full justify-between items-center">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mr-1" />
                    <span>
                      {inventory.status === 'in-stock' 
                        ? 'Healthy inventory levels'
                        : inventory.status === 'low-stock'
                        ? 'Stock level below reorder point'
                        : 'Out of stock - immediate action required'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsSelling(true)}
                    >
                      Sell Items
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Stock
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Recent inventory adjustments and movements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No transaction history available</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Previous</TableHead>
                            <TableHead>New</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Performed By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((transaction) => (
                            <TableRow key={transaction._id}>
                              <TableCell>
                                {new Date(transaction.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {getTransactionTypeBadge(transaction.type)}
                              </TableCell>
                              <TableCell>{transaction.quantity}</TableCell>
                              <TableCell>{transaction.previousQuantity}</TableCell>
                              <TableCell>{transaction.newQuantity}</TableCell>
                              <TableCell>{transaction.reason}</TableCell>
                              <TableCell>{transaction.performedBy.name}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Pagination */}
                    {totalTransactionPages > 1 && (
                      <div className="mt-4">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={() => setTransactionPage(Math.max(1, transactionPage - 1))}
                                className={transactionPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            
                            {Array.from({ length: totalTransactionPages })
                              .map((_, index) => (
                                <PaginationItem key={index}>
                                  <PaginationLink
                                    onClick={() => setTransactionPage(index + 1)}
                                    isActive={transactionPage === index + 1}
                                  >
                                    {index + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              ))
                              .slice(
                                Math.max(0, transactionPage - 3),
                                Math.min(totalTransactionPages, transactionPage + 2)
                              )}
                            
                            <PaginationItem>
                              <PaginationNext 
                                onClick={() => setTransactionPage(Math.min(totalTransactionPages, transactionPage + 1))}
                                className={transactionPage === totalTransactionPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default InventoryDetailPage;