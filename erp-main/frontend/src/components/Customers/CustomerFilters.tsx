import { useState, useEffect } from 'react';
import { CustomerFilterParams } from '@/lib/api/index';

interface CustomerFiltersProps {
  filters: CustomerFilterParams;
  onFilterChange: (filters: Partial<CustomerFilterParams>) => void;
}

export default function CustomerFilters({ filters, onFilterChange }: CustomerFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput || undefined });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ 
      type: value !== 'all' ? value as 'regular' | 'wholesale' | 'vip' : undefined 
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ 
      active: value !== 'all' ? value === 'active' : undefined 
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sort, order] = e.target.value.split('-');
    onFilterChange({ 
      sort, 
      order: order as 'asc' | 'desc' 
    });
  };

  const handleReset = () => {
    setSearchInput('');
    onFilterChange({
      search: undefined,
      type: undefined,
      active: undefined,
      sort: 'name',
      order: 'asc'
    });
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by name, email, phone..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-48">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Customer Type
          </label>
          <select
            id="type"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filters.type || 'all'}
            onChange={handleTypeChange}
          >
            <option value="all">All Types</option>
            <option value="regular">Regular</option>
            <option value="wholesale">Wholesale</option>
            <option value="vip">VIP</option>
          </select>
        </div>
        Hi
        <div className="w-full md:w-48">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={filters.active === undefined ? 'all' : filters.active ? 'active' : 'inactive'}
            onChange={handleStatusChange}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div className="w-full md:w-48">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={`${filters.sort || 'name'}-${filters.order || 'asc'}`}
            onChange={handleSortChange}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}