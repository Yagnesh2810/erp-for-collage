'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw,
  Download,
  Upload,
  Eye,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Activity,
  Users,
  Tag,
  FileText,
  Info
} from 'lucide-react';
import { 
  customersAPI, 
  Customer, 
  CustomerFilterParams, 
  CustomerStats 
} from '@/lib/api/index';
import { toast } from 'react-hot-toast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProcessing, setImportProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{
    total: number;
    success: number;
    errors: {row: number, message: string}[];
  } | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<CustomerFilterParams>({
    page: 1,
    limit: 10,
    sort: 'createdAt',
    order: 'desc'
  });

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [filters.page, filters.limit, filters.sort, filters.order, filters.type, filters.active]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getAll(filters);
      setCustomers(response.data);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
      toast.error('Error loading customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await customersAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching customer statistics:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await customersAPI.delete(id);
      toast.success('Customer deleted successfully');
      fetchCustomers();
      fetchStats();
      setCustomerToDelete(null);
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast.error('Failed to delete customer');
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      await customersAPI.updateStatus(id, !currentStatus);
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer._id === id ? { ...customer, active: !currentStatus } : customer
        )
      );
      toast.success(`Customer ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Error updating customer status:', err);
      toast.error('Failed to update customer status');
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilters({
        ...filters,
        search: undefined,
        page: 1
      });
      return;
    }

    setFilters({
      ...filters,
      search: searchTerm,
      page: 1
    });
  };

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters({
      ...filters,
      [filterName]: value,
      page: 1
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setFilters({
        ...filters,
        page: newPage
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Type', 'Status', 'Address', 'Created'];
    const csvRows = [headers];

    customers.forEach(customer => {
      const address = `${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zipCode}, ${customer.address.country}`;
      const row = [
        customer.name,
        customer.email,
        customer.phone,
        customer.customerType,
        customer.active ? 'Active' : 'Inactive',
        address,
        new Date(customer.createdAt).toLocaleDateString()
      ];
      csvRows.push(row);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `customers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Customers exported to CSV');
  };
  
  const downloadCSVTemplate = () => {
    const headers = ['Name*', 'Email*', 'Phone*', 'Type*', 'Active', 'Street', 'City', 'State', 'ZipCode', 'Country', 'ContactPerson', 'TaxId', 'CreditLimit', 'PaymentTerms', 'Notes', 'Tags'];
    const sampleData = [
      ['John Doe', 'john@example.com', '555-123-4567', 'regular', 'true', '123 Main St', 'New York', 'NY', '10001', 'USA', 'Jane Smith', 'TX12345', '1000', 'Net 30', 'Preferred customer', 'loyal,retail'],
      ['Acme Corp', 'contact@acmecorp.com', '555-987-6543', 'wholesale', 'true', '456 Commerce Ave', 'Chicago', 'IL', '60601', 'USA', 'Tom Johnson', 'TX67890', '5000', 'Net 60', 'Wholesaler account', 'business,wholesale']
    ];
    
    const csvRows = [headers, ...sampleData];
    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'customer-import-template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Template downloaded');
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.csv')) {
        setImportFile(file);
        setImportResults(null);
      } else {
        toast.error('Please select a CSV file');
        e.target.value = '';
      }
    }
  };
  
  const importCustomers = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }
    
    setImportProcessing(true);
    setImportResults(null);
    
    try {
      const fileContent = await readFileAsText(importFile);
      const { data, errors } = parseCSV(fileContent);
      
      if (errors.length > 0) {
        setImportResults({
          total: data.length,
          success: 0,
          errors: errors.map((error, index) => ({ row: index + 1, message: error }))
        });
        setImportProcessing(false);
        return;
      }
      
      const results = await processImportData(data);
      
      setImportResults(results);
      if (results.errors.length === 0) {
        toast.success(`Successfully imported ${results.success} customers`);
        fetchCustomers();
        fetchStats();
        setTimeout(() => {
          setImportModalOpen(false);
          setImportFile(null);
          setImportResults(null);
        }, 3000);
      } else {
        toast.error(`Import completed with ${results.errors.length} errors`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import customers');
      setImportResults({
        total: 0,
        success: 0,
        errors: [{ row: 0, message: 'Failed to process file' }]
      });
    } finally {
      setImportProcessing(false);
    }
  };
  
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };
  
  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const requiredFields = ['Name', 'Email', 'Phone', 'Type'];
    const missingFields = requiredFields.filter(field => 
      !headers.some(h => h.replace(/\*/g, '').toLowerCase() === field.toLowerCase())
    );
    
    if (missingFields.length > 0) {
      return {
        data: [],
        errors: [`Missing required columns: ${missingFields.join(', ')}`]
      };
    }
    
    const data = [];
    const errors = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length < requiredFields.length) {
        errors.push(`Row ${i}: Not enough values`);
        continue;
      }
      
      const record: any = {};
      let hasError = false;
      
      headers.forEach((header, index) => {
        const cleanHeader = header.replace(/\*/g, '');
        const value = values[index] || '';
        
        if (header.includes('*') && !value) {
          errors.push(`Row ${i}: Missing required field ${cleanHeader}`);
          hasError = true;
          return;
        }
        
        switch (cleanHeader.toLowerCase()) {
          case 'name':
            record.name = value;
            break;
          case 'email':
            record.email = value;
            break;
          case 'phone':
            record.phone = value;
            break;
          case 'type':
            if (['regular', 'wholesale', 'vip'].includes(value.toLowerCase())) {
              record.customerType = value.toLowerCase();
            } else {
              errors.push(`Row ${i}: Invalid customer type "${value}". Must be regular, wholesale, or vip.`);
              hasError = true;
            }
            break;
          case 'active':
            record.active = value.toLowerCase() === 'true';
            break;
          case 'street':
            if (!record.address) record.address = {};
            record.address.street = value;
            break;
          case 'city':
            if (!record.address) record.address = {};
            record.address.city = value;
            break;
          case 'state':
            if (!record.address) record.address = {};
            record.address.state = value;
            break;
          case 'zipcode':
            if (!record.address) record.address = {};
            record.address.zipCode = value;
            break;
          case 'country':
            if (!record.address) record.address = {};
            record.address.country = value;
            break;
          case 'contactperson':
            record.contactPerson = value;
            break;
          case 'taxid':
            record.taxId = value;
            break;
          case 'creditlimit':
            record.creditLimit = value ? parseFloat(value) : undefined;
            break;
          case 'paymentterms':
            record.paymentTerms = value;
            break;
          case 'notes':
            record.notes = value;
            break;
          case 'tags':
            record.tags = value ? value.split(/[,;]/).map((tag: string) => tag.trim()) : undefined;
            break;
        }
      });
      
      if (!hasError) {
        if (record.address) {
          record.address = {
            street: record.address.street || '',
            city: record.address.city || '',
            state: record.address.state || '',
            zipCode: record.address.zipCode || '',
            country: record.address.country || ''
          };
        } else {
          record.address = {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          };
        }
        
        data.push(record);
      }
    }
    
    return { data, errors };
  };
  
  const processImportData = async (data: any[]): Promise<{
    total: number;
    success: number;
    errors: {row: number, message: string}[];
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const errors: {row: number, message: string}[] = [];
        let successCount = 0;
        
        data.forEach((customer, index) => {
          if (Math.random() > 0.9) {
            errors.push({
              row: index + 1,
              message: 'Simulated validation error'
            });
          } else {
            successCount++;
          }
        });
        
        resolve({
          total: data.length,
          success: successCount,
          errors: errors
        });
      }, 1500);
    });
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customer Management</h1>
            <p className="text-muted-foreground">Manage your customer database</p>
          </div>
          <Link href="/dashboard/customers/new">
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                    <p className="text-2xl font-semibold text-foreground">{stats.totalCount}</p>
                  </div>
                  <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center">
                    <Users className="text-primary" size={24} />
                  </div>
                </div>
                <div className="mt-3 flex text-sm">
                  <div className="mr-4">
                    <span className="text-green-500">●</span> Active: {stats.activeCount}
                  </div>
                  <div>
                    <span className="text-red-500">●</span> Inactive: {stats.inactiveCount}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Customer Types</p>
                <div className="flex flex-wrap">
                  {stats.byType.map(type => (
                    <div key={type._id} className="mr-4 mb-2">
                      <div className="flex items-center">
                        <Tag className="text-primary mr-1" size={16} />
                        <p className="text-sm text-foreground">
                          <span className="font-medium capitalize">{type._id || 'Other'}:</span> {type.count}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">Top Countries</p>
                <div className="flex flex-wrap">
                  {stats.byCountry.map(country => (
                    <div key={country._id} className="mr-4 mb-2">
                      <p className="text-sm text-foreground">
                        {country._id}: <span className="font-semibold">{country.count}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Filters Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="relative flex-grow mb-4 md:mb-0 md:mr-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-muted-foreground" size={18} />
                </div>
                <Input
                  type="text"
                  placeholder="Search customers..."
                  className="pl-10 pr-4"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                {searchTerm && (
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                    onClick={() => {
                      setSearchTerm('');
                      handleSearch();
                    }}
                  >
                    <X className="text-muted-foreground hover:text-foreground" size={18} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <Filter className="mr-2 h-4 w-4" /> Filters
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    fetchCustomers();
                    fetchStats();
                    toast.success('Data refreshed');
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setImportModalOpen(true)}
                >
                  <Upload className="mr-2 h-4 w-4" /> Import
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={customers.length === 0}>
                      <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={exportToCSV}>
                      <FileText className="mr-2 h-4 w-4" />
                      Export to CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Filter options */}
            {filterOpen && (
              <CardContent className="pt-4 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Customer Type</label>
                    <Select
                      value={filters.type || 'all'}
                      onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="wholesale">Wholesale</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                    <Select
                      value={filters.active === undefined ? 'all' : filters.active.toString()}
                      onValueChange={(value) => {
                        handleFilterChange('active', value === 'all' ? undefined : value === 'true');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
                    <Select
                      value={filters.sort}
                      onValueChange={(value) => handleFilterChange('sort', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Date Created</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="totalOrders">Total Orders</SelectItem>
                        <SelectItem value="lastPurchaseDate">Last Purchase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Order</label>
                    <Select
                      value={filters.order}
                      onValueChange={(value) => handleFilterChange('order', value as 'asc' | 'desc')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descending</SelectItem>
                        <SelectItem value="asc">Ascending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({
                        page: 1,
                        limit: 10,
                        sort: 'createdAt',
                        order: 'desc'
                      });
                      setSearchTerm('');
                      toast.success('Filters reset');
                    }}
                  >
                    Reset Filters
                  </Button>
                  <Button onClick={handleSearch}>
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            )}
          </CardHeader>
        </Card>
        
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <X className="h-4 w-4" />
            <AlertDescription className="flex justify-between items-center">
              <span>{error}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  fetchCustomers();
                  setError(null);
                }}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Customers</span>
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && customers.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading customers...</p>
                </div>
              </div>
            ) : customers.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer._id} className="hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <Link href={`/customers/${customer._id}`}>
                                <span className="text-primary hover:underline font-medium cursor-pointer">
                                  {customer.name}
                                </span>
                              </Link>
                              {customer.tags && customer.tags.length > 0 && (
                                <div className="flex mt-1 gap-1">
                                  {customer.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {customer.tags.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{customer.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                          <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {customer.customerType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusToggle(customer._id, customer.active)}
                              className={`h-6 px-2 text-xs font-medium ${
                                customer.active 
                                  ? 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200' 
                                  : 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
                              }`}
                            >
                              {customer.active ? 'Active' : 'Inactive'}
                            </Button>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => router.push(`/customers/${customer._id}`)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Customer</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => router.push(`/customers/${customer._id}/edit`)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Customer</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => setCustomerToDelete(customer._id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete Customer</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => handlePageChange(pagination.page - 1)}
                            className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, pagination.pages) }).map((_, idx) => {
                          let pageNumber;
                          
                          if (pagination.pages <= 5) {
                            pageNumber = idx + 1;
                          } else if (pagination.page <= 3) {
                            pageNumber = idx + 1;
                          } else if (pagination.page >= pagination.pages - 2) {
                            pageNumber = pagination.pages - 4 + idx;
                          } else {
                            pageNumber = pagination.page - 2 + idx;
                          }
                          
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                onClick={() => handlePageChange(pageNumber)}
                                isActive={pagination.page === pageNumber}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => handlePageChange(pagination.page + 1)}
                            className={pagination.page >= pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                    
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} customers
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">No customers found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || filters.type || filters.active !== undefined 
                    ? 'Try changing your search criteria or filters'
                    : 'Get started by adding your first customer'
                  }
                </p>
                <Link href="/dashboard/customers/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => customerToDelete && handleDelete(customerToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Import Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Customers</DialogTitle>
            <DialogDescription>
              Import customers from a CSV file. Download our template for the correct format.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Import customers from a CSV file. Download our template for the correct format.
              </AlertDescription>
            </Alert>
            
            <Button
              variant="outline"
              onClick={downloadCSVTemplate}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" /> Download CSV Template
            </Button>
            
            <Card className="border-2 border-dashed border-muted-foreground/25">
              <CardContent className="pt-6">
                {!importFile ? (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Drag and drop your CSV file here, or{' '}
                      <label className="text-primary hover:underline cursor-pointer">
                        browse
                        <input
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={handleFileSelect}
                          disabled={importProcessing}
                        />
                      </label>
                      {' '}to select a file
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">CSV files only, max 1MB</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-primary mr-3" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{importFile.name}</p>
                        <p className="text-xs text-muted-foreground">{Math.round(importFile.size / 1024)} KB</p>
                      </div>
                    </div>
                    {!importProcessing && (
                      <Button 
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setImportFile(null);
                          setImportResults(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Import Results */}
            {importResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Import Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total rows:</span>
                      <span className="font-medium text-foreground">{importResults.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Successfully imported:</span>
                      <span className="font-medium text-green-600">{importResults.success}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Errors:</span>
                      <span className="font-medium text-destructive">{importResults.errors.length}</span>
                    </div>
                    
                    {importResults.errors.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2 text-foreground">Error details:</p>
                        <div className="max-h-40 overflow-y-auto border border-border rounded-md">
                          {importResults.errors.map((error, index) => (
                            <div key={index} className="px-3 py-2 text-sm border-b border-border last:border-b-0 bg-card">
                              <span className="font-medium text-foreground">Row {error.row}:</span> 
                              <span className="text-muted-foreground ml-2">{error.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (!importProcessing) {
                  setImportModalOpen(false);
                  setImportFile(null);
                  setImportResults(null);
                }
              }}
              disabled={importProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={importCustomers}
              disabled={!importFile || importProcessing}
            >
              {importProcessing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Import Customers
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}