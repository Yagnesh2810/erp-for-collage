// path: frontend/src/lib/customersAPI.ts
import api from './client';

// Customer interfaces
export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactPerson?: string;
  customerType: 'regular' | 'wholesale' | 'vip';
  taxId?: string;
  creditLimit?: number;
  paymentTerms?: string;
  notes?: string;
  active: boolean;
  totalOrders?: number;
  totalSpent?: number;
  lastPurchaseDate?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactPerson?: string;
  customerType: 'regular' | 'wholesale' | 'vip';
  taxId?: string;
  creditLimit?: number;
  paymentTerms?: string;
  notes?: string;
  active?: boolean;
  tags?: string[];
}

export interface CustomerStats {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  byType: Array<{
    _id: string;
    count: number;
  }>;
  byCountry: Array<{
    _id: string;
    count: number;
  }>;
  recentlyAdded: Customer[];
}

export interface CustomerFilterParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  type?: 'regular' | 'wholesale' | 'vip';
  active?: boolean;
  city?: string;
  country?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const customersAPI = {
  // Get all customers with optional filtering and pagination
  getAll: async (params: CustomerFilterParams = {}): Promise<PaginatedResponse<Customer>> => {
    const response = await api.get("/api/customers", { params });
    return response.data;
  },

  // Get customer by ID
  getById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/api/customers/${id}`);
    return response.data;
  },

  // Create a new customer
  create: async (customerData: CustomerInput): Promise<Customer> => {
    const response = await api.post("/api/customers", customerData);
    return response.data;
  },

  // Update an existing customer
  update: async (id: string, customerData: Partial<CustomerInput>): Promise<Customer> => {
    const response = await api.put(`/api/customers/${id}`, customerData);
    return response.data;
  },

  // Delete a customer
  delete: async (id: string): Promise<{message: string, customer?: Customer}> => {
    const response = await api.delete(`/api/customers/${id}`);
    return response.data;
  },
  
  // Get customers by type
  getByType: async (type: 'regular' | 'wholesale' | 'vip'): Promise<Customer[]> => {
    const response = await api.get(`/api/customers/type/${type}`);
    return response.data;
  },
  
  // Get customers by tag
  getByTag: async (tag: string): Promise<Customer[]> => {
    const response = await api.get(`/api/customers/tag/${tag}`);
    return response.data;
  },
  
  // Search customers
  search: async (query: string): Promise<Customer[]> => {
    const response = await api.get(`/api/customers/search`, { params: { q: query } });
    return response.data;
  },
  
  // Get customer statistics
  getStats: async (): Promise<CustomerStats> => {
    const response = await api.get(`/api/customers/stats`);
    return response.data;
  },
  
  // Update customer status
  updateStatus: async (id: string, active: boolean): Promise<Customer> => {
    const response = await api.patch(`/api/customers/${id}/status`, { active });
    return response.data;
  },
  
  // Add tags to customer
  addTags: async (id: string, tags: string[]): Promise<Customer> => {
    const response = await api.patch(`/api/customers/${id}/tags/add`, { tags });
    return response.data;
  },
  
  // Remove tags from customer
  removeTags: async (id: string, tags: string[]): Promise<Customer> => {
    const response = await api.patch(`/api/customers/${id}/tags/remove`, { tags });
    return response.data;
  },
  
  // Validate customer credit status
  validateCredit: async (id: string, orderAmount?: number): Promise<any> => {
    const params = orderAmount ? { orderAmount } : {};
    const response = await api.get(`/api/customers/${id}/credit-check`, { params });
    return response.data;
  }
};

// Export individual functions for flexibility
export const getAllCustomers = customersAPI.getAll;
export const getCustomerById = customersAPI.getById;
export const createCustomer = customersAPI.create;
export const updateCustomer = customersAPI.update;
export const deleteCustomer = customersAPI.delete;
export const getCustomersByType = customersAPI.getByType;
export const getCustomersByTag = customersAPI.getByTag;
export const searchCustomers = customersAPI.search;
export const getCustomerStats = customersAPI.getStats;
export const updateCustomerStatus = customersAPI.updateStatus;
export const addCustomerTags = customersAPI.addTags;
export const removeCustomerTags = customersAPI.removeTags;
export const validateCustomerCredit = customersAPI.validateCredit;

export default customersAPI;