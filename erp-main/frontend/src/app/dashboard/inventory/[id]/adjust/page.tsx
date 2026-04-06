'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { type InventoryItem } from '@/lib/services/inventoryService';
import { adjustInventory, getInventoryById } from '@/lib/services/inventoryService';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Loader2, AlertCircle, ArrowLeft, Package, PlusCircle, MinusCircle, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

interface AdjustInventoryData {
  quantity: number;
  type: 'receive' | 'issue' | 'adjustment' | 'transfer' | 'return';
  reason: string;
  notes?: string;
}

const AdjustInventoryPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const inventoryId = Array.isArray(id) ? id[0] : id;
  
  // State variables
  const [inventory, setInventory] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Initialize form
  const form = useForm<AdjustInventoryData>({
    defaultValues: {
      quantity: 1,
      type: 'receive',
      reason: '',
      notes: ''
    }
  });
  
  // Fetch inventory data
  const fetchInventory = async () => {
    if (!inventoryId) {
      setError('No inventory ID provided');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getInventoryById(inventoryId);
      setInventory(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch inventory data');
      setLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    if (inventoryId) {
      fetchInventory();
    }
  }, [inventoryId]);
  
  // Handle form submission
  const onSubmit = async (data: AdjustInventoryData) => {
    setSubmitting(true);
    
    if (!inventoryId) {
      toast.error("Invalid inventory ID");
      setSubmitting(false);
      return;
    }
    
    // Prepare data ensuring quantity is a number
    const adjustmentData = {
      ...data,
      quantity: Number(data.quantity)
    };
    
    console.log("Submitting inventory adjustment:", {
      inventoryId,
      adjustmentData
    });
    
    try {
      const response = await adjustInventory(inventoryId, adjustmentData);
      console.log("Adjustment response:", response);
      
      toast.success("The inventory has been updated successfully.", {
        position: "top-right",
        autoClose: 3000
      });
      
      // No need to manually emit any events - the backend will handle it
      // The dashboard will receive socket events and update automatically
      
      router.push(`/dashboard/inventory/${inventoryId}`);
    } catch (err: any) {
      console.error("Adjustment error:", err.response?.data || err.message);
      
      let errorMessage = "There was a problem adjusting the inventory.";
      
      // Extract error message from response if available
      if (err.response && err.response.data) {
        if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000
      });
      
      setSubmitting(false);
    }
  };
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <Badge className="bg-green-500">In Stock</Badge>;
      case 'low-stock':
        return <Badge className="bg-yellow-500">Low Stock</Badge>;
      case 'out-of-stock':
        return <Badge className="bg-red-500">Out of Stock</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Get transaction type icon
  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'receive':
        return <PlusCircle className="h-4 w-4" />;
      case 'issue':
        return <MinusCircle className="h-4 w-4" />;
      case 'adjustment':
        return <Edit className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !inventory) {
    const errorCode = error ? 'ERR_FETCH_INVENTORY' : 'ERR_NOT_FOUND';
    const errorMessage = {
        'ERR_FETCH_INVENTORY': 'Failed to fetch inventory data',
        'ERR_NOT_FOUND': 'Inventory not found'
    };

    return (
        <div className="flex flex-col justify-center items-center h-96">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-center">
                {errorMessage[errorCode]}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">Error Code: {errorCode}</p>
            <Link href="/dashboard/inventory">
                <Button className="mt-4">Back to Inventory</Button>
            </Link>
        </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Link href={`/dashboard/inventory/${inventoryId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Adjust Inventory</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Inventory Status</CardTitle>
            <CardDescription>
              {inventory.productId.name} ({inventory.productId.sku})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                <p className="text-sm font-medium text-muted-foreground">Minimum Stock Level</p>
                <p className="text-lg mt-1">{inventory.minimumStockLevel}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reorder Point</p>
                <p className="text-lg mt-1">{inventory.reorderPoint}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Adjust Stock</CardTitle>
            <CardDescription>
              Update the inventory quantity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transaction type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="receive">
                            <div className="flex items-center space-x-2">
                              <PlusCircle className="h-4 w-4 text-green-500" />
                              <span>Receive - Add to stock</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="issue">
                            <div className="flex items-center space-x-2">
                              <MinusCircle className="h-4 w-4 text-blue-500" />
                              <span>Issue - Remove from stock</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="adjustment">
                            <div className="flex items-center space-x-2">
                              <Edit className="h-4 w-4 text-purple-500" />
                              <span>Adjustment - Set exact value</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="transfer">
                            <div className="flex items-center space-x-2">
                              <span>Transfer - Move between locations</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="return">
                            <div className="flex items-center space-x-2">
                              <span>Return - Return to stock</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {field.value === 'receive' && "Add stock to the inventory"}
                        {field.value === 'issue' && "Remove stock from the inventory"}
                        {field.value === 'adjustment' && "Set stock to an exact value"}
                        {field.value === 'transfer' && "Move stock to another location"}
                        {field.value === 'return' && "Return stock to the inventory"}
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
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          min={1}
                          className="bg-background text-foreground"
                        />
                      </FormControl>
                      <FormDescription>
                        {form.watch('type') === 'adjustment' 
                          ? "The exact quantity to set" 
                          : "The quantity to add or remove"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Reason for adjustment" 
                          className="bg-background text-foreground"
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a reason for this inventory adjustment
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
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Additional notes (optional)"
                          className="bg-background text-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Link href={`/dashboard/inventory/${inventoryId}`}>
                    <Button type="button" variant="outline">Cancel</Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="flex items-center space-x-2"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>Submit Adjustment</span>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdjustInventoryPage;