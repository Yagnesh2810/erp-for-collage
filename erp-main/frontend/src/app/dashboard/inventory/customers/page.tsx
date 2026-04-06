'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSearch, 
  FiFilter, 
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiX,
  FiActivity,
  FiUsers,
  FiTag,
  FiFile,
  FiInfo
} from 'react-icons/fi';
import { 
  customersAPI, 
  Customer, 
  CustomerFilterParams, 
  CustomerStats 
} from '@/lib/api/index';
import { toast } from 'react-hot-toast';
import Layout from '@/components/Layout';

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
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersAPI.delete(id);
        toast.success('Customer deleted successfully');
        fetchCustomers();
        fetchStats();
      } catch (err) {
        console.error('Error deleting customer:', err);
        toast.error('Failed to delete customer');
      }
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
    // Create CSV content
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
  
  // Download sample CSV template
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
  
  // Handle file selection for import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Check if it's a CSV file
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
  
  // Handle customer import
  const importCustomers = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }
    
    setImportProcessing(true);
    setImportResults(null);
    
    try {
      // Read file
      const fileContent = await readFileAsText(importFile);
      
      // Parse CSV
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
      
      // Process data - in a real app, you would send this to your API
      // For this example, we'll simulate a batch upload with some success/failure
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
  
  // Read file as text
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
  
  // Parse CSV function
  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Required fields
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
    
    // Process each line (skipping header)
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const values = lines[i].split(',').map(v => v.trim());
      
      // Check if we have enough values
      if (values.length < requiredFields.length) {
        errors.push(`Row ${i}: Not enough values`);
        continue;
      }
      
      // Create a record
      const record: any = {};
      let hasError = false;
      
      headers.forEach((header, index) => {
        const cleanHeader = header.replace(/\*/g, '');
        const value = values[index] || '';
        
        // Validate required fields
        if (header.includes('*') && !value) {
          errors.push(`Row ${i}: Missing required field ${cleanHeader}`);
          hasError = true;
          return;
        }
        
        // Map fields to customer structure
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
      
      // Add record if no validation errors
      if (!hasError) {
        // Ensure address is complete
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
  
  // Process import data - in a real app, this would call your API
  const processImportData = async (data: any[]): Promise<{
    total: number;
    success: number;
    errors: {row: number, message: string}[];
  }> => {
    // Simulate API call with some success/failure
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, you would make an API call here to import the customers
        // For this example, we'll simulate some successes and failures
        
        const errors: {row: number, message: string}[] = [];
        let successCount = 0;
        
        data.forEach((customer, index) => {
          // Simulate validation - in real app this would be handled by your API
          if (Math.random() > 0.9) { // 10% chance of error for demo purposes
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
      }, 1500); // Simulate API delay
    });
  };

  return (
    <Layout>
    <div className="container mx-auto px-4 py-6">
      {/* Header with stats */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Customer Management</h1>
          <Link href="/dashboard/customers/new">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
              <FiPlus className="mr-2" /> Add Customer
            </button>
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Customers</p>
                  <p className="text-2xl font-semibold">{stats.totalCount}</p>
                </div>
                <div className="bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center">
                  <FiUsers className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="mt-2 flex text-sm">
                <div className="mr-4">
                  <span className="text-green-500">●</span> Active: {stats.activeCount}
                </div>
                <div>
                  <span className="text-red-500">●</span> Inactive: {stats.inactiveCount}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Customer Types</p>
              <div className="flex flex-wrap mt-2">
                {stats.byType.map(type => (
                  <div key={type._id} className="mr-4 mb-2">
                    <div className="flex items-center">
                      <FiTag className="text-blue-500 mr-1" />
                      <p className="text-sm capitalize">
                        <span className="font-medium">{type._id || 'Other'}:</span> {type.count}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm">Top Countries</p>
              <div className="flex flex-wrap mt-2">
                {stats.byCountry.map(country => (
                  <div key={country._id} className="mr-4 mb-2">
                    <p className="text-sm">
                      {country._id}: <span className="font-semibold">{country.count}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Search & Filters */}
      <div className="bg-white shadow-sm rounded-md p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center mb-4">
          {/* Search */}
          <div className="relative flex-grow mb-4 md:mb-0 md:mr-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <FiX className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button 
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <FiFilter className="mr-1" /> Filters
            </button>
            <button 
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md"
              onClick={() => {
                fetchCustomers();
                fetchStats();
                toast.success('Data refreshed');
              }}
            >
              <FiRefreshCw className="mr-1" /> Refresh
            </button>
            <button 
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md"
              onClick={() => setImportModalOpen(true)}
            >
              <FiUpload className="mr-1" /> Import
            </button>
            <button 
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md"
              onClick={exportToCSV}
              disabled={customers.length === 0}
            >
              <FiDownload className="mr-1" /> Export
            </button>
          </div>
        </div>

        {/* Filter options */}
        {filterOpen && (
          <div className="border-t pt-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Customer Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                <select
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                >
                  <option value="">All Types</option>
                  <option value="regular">Regular</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={filters.active === undefined ? '' : filters.active.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('active', value === '' ? undefined : value === 'true');
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Sort By Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  <option value="createdAt">Date Created</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="totalOrders">Total Orders</option>
                  <option value="lastPurchaseDate">Last Purchase</option>
                </select>
              </div>

              {/* Order Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  value={filters.order}
                  onChange={(e) => handleFilterChange('order', e.target.value as 'asc' | 'desc')}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 border rounded-md mr-2"
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
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                onClick={handleSearch}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FiX className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button 
                onClick={() => {
                  fetchCustomers();
                  setError(null);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && customers.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Customers Table */}
      <div className="bg-white shadow-sm rounded-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/customers/${customer._id}`}>
                        <span className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer">{customer.name}</span>
                      </Link>
                      {customer.tags && customer.tags.length > 0 && (
                        <div className="flex mt-1">
                          {customer.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded mr-1">
                              {tag}
                            </span>
                          ))}
                          {customer.tags.length > 2 && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                              +{customer.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{customer.customerType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => handleStatusToggle(customer._id, customer.active)}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${customer.active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                      >
                        {customer.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <Link href={`/customers/${customer._id}`}>
                          <button className="text-gray-600 hover:text-gray-900">
                            <FiEye size={18} />
                          </button>
                        </Link>
                        <Link href={`/customers/${customer._id}/edit`}>
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <FiEdit size={18} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(customer._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FiUsers className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-lg font-medium mb-1">No customers found</p>
                      <p className="text-sm text-gray-500 mb-4">Try changing your search criteria or add a new customer</p>
                      <Link href="/customers/new">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
                          <FiPlus className="mr-2" /> Add Customer
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {customers.length > 0 && pagination.pages > 1 && (
          <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  pagination.page <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  pagination.page >= pagination.pages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> customers
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page <= 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.pages) }).map((_, idx) => {
                    let pageNumber;
                    
                    // Logic to show appropriate page numbers around current page
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
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.page === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page >= pagination.pages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Import Customers</h2>
                <button 
                  onClick={() => {
                    if (!importProcessing) {
                      setImportModalOpen(false);
                      setImportFile(null);
                      setImportResults(null);
                    }
                  }}
                  disabled={importProcessing}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiInfo className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Import customers from a CSV file. Download our template for the correct format.
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={downloadCSVTemplate}
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm mb-4"
                >
                  <FiFile className="mr-1" /> Download CSV template
                </button>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {!importFile ? (
                    <>
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-1 text-sm text-gray-600">
                        Drag and drop your CSV file here, or 
                        <label className="mx-1 text-blue-600 hover:text-blue-500 cursor-pointer">
                          browse
                          <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileSelect}
                            disabled={importProcessing}
                          />
                        </label>
                        to select a file
                      </p>
                      <p className="text-xs text-gray-500 mt-2">CSV files only, max 1MB</p>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FiFile className="h-8 w-8 text-blue-500 mr-2" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">{importFile.name}</p>
                          <p className="text-xs text-gray-500">{Math.round(importFile.size / 1024)} KB</p>
                        </div>
                      </div>
                      {!importProcessing && (
                        <button 
                          onClick={() => {
                            setImportFile(null);
                            setImportResults(null);
                          }}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <FiX size={20} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Import Results */}
              {importResults && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Import Results</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-3">
                      <span>Total rows:</span>
                      <span className="font-medium">{importResults.total}</span>
                    </div>
                    <div className="flex justify-between mb-3">
                      <span>Successfully imported:</span>
                      <span className="font-medium text-green-600">{importResults.success}</span>
                    </div>
                    <div className="flex justify-between mb-3">
                      <span>Errors:</span>
                      <span className="font-medium text-red-600">{importResults.errors.length}</span>
                    </div>
                    
                    {importResults.errors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Error details:</p>
                        <div className="max-h-40 overflow-y-auto bg-white border border-red-100 rounded-md">
                          {importResults.errors.map((error, index) => (
                            <div key={index} className="px-3 py-2 text-sm border-b border-red-100 last:border-b-0">
                              <span className="font-medium">Row {error.row}:</span> {error.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    if (!importProcessing) {
                      setImportModalOpen(false);
                      setImportFile(null);
                      setImportResults(null);
                    }
                  }}
                  disabled={importProcessing}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={importCustomers}
                  disabled={!importFile || importProcessing}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiUpload className="mr-2" /> Import Customers
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}