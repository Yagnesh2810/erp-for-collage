"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import inventoryService from "@/lib/services/inventoryService";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Package, AlertCircle, AlertTriangle } from "lucide-react";
import { useForm as useHookForm } from "react-hook-form";
import { toast } from 'react-toastify';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

// Form schema
const formSchema = z.object({
  productId: z.string().min(1, { message: 'Product is required' }),
  quantity: z.number().min(0, { message: 'Quantity must be at least 0' }),
  location: z.string().min(1, { message: 'Location is required' }),
  minimumStockLevel: z.number().min(0, { message: 'Minimum stock level must be at least 0' }),
  maximumStockLevel: z.number().min(0, { message: 'Maximum stock level must be at least 0' }),
  reorderPoint: z.number().min(0, { message: 'Reorder point must be at least 0' }),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
  forceUpdate: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Product {
  _id: string;
  name: string;
  sku: string;
}

interface ExistingInventory {
  _id: string;
  productId: string;
  quantity: number;
  location: string;
  minimumStockLevel: number;
  maximumStockLevel: number;
  reorderPoint: number;
  status: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

const AddInventoryPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State variables
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Confirmation dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [existingInventory, setExistingInventory] = useState<ExistingInventory | null>(null);
  
  // Initialize form
  const form = useHookForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: '',
      quantity: 0,
      location: '',
      minimumStockLevel: 5,
      maximumStockLevel: 100,
      reorderPoint: 10,
      batchNumber: '',
      expiryDate: '',
      notes: '',
      forceUpdate: false,
    },
  });
  
  // Fetch products
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
        setProducts(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to fetch products");
        toast.error("Failed to fetch products. There was a problem fetching products.");
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [isAuthenticated]);
  
  // Get product name by ID (for display in confirmation)
  const getProductName = (productId: string) => {
    const product = products.find(p => p._id === productId);
    return product ? product.name : 'Unknown Product';
  };
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!isAuthenticated) return;
    
    setSubmitting(true);
    try {
      // Make API call to create inventory
      const response = await inventoryService.createInventory({
        ...data,
        forceUpdate: data.forceUpdate || false,
      });
      
      // Check if we need to confirm update of existing inventory
      if (response.confirmUpdate) {
        setExistingInventory(response.data);
        setShowConfirmDialog(true);
        setSubmitting(false);
        return;
      }
      
      // Success case - inventory created
      toast.success("The inventory item has been created successfully.");
      router.push("/dashboard/inventory");
    } catch (err: any) {
      console.error("Failed to create inventory:", err);
      toast.error(err.response?.data?.error || "There was a problem creating the inventory.");
      setSubmitting(false);
    }
  };
  
  // Handle confirmation to update existing inventory
  const handleConfirmUpdate = async () => {
    setSubmitting(true);
    try {
      // Update form data with forceUpdate flag
      const formData = form.getValues();
      
      // Call API with forceUpdate=true
      const response = await inventoryService.createInventory({
        ...formData,
        forceUpdate: true,
      });
      
      if (response.success) {
        toast.success("Existing inventory updated successfully.");
        router.push("/dashboard/inventory");
      } else {
        toast.error(response.error || "Failed to update inventory.");
        setShowConfirmDialog(false);
        setSubmitting(false);
      }
    } catch (err: any) {
      console.error("Failed to update inventory:", err);
      toast.error(err.response?.data?.error || "There was a problem updating the inventory.");
      setShowConfirmDialog(false);
      setSubmitting(false);
    }
  };
  
  // Cancel update
  const handleCancelUpdate = () => {
    setShowConfirmDialog(false);
    setExistingInventory(null);
    setSubmitting(false);
  };
  
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex-1 space-y-4 p-6 pt-6">
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">You are not logged in</h2>
              <p className="text-muted-foreground mb-4">Please log in to add inventory.</p>
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
  
  return (
    <Layout>
      <div className="flex-1 space-y-4 p-6 pt-6">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/inventory">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Add New Inventory</h2>
        </div>
        
        {error ? (
          <div className="flex flex-col justify-center items-center h-64">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-center">{error}</h2>
            <Button className="mt-4" onClick={() => router.push("/dashboard/inventory")}>
              Back to Inventory
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Add Inventory</CardTitle>
              <CardDescription>
                Create a new inventory record for a product
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="productId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-background text-foreground">
                                    <SelectValue placeholder="Select a product" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem key={product._id} value={product._id}>
                                      <div className="flex items-center space-x-2">
                                        <Package className="h-4 w-4" />
                                        <span>{product.name} ({product.sku})</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Select the product to add to inventory
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Initial Quantity</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  min={0}
                                  className="bg-background text-foreground"
                                />
                              </FormControl>
                              <FormDescription>
                                The initial quantity to add to inventory
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-background text-foreground">
                                    <SelectValue placeholder="Select a location" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                                  <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                                  <SelectItem value="Store Front">Store Front</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Where this inventory is located
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="batchNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Batch Number (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Batch number"
                                  className="bg-background text-foreground"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="expiryDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiry Date (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field}
                                  className="bg-background text-foreground"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
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
                              <FormDescription>
                                The minimum stock level before restocking is needed
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
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
                              <FormDescription>
                                The maximum stock level to maintain
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
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
                              <FormDescription>
                                The quantity at which reordering should be triggered
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Additional notes about this inventory"
                                  rows={4}
                                  className="bg-background text-foreground"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Link href="/dashboard/inventory">
                        <Button type="button" variant="outline">Cancel</Button>
                      </Link>
                      <Button 
                        type="submit" 
                        disabled={submitting}
                        className="flex items-center space-x-2"
                      >
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        <span>Create Inventory</span>
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Confirmation Dialog for Existing Inventory */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>Inventory Already Exists</span>
              </DialogTitle>
              <DialogDescription>
                This product already has inventory at this location.
              </DialogDescription>
            </DialogHeader>
            
            {existingInventory && (
              <div className="space-y-4 py-2">
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium text-sm mb-2">Current Inventory:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Quantity:</div>
                    <div className="font-medium">{existingInventory.quantity}</div>
                    
                    <div>Min Stock Level:</div>
                    <div className="font-medium">{existingInventory.minimumStockLevel}</div>
                    
                    <div>Max Stock Level:</div>
                    <div className="font-medium">{existingInventory.maximumStockLevel}</div>
                    
                    <div>Reorder Point:</div>
                    <div className="font-medium">{existingInventory.reorderPoint}</div>
                    
                    {existingInventory.batchNumber && (
                      <>
                        <div>Batch Number:</div>
                        <div className="font-medium">{existingInventory.batchNumber}</div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md border-l-4 border-blue-500">
                  <h4 className="font-medium text-sm text-foreground mb-2">New Values:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Quantity:</div>
                    <div className="font-medium">{form.getValues().quantity}</div>
                    
                    <div>Min Stock Level:</div>
                    <div className="font-medium">{form.getValues().minimumStockLevel}</div>
                    
                    <div>Max Stock Level:</div>
                    <div className="font-medium">{form.getValues().maximumStockLevel}</div>
                    
                    <div>Reorder Point:</div>
                    <div className="font-medium">{form.getValues().reorderPoint}</div>
                    
                    {form.getValues().batchNumber && (
                      <>
                        <div>Batch Number:</div>
                        <div className="font-medium">{form.getValues().batchNumber}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="sm:justify-end">
              <Button
                variant="outline" 
                onClick={handleCancelUpdate}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUpdate}
                disabled={submitting}
                className="flex items-center space-x-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Update Existing Inventory</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AddInventoryPage;