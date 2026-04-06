"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productsAPI } from '@/lib/api/index';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Download, 
  Filter, 
  Search, 
  RefreshCw, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle, 
  XCircle,
  PlusCircle,
  Printer,
  FileText,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  Package,
  DollarSign,
  TrendingUp,
  BarChart3,
  ShoppingCart
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

interface Product {
  _id: string;
  name: string;
  price: number;
  costPrice: number;
  sku: string;
  category: string;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  supplier: any;
  isActive: boolean;
  description?: string;
  taxRate?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  totalCostValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  activeProducts: number;
  inactiveProducts: number;
  averagePrice: number;
  totalStockUnits: number;
  profitMargin: number;
}

function ProductsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [bulkActionProducts, setBulkActionProducts] = useState<string[]>([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalValue: 0,
    totalCostValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    averagePrice: 0,
    totalStockUnits: 0,
    profitMargin: 0
  });
  const [showFilters, setShowFilters] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'bulkDelete' | 'bulkActivate' | 'bulkDeactivate' | null;
    title: string;
    description: string;
    action: () => Promise<void>;
  } | null>(null);

  // Debounce search to improve performance
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Extract unique categories from products
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map(p => p.category))].filter(Boolean);
      setCategories(uniqueCategories);
      
      // Calculate dashboard stats
      calculateDashboardStats(products);
    }
  }, [products]);

  useEffect(() => {
    // Apply filters and sorting whenever their values change
    applyFiltersAndSort();
    
    // Reset page to 1 when filters change
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, stockFilter, activeFilter, sortBy, sortOrder, products]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Update selectedAll state when bulk actions change
  useEffect(() => {
    if (bulkActionProducts.length === currentItems.length && currentItems.length > 0) {
      setSelectedAll(true);
    } else {
      setSelectedAll(false);
    }
  }, [bulkActionProducts, currentItems]);

  const calculateDashboardStats = (productList: Product[]) => {
    const totalValue = productList.reduce((sum, product) => sum + (product.price * product.stockQuantity), 0);
    const totalCostValue = productList.reduce((sum, product) => sum + (product.costPrice * product.stockQuantity), 0);
    const totalStockUnits = productList.reduce((sum, product) => sum + product.stockQuantity, 0);
    const averagePrice = productList.length > 0 ? productList.reduce((sum, p) => sum + p.price, 0) / productList.length : 0;
    const profitMargin = totalValue > 0 ? ((totalValue - totalCostValue) / totalValue) * 100 : 0;
    
    const stats: DashboardStats = {
      totalProducts: productList.length,
      totalValue,
      totalCostValue,
      lowStockItems: productList.filter(p => p.stockQuantity < p.minStockLevel && p.stockQuantity > 0).length,
      outOfStockItems: productList.filter(p => p.stockQuantity <= 0).length,
      activeProducts: productList.filter(p => p.isActive).length,
      inactiveProducts: productList.filter(p => !p.isActive).length,
      averagePrice,
      totalStockUnits,
      profitMargin
    };
    
    setDashboardStats(stats);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products...');
      
      const response = await productsAPI.getAll();
      console.log('API response:', response);
      
      // The data seems to be an array of products
      let productsList: Product[] = [];
      
      // Check if the response is an array
      if (Array.isArray(response)) {
        productsList = response.map(transformProduct);
      } 
      // Or if it's an object with data property
      else if (response && typeof response === 'object') {
        // Check for products array property
        if (Array.isArray(response.products)) {
          productsList = response.products.map(transformProduct);
        } 
        // Check for data array property
        else if (Array.isArray(response.data)) {
          productsList = response.data.map(transformProduct);
        }
        // Or maybe it's just a single product
        else if (response._id) {
          productsList = [transformProduct(response)];
        }
      }
      
      console.log('Processed products:', productsList);
      setProducts(productsList);
      setFilteredProducts(productsList);
      
      // Clear bulk selections when data refreshes
      setBulkActionProducts([]);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Error loading products');
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchProducts();
    setIsRefreshing(false);
  };

  // Function to transform API response to match our interface
  const transformProduct = (item: any): Product => {
    // Extract the ID from ObjectId format if needed
    const id = typeof item._id === 'object' && item._id.$oid 
      ? item._id.$oid 
      : String(item._id);
    
    return {
      _id: id,
      name: item.name || '',
      price: Number(item.price) || 0,
      costPrice: Number(item.costPrice) || 0,
      sku: item.sku || '',
      category: item.category || '',
      stockQuantity: Number(item.stockQuantity) || 0,
      minStockLevel: Number(item.minStockLevel) || 0,
      unit: item.unit || '',
      supplier: item.supplier || null,
      // For isActive, check if it exists, if not, default to true
      isActive: item.isActive !== undefined ? item.isActive : true,
      // Optional fields
      description: item.description,
      taxRate: item.taxRate,
      imageUrl: item.imageUrl,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  };

  const handleDelete = (id: string) => {
    setConfirmAction({
      type: 'delete',
      title: 'Delete Product',
      description: 'This action cannot be undone. This will permanently delete the product from your inventory.',
      action: async () => {
        try {
          await productsAPI.delete(id);
          setProducts(products.filter(product => product._id !== id));
          // Also remove from bulk actions if it was selected
          setBulkActionProducts(prev => prev.filter(itemId => itemId !== id));
          toast({
            title: "Success",
            description: "Product deleted successfully",
          });
        } catch (err: any) {
          console.error('Error deleting product:', err);
          setError(err.response?.data?.message || 'Error deleting product');
          toast({
            title: "Error",
            description: "Failed to delete product",
            variant: "destructive",
          });
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (bulkActionProducts.length === 0) return;
    
    setConfirmAction({
      type: 'bulkDelete',
      title: `Delete ${bulkActionProducts.length} Products`,
      description: `This action cannot be undone. This will permanently delete ${bulkActionProducts.length} products from your inventory.`,
      action: async () => {
        try {
          // In a real app, you might want to use a bulk delete API
          // For now, we'll delete them one by one
          for (const id of bulkActionProducts) {
            await productsAPI.delete(id);
          }
          
          setProducts(products.filter(product => !bulkActionProducts.includes(product._id)));
          setBulkActionProducts([]);
          toast({
            title: "Success",
            description: `${bulkActionProducts.length} products deleted successfully`,
          });
        } catch (err: any) {
          console.error('Error performing bulk delete:', err);
          setError(err.response?.data?.message || 'Error deleting products');
          toast({
            title: "Error",
            description: "Failed to delete products",
            variant: "destructive",
          });
        }
      }
    });
  };

  const handleBulkActivate = (activate: boolean) => {
    if (bulkActionProducts.length === 0) return;
    
    setConfirmAction({
      type: activate ? 'bulkActivate' : 'bulkDeactivate',
      title: `${activate ? 'Activate' : 'Deactivate'} ${bulkActionProducts.length} Products`,
      description: `Are you sure you want to ${activate ? 'activate' : 'deactivate'} ${bulkActionProducts.length} products?`,
      action: async () => {
        try {
          // In a real app, you might want to use a bulk update API
          // For now, we'll update the state directly
          setProducts(products.map(product => {
            if (bulkActionProducts.includes(product._id)) {
              return { ...product, isActive: activate };
            }
            return product;
          }));
          
          // Clear the selection after action
          setBulkActionProducts([]);
          toast({
            title: "Success",
            description: `${bulkActionProducts.length} products ${activate ? 'activated' : 'deactivated'} successfully`,
          });
        } catch (err: any) {
          console.error(`Error performing bulk ${activate ? 'activate' : 'deactivate'}:`, err);
          setError(err.response?.data?.message || `Error ${activate ? 'activating' : 'deactivating'} products`);
          toast({
            title: "Error",
            description: `Failed to ${activate ? 'activate' : 'deactivate'} products`,
            variant: "destructive",
          });
        }
      }
    });
  };

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity <= 0) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Out of Stock
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Product is out of stock</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else if (product.stockQuantity < product.minStockLevel) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="secondary" className="bg-yellow-500 text-white flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Low Stock
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Below minimum level of {product.minStockLevel} {product.unit}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    } else {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="default" className="bg-green-500 text-white flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                In Stock
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Stock is at healthy levels</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...products];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(term) || 
          product.sku.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term) ||
          (product.description && product.description.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter);
    }

    // Apply stock filter
    if (stockFilter === 'low') {
      result = result.filter(product => product.stockQuantity < product.minStockLevel && product.stockQuantity > 0);
    } else if (stockFilter === 'out') {
      result = result.filter(product => product.stockQuantity <= 0);
    } else if (stockFilter === 'in') {
      result = result.filter(product => product.stockQuantity >= product.minStockLevel);
    }
    
    // Apply active/inactive filter
    if (activeFilter === 'active') {
      result = result.filter(product => product.isActive);
    } else if (activeFilter === 'inactive') {
      result = result.filter(product => !product.isActive);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'costPrice':
          comparison = a.costPrice - b.costPrice;
          break;
        case 'stock':
          comparison = a.stockQuantity - b.stockQuantity;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'profit':
          const profitA = a.price - a.costPrice;
          const profitB = b.price - b.costPrice;
          comparison = profitA - profitB;
          break;
        case 'profitMargin':
          const marginA = a.costPrice ? ((a.price - a.costPrice) / a.price) * 100 : 0;
          const marginB = b.costPrice ? ((b.price - b.costPrice) / b.price) * 100 : 0;
          comparison = marginA - marginB;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredProducts(result);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Price', 'Cost Price', 'Profit', 'Margin %', 'Stock', 'Min Stock', 'Unit', 'Active'];
    const csvData = filteredProducts.map(product => {
      const profit = product.price - product.costPrice;
      const margin = product.costPrice ? ((profit / product.price) * 100).toFixed(2) : '0.00';
      
      return [
        product.name,
        product.sku,
        product.category,
        product.price.toFixed(2),
        product.costPrice.toFixed(2),
        profit.toFixed(2),
        margin,
        product.stockQuantity,
        product.minStockLevel,
        product.unit,
        product.isActive ? 'Yes' : 'No'
      ];
    });

    // Add headers to the beginning
    csvData.unshift(headers);

    // Convert to CSV
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportToPDF = () => {
    // In a real application, you would implement PDF export here
    // This would typically use a library like jsPDF
    toast({
      title: "Info",
      description: "PDF export feature coming soon!",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setSelectedAll(isChecked);
    
    if (isChecked) {
      // Select all products on the current page
      setBulkActionProducts(currentItems.map(product => product._id));
    } else {
      // Deselect all
      setBulkActionProducts([]);
    }
  };

  const handleCheckProduct = (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const isChecked = e.target.checked;
    
    if (isChecked) {
      setBulkActionProducts(prev => [...prev, productId]);
    } else {
      setBulkActionProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setStockFilter('all');
    setActiveFilter('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  // Generate page numbers for pagination
  let pageNumbers = [];
  const maxPageNumbers = 5; // Show 5 page numbers at most

  if (totalPages <= maxPageNumbers) {
    // If we have 5 or fewer pages, show all
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // We have more than 5 pages
    if (currentPage <= 3) {
      // If we're on pages 1-3, show 1, 2, 3, 4, 5
      pageNumbers = [1, 2, 3, 4, 5];
    } else if (currentPage >= totalPages - 2) {
      // If we're on the last 3 pages, show the last 5 pages
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Otherwise show the current page and 2 on each side
      pageNumbers = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    }
  }

  const renderSortIcon = (column: string) => {
    if (sortBy === column) {
      return sortOrder === 'asc' ? (
        <ChevronUp className="inline h-4 w-4" />
      ) : (
        <ChevronDown className="inline h-4 w-4" />
      );
    }
    return null;
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Access Required</h2>
              <p className="text-muted-foreground mb-4">Please log in to access Product Management</p>
              <Button onClick={() => router.push("/login")}>Login</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading products...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Product Management</h1>
            <p className="text-muted-foreground">Manage your product catalog and inventory</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToCSV} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Export to PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint} className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link
              href="/dashboard/products/add"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Add New Product
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              className="float-right font-bold"
              onClick={() => setError(null)}
            >
              &times;
            </button>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">All Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock Alert</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                      <p className="text-2xl font-bold">{dashboardStats.totalProducts}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dashboardStats.activeProducts} active
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                      <p className="text-2xl font-bold">${dashboardStats.totalValue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cost: ${dashboardStats.totalCostValue.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                      <p className="text-2xl font-bold text-yellow-600">{dashboardStats.lowStockItems}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dashboardStats.outOfStockItems} out of stock
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Profit Margin</p>
                      <p className="text-2xl font-bold">{dashboardStats.profitMargin.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg: ${dashboardStats.averagePrice.toFixed(2)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Products */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Products</CardTitle>
                <CardDescription>Latest products added to your inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.slice(0, 5).map((product) => {
                    const profit = product.price - product.costPrice;
                    const profitMargin = product.costPrice ? ((profit / product.price) * 100).toFixed(1) : '0.0';
                    
                    return (
                      <div key={product._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.sku} - {product.category}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={product.isActive ? "default" : "secondary"}>
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {getStockStatus(product)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${product.price.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            Profit: ${profit.toFixed(2)} ({profitMargin}%)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Stock: {product.stockQuantity} {product.unit}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-0 h-8 w-8"
                  >
                    {showFilters ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronUp className="h-4 w-4" />
                    }
                  </Button>
                  <span>Filters</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-sm"
                >
                  Clear Filters
                </Button>
              </CardHeader>
              {showFilters && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => debouncedSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={stockFilter} onValueChange={setStockFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Stock Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stock</SelectItem>
                        <SelectItem value="in">In Stock</SelectItem>
                        <SelectItem value="low">Low Stock</SelectItem>
                        <SelectItem value="out">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={activeFilter} onValueChange={setActiveFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Active Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="inactive">Inactive Only</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="costPrice">Cost</SelectItem>
                        <SelectItem value="stock">Stock Level</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="profit">Profit</SelectItem>
                        <SelectItem value="profitMargin">Profit Margin %</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger>
                        <SelectValue placeholder="Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>Product Inventory</span>
                  <span className="text-sm font-normal text-gray-500">
                    Showing {currentItems.length} of {filteredProducts.length} products
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bulkActionProducts.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-md mb-4 flex items-center justify-between">
                    <div>
                      <span className="font-medium">{bulkActionProducts.length} products selected</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleBulkActivate(true)}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleBulkActivate(false)}
                        className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Deactivate
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleBulkDelete}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setBulkActionProducts([])}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-10">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' || activeFilter !== 'all' 
                        ? "No products match your current filters."
                        : "Add your first product to get started."
                      }
                    </p>
                    {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all' || activeFilter !== 'all' ? (
                      <Button 
                        variant="outline" 
                        onClick={clearFilters}
                      >
                        Clear Filters
                      </Button>
                    ) : (
                      <Link
                        href="/dashboard/products/add"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add New Product
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <input 
                              type="checkbox" 
                              checked={selectedAll}
                              onChange={handleCheckAll}
                              className="rounded"
                            />
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer" 
                            onClick={() => {
                              setSortBy('name');
                              setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                            }}
                          >
                            Name {renderSortIcon('name')}
                          </TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead 
                            className="cursor-pointer" 
                            onClick={() => {
                              setSortBy('category');
                              setSortOrder(sortBy === 'category' && sortOrder === 'asc' ? 'desc' : 'asc');
                            }}
                          >
                            Category {renderSortIcon('category')}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer" 
                            onClick={() => {
                              setSortBy('price');
                              setSortOrder(sortBy === 'price' && sortOrder === 'asc' ? 'desc' : 'asc');
                            }}
                          >
                            Price {renderSortIcon('price')}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer" 
                            onClick={() => {
                              setSortBy('costPrice');
                              setSortOrder(sortBy === 'costPrice' && sortOrder === 'asc' ? 'desc' : 'asc');
                            }}
                          >
                            Cost {renderSortIcon('costPrice')}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer" 
                            onClick={() => {
                              setSortBy('profit');
                              setSortOrder(sortBy === 'profit' && sortOrder === 'asc' ? 'desc' : 'asc');
                            }}
                          >
                            Profit {renderSortIcon('profit')}
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer" 
                            onClick={() => {
                              setSortBy('stock');
                              setSortOrder(sortBy === 'stock' && sortOrder === 'asc' ? 'desc' : 'asc');
                            }}
                          >
                            Stock {renderSortIcon('stock')}
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentItems.map((product) => {
                          const profit = product.price - product.costPrice;
                          const profitMargin = product.costPrice ? ((profit / product.price) * 100).toFixed(2) : '0.00';
                          
                          return (
                            <TableRow 
                              key={product._id} 
                              className={!product.isActive ? 'opacity-60 bg-gray-50' : ''}
                            >
                              <TableCell>
                                <input 
                                  type="checkbox"
                                  checked={bulkActionProducts.includes(product._id)}
                                  onChange={(e) => handleCheckProduct(e, product._id)}
                                  className="rounded"
                                />
                              </TableCell>
                              <TableCell className="font-medium max-w-xs">
                                <div>
                                  <p className="truncate" title={product.name}>{product.name}</p>
                                  {product.description && (
                                    <p className="text-sm text-muted-foreground truncate" title={product.description}>
                                      {product.description}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell title={product.sku}>{product.sku}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="rounded-sm">
                                  {product.category}
                                </Badge>
                              </TableCell>
                              <TableCell>${product.price.toFixed(2)}</TableCell>
                              <TableCell>${product.costPrice.toFixed(2)}</TableCell>
                              <TableCell>
                                <div>
                                  <span className={profit > 0 ? "text-green-600" : "text-red-600"}>
                                    ${profit.toFixed(2)}
                                  </span>
                                  <div className="text-xs text-muted-foreground">
                                    {profitMargin}% margin
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{product.stockQuantity} {product.unit}</span>
                                  {product.stockQuantity < product.minStockLevel && (
                                    <span className="text-xs text-red-500">
                                      Min: {product.minStockLevel}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {product.isActive ? (
                                  getStockStatus(product)
                                ) : (
                                  <Badge variant="secondary">Inactive</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end space-x-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Link
                                          href={`/dashboard/products/${product._id}`}
                                          className="text-gray-600 hover:text-gray-800"
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Link>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>View Details</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Link
                                          href={`/dashboard/products/edit/${product._id}`}
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Link>                                    
                                      </TooltipTrigger>
                                      <TooltipContent>                                      
                                        <p>Edit Product</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => handleDelete(product._id)}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete Product</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    
                    {totalPages > 1 && (
                      <div className="mt-4 flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const categoryProducts = products.filter(p => p.category === category);
                const categoryValue = categoryProducts.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
                const avgPrice = categoryProducts.length > 0 ? 
                  categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length : 0;
                
                return (
                  <Card key={category} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {category}
                        <Badge variant="secondary">{categoryProducts.length} products</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Value:</span>
                          <span className="font-medium">${categoryValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Avg Price:</span>
                          <span className="font-medium">${avgPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Low Stock:</span>
                          <span className="font-medium text-yellow-600">
                            {categoryProducts.filter(p => p.stockQuantity <= p.minStockLevel).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Analysis</CardTitle>
                  <CardDescription>Current inventory status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                      <span>Products in Stock</span>
                      <span className="font-bold text-green-600">
                        {products.filter(p => p.stockQuantity > p.minStockLevel).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <span>Low Stock Products</span>
                      <span className="font-bold text-yellow-600">
                        {dashboardStats.lowStockItems}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                      <span>Out of Stock</span>
                      <span className="font-bold text-red-600">
                        {dashboardStats.outOfStockItems}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/20 rounded">
                      <span>Inactive Products</span>
                      <span className="font-bold text-gray-600">
                        {dashboardStats.inactiveProducts}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Analysis</CardTitle>
                  <CardDescription>Value and profitability metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <span>Total Inventory Value</span>
                      <span className="font-bold text-blue-600">${dashboardStats.totalValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <span>Total Cost Value</span>
                      <span className="font-bold text-purple-600">${dashboardStats.totalCostValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                      <span>Potential Profit</span>
                      <span className="font-bold text-green-600">
                        ${(dashboardStats.totalValue - dashboardStats.totalCostValue).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <span>Average Margin</span>
                      <span className="font-bold text-orange-600">
                        {dashboardStats.profitMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="low-stock">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Low Stock Alert
                </CardTitle>
                <CardDescription>
                  Products that need immediate attention for restocking
                </CardDescription>
              </CardHeader>
              <CardContent>
                {products.filter(p => p.stockQuantity <= p.minStockLevel).length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium text-green-600">All products are well stocked!</h3>
                    <p className="text-muted-foreground">No products require immediate restocking.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Current Stock</TableHead>
                          <TableHead>Min Level</TableHead>
                          <TableHead>Shortage</TableHead>
                          <TableHead>Value at Risk</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products
                          .filter(p => p.stockQuantity <= p.minStockLevel)
                          .sort((a, b) => (a.stockQuantity - a.minStockLevel) - (b.stockQuantity - b.minStockLevel))
                          .map((product) => {
                            const shortage = Math.max(0, product.minStockLevel - product.stockQuantity);
                            const valueAtRisk = shortage * product.price;
                            
                            return (
                              <TableRow key={product._id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">{product.sku}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className={`font-bold ${
                                    product.stockQuantity === 0 ? 'text-red-600' : 'text-yellow-600'
                                  }`}>
                                    {product.stockQuantity}
                                  </span>
                                </TableCell>
                                <TableCell>{product.minStockLevel}</TableCell>
                                <TableCell>
                                  <span className="font-bold text-red-600">{shortage}</span>
                                </TableCell>
                                <TableCell>
                                  <span className="font-bold text-red-600">${valueAtRisk.toFixed(2)}</span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      onClick={() => router.push(`/dashboard/inventory/${product._id}/adjust`)}
                                    >
                                      Restock
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => router.push(`/dashboard/products/edit/${product._id}`)}
                                    >
                                      Edit
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        }
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog 
        open={!!confirmAction} 
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                await confirmAction?.action();
                setConfirmAction(null);
              }} 
              className={
                confirmAction?.type === 'delete' || confirmAction?.type === 'bulkDelete' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : ''
              }
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ProductsPage;