// Path: src/components/Customers/CustomerDashboard.tsx

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
  FiTag,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiX,
  FiActivity
} from 'react-icons/fi';
import { customersAPI, Customer, CustomerFilterParams, CustomerStats } from '@/lib/api/index';

export default function CustomerDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });

  // Filter states
  const [filters, setFilters] = useState<CustomerFilterParams>({
    page: 1,
    limit: 10,
    sort: 'createdAt',
    order: 'desc'
  });

  const router = useRouter();

  // Fetch customers and stats on initial load
  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  // Fetch customers when filters change
  useEffect(() => {
    fetchCustomers();
  }, [filters.page, filters.limit, filters.sort, filters.order, filters.type, filters.active]);

  // Fetch customers based on current filters
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getAll(filters);
      setCustomers(response.data);
      setPagination(response.pagination);
      setLoading(false);
    } catch (err) {
      setError('Error fetching customers data');
      setLoading(false);
      console.error(err);
    }
  };

  // Fetch customer statistics
  const fetchStats = async () => {
    try {
      const data = await customersAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching customer statistics:', err);
    }
  };

  // Handle delete customer
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersAPI.delete(id);
        // Refresh customer list and stats
        fetchCustomers();
        fetchStats();
      } catch (err) {
        setError('Error deleting customer');
        console.error(err);
      }
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      await customersAPI.updateStatus(id, !currentStatus);
      // Update the customer in the local state
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer._id === id ? { ...customer, active: !currentStatus } : customer
        )
      );
    } catch (err) {
      setError('Error updating customer status');
      console.error(err);
    }
  };
  
  // Handle search
  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      // Reset to default view if search is cleared
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

  // Handle filter change
  const handleFilterChange = (filterName: string, value: any) => {
    setFilters({
      ...filters,
      [filterName]: value,
      page: 1 // Reset to first page on filter change
    });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setFilters({
        ...filters,
        page: newPage
      });
    }
  };

  // Export customers to CSV
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
    
    // Create download link
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `customers-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Display loading state
  if (loading && customers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Customer Management</h1>
          <Link href="/dashboard/customer/add">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
              <FiPlus className="mr-2" /> Add Customer
            </button>
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Customers</p>
                  <p className="text-2xl font-semibold">{stats.totalCount}</p>
                </div>
                <div className="bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center">
                  <FiActivity className="text-blue-500" size={24} />
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

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-500 text-sm">Customer Types</p>
              <div className="flex flex-wrap mt-2">
                {stats.byType.map(type => (
                  <div key={type._id} className="mr-4 mb-2">
                    <p className="text-sm capitalize">
                      {type._id}: <span className="font-semibold">{type.count}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
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
      <div className="bg-white shadow-md rounded-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center mb-4">
          {/* Search */}
          <div className="relative flex-grow mb-4 md:mb-0 md:mr-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search customers..."
              className="pl-10 pr-4 py-2 border rounded-md w-full"
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
          <div className="flex">
            <button 
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md mr-2"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <FiFilter className="mr-1" /> Filters
            </button>
            <button 
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md mr-2"
              onClick={fetchCustomers}
            >
              <FiRefreshCw className="mr-1" /> Refresh
            </button>
            <button 
              className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md"
              onClick={exportToCSV}
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
                }}
              >
                Reset Filters
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Customers Table */}
      <div className="bg-white shadow-md rounded-md overflow-x-auto">
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
                    <Link href={`/dashboard/customer/${customer._id}`}>
                      <span className="text-blue-600 hover:text-blue-800 font-medium">{customer.name}</span>
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
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
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
                    <Link href={`/dashboard/customer/${customer._id}`}>
                      <button className="text-gray-600 hover:text-gray-900 mr-3">
                        <FiEye />
                      </button>
                    </Link>
                    <Link href={`/dashboard/customer/edit?id=${customer._id}`}>
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        <FiEdit />
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(customer._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  {loading ? 'Loading customers...' : 'No customers found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {customers.length > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-b-md">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                pagination.page <= 1
                  ? 'bg-gray-100 text-gray-400'
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
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{customers.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.page <= 1
                      ? 'text-gray-300'
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
                      ? 'text-gray-300'
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
  );
}