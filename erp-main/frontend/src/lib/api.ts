// path: frontend/src/lib/api.ts
// Re-export the unified API instance
export { default } from './api/index';

// Import the api instance for use in this file
import api from './api/index';

// ============================
//        Auth API
// ============================
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

// ============================
//      Products API
// ============================

export const fetchProduct = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const productsAPI = {

  getAll: async (params = {}) => {
    const response = await api.get("/products", { params });
    return response.data;
  },



  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData: any) => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  update: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// ============================
//        Orders API
// ============================

// Order interfaces
export interface OrderProduct {
  product: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

export interface PaymentReconciliation {
  status: string;
  date?: string;
  method: string;
  reference?: string;
  amount: number;
  notes?: string;
}

export interface LoyaltyPoints {
  pointsEarned: number;
}

export interface Order {
  _id: string;
  customer: string | Customer;
  products: OrderProduct[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  status: string;
  // New fields for fulfillment
  fulfillmentStatus?: string;
  fulfillmentDate?: string;
  trackingInfo?: TrackingInfo;
  // New fields for completion
  completionDate?: string;
  paymentReconciliation?: PaymentReconciliation;
  loyaltyUpdate?: {
    previousPoints?: number;
    currentPoints?: number;
    pointsEarned: number;
    updateDate: string;
  };
  isArchived?: boolean;
  auditTrail?: {
    event: string;
    date: string;
    user: string;
    details?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderInput {
  customer: string;
  products: OrderProduct[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus?: string;
  totalAmount?: number;
  status?: string;
  salesRepId?: string;
  notes?: string;
}

export interface OrderFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  customer?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface FulfillOrderInput {
  trackingInfo?: TrackingInfo;
  fulfillmentDate?: string;
  fulfillmentStatus?: 'unfulfilled' | 'partial' | 'fulfilled';
  notes?: string;
}

export interface CompleteOrderInput {
  paymentReconciliation?: PaymentReconciliation;
  loyaltyPoints?: LoyaltyPoints;
  completionDate?: string;
  notes?: string;
  archiveOrder?: boolean;
}

// Helper function to calculate order total
export const calculateOrderTotal = (products: OrderProduct[]) => {
  return products.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

export const ordersAPI = {
  fetchOrder: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  getAll: async (params: OrderFilterParams = {}) => {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (orderData: OrderInput) => {
    // Calculate total amount if not provided
    if (!orderData.totalAmount && orderData.products.length > 0) {
      orderData.totalAmount = calculateOrderTotal(orderData.products);
    }

    const response = await api.post("/orders", orderData);
    return response.data;
  },

  update: async (id: string, orderData: Partial<OrderInput>) => {
    // Calculate total amount if products are being updated but total not provided
    if (orderData.products && !orderData.totalAmount) {
      orderData.totalAmount = calculateOrderTotal(orderData.products);
    }

    const response = await api.put(`/orders/${id}`, orderData);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  getByCustomer: async (customerId: string) => {
    const response = await api.get(`/orders/customer/${customerId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get(`/orders/stats`);
    return response.data;
  },

  // Added to validate order before submission
  validateOrder: async (orderData: OrderInput) => {
    const response = await api.post("/orders/validate", orderData);
    return response.data;
  },

  // New functions for order fulfillment and completion
  fulfillOrder: async (id: string, fulfillmentData: FulfillOrderInput) => {
    const response = await api.put(`/orders/${id}/fulfill`, fulfillmentData);
    return response.data;
  },

  completeOrder: async (id: string, completionData: CompleteOrderInput) => {
    const response = await api.put(`/orders/${id}/complete`, completionData);
    return response.data;
  },

  generateInvoice: async (id: string) => {
    const response = await api.get(`/orders/${id}/invoice`);
    return response.data;
  },

  archiveOrder: async (id: string) => {
    const response = await api.put(`/orders/${id}/archive`, { isArchived: true });
    return response.data;
  },

  getAuditTrail: async (id: string) => {
    const response = await api.get(`/orders/${id}/audit-trail`);
    return response.data;
  }
};

// Export individual functions for flexibility
export const getAllOrders = ordersAPI.getAll;
export const getOrderById = ordersAPI.getById;
export const createOrder = ordersAPI.create;
export const updateOrder = ordersAPI.update;
export const updateOrderStatus = ordersAPI.updateStatus;
export const deleteOrder = ordersAPI.delete;
export const getOrdersByCustomer = ordersAPI.getByCustomer;
export const getOrderStats = ordersAPI.getStats;
export const validateOrder = ordersAPI.validateOrder;
export const fulfillOrder = ordersAPI.fulfillOrder;
export const completeOrder = ordersAPI.completeOrder;
export const generateInvoice = ordersAPI.generateInvoice;
export const archiveOrder = ordersAPI.archiveOrder;
export const getOrderAuditTrail = ordersAPI.getAuditTrail;


// ============================
//      Customers API
// ============================
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
    const response = await api.get("/customers", { params });
    return response.data;
  },

  // Get customer by ID
  getById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // Create a new customer
  create: async (customerData: CustomerInput): Promise<Customer> => {
    const response = await api.post("/customers", customerData);
    return response.data;
  },

  // Update an existing customer
  update: async (id: string, customerData: Partial<CustomerInput>): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },

  // Delete a customer
  delete: async (id: string): Promise<{ message: string, customer?: Customer }> => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  // Get customers by type
  getByType: async (type: 'regular' | 'wholesale' | 'vip'): Promise<Customer[]> => {
    const response = await api.get(`/customers/type/${type}`);
    return response.data;
  },

  // Get customers by tag
  getByTag: async (tag: string): Promise<Customer[]> => {
    const response = await api.get(`/customers/tag/${tag}`);
    return response.data;
  },

  // Search customers
  search: async (query: string): Promise<Customer[]> => {
    const response = await api.get(`/customers/search`, { params: { q: query } });
    return response.data;
  },

  // Get customer statistics
  getStats: async (): Promise<CustomerStats> => {
    const response = await api.get(`/customers/stats`);
    return response.data;
  },

  // Update customer status
  updateStatus: async (id: string, active: boolean): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}/status`, { active });
    return response.data;
  },

  // Add tags to customer
  addTags: async (id: string, tags: string[]): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}/tags/add`, { tags });
    return response.data;
  },

  // Remove tags from customer
  removeTags: async (id: string, tags: string[]): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}/tags/remove`, { tags });
    return response.data;
  },

  // Validate customer credit status
  validateCredit: async (id: string, orderAmount?: number): Promise<any> => {
    const params = orderAmount ? { orderAmount } : {};
    const response = await api.get(`/customers/${id}/credit-check`, { params });
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

// ============================
//      Inventory API
// ============================

export interface InventoryItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    sku: string;
    price: number;
    category: string;
  };
  quantity: number;
  location: string;
  minimumStockLevel: number;
  maximumStockLevel: number;
  reorderPoint: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  lastUpdated: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

export interface InventoryTransaction {
  _id: string;
  inventoryId: string;
  productId: string;
  type: 'receive' | 'issue' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  referenceId?: string;
  referenceType?: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  };
  date: string;
  notes?: string;
}

export interface InventorySummary {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  healthyStockCount: number;
  totalValue: number;
  topProducts: Array<{
    _id: string;
    productName: string;
    quantity: number;
    value: number;
  }>;
}

// Inventory API functions
export const inventoryAPI = {
  // Get all inventory with pagination and filters
  getAll: async (
    page = 1,
    limit = 10,
    status?: string,
    location?: string,
    search?: string
  ) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (status) params.append('status', status);
    if (location) params.append('location', location);
    if (search) params.append('search', search);

    const response = await api.get(`/inventory?${params.toString()}`);
    return response.data;
  },

  // Get inventory by ID
  getById: async (id: string) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  // Create new inventory
  create: async (inventoryData: {
    productId: string;
    quantity: number;
    location: string;
    minimumStockLevel?: number;
    maximumStockLevel?: number;
    reorderPoint?: number;
    batchNumber?: string;
    expiryDate?: string;
    notes?: string;
  }) => {
    const response = await api.post('/inventory', inventoryData);
    return response.data;
  },

  // Update inventory (except quantity)
  update: async (
    id: string,
    updateData: {
      minimumStockLevel?: number;
      maximumStockLevel?: number;
      reorderPoint?: number;
      location?: string;
      batchNumber?: string;
      expiryDate?: string;
      notes?: string;
    }
  ) => {
    const response = await api.put(`/inventory/${id}`, updateData);
    return response.data;
  },

  // Adjust inventory quantity
  adjustQuantity: async (
    id: string,
    adjustmentData: {
      quantity: number;
      type: 'receive' | 'issue' | 'adjustment' | 'transfer' | 'return';
      reason: string;
      referenceId?: string;
      referenceType?: string;
      notes?: string;
    }
  ) => {
    const response = await api.post(`/inventory/${id}/adjust`, adjustmentData);
    return response.data;
  },

  // Get inventory transactions
  getTransactions: async (id: string, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/inventory/${id}/transactions?${params.toString()}`);
    return response.data;
  },

  // Get low stock items
  getLowStock: async () => {
    const response = await api.get(`/inventory/low-stock`);
    return response.data;
  },

  // Delete inventory
  delete: async (id: string) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },

  // Get inventory summary
  getSummary: async () => {
    const response = await api.get(`/inventory/summary`);
    return response.data;
  },

  // Validate stock for products
  validateStock: async (products: { product: string, quantity: number }[]) => {
    const response = await api.post('/inventory/validate-stock', { products });
    return response.data;
  }
};

// Export inventory functions
export const getInventory = inventoryAPI.getAll;
export const getInventoryById = inventoryAPI.getById;
export const createInventory = inventoryAPI.create;
export const updateInventory = inventoryAPI.update;
export const adjustInventory = inventoryAPI.adjustQuantity;
export const getInventoryTransactions = inventoryAPI.getTransactions;
export const getLowStockItems = inventoryAPI.getLowStock;
export const deleteInventory = inventoryAPI.delete;
export const getInventorySummary = inventoryAPI.getSummary;
export const validateInventoryStock = inventoryAPI.validateStock;

// ============================
//      Employees API
// ============================
export const employeesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("/employees", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  create: async (employeeData: any) => {
    const response = await api.post("/employees", employeeData);
    return response.data;
  },

  update: async (id: string, employeeData: any) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  // Added to get sales reps specifically
  getSalesReps: async () => {
    const response = await api.get("/employees/sales-reps");
    return response.data;
  }
};


// ============================
//      Suppliers API
// ============================
// Interface for supplier data
export interface Supplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  products: string[];
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  products?: string[];
  notes?: string;
  isActive?: boolean;
}

export interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  products?: string[];
  notes?: string;
  isActive?: boolean;
}

export const suppliersAPI = {
  // Get all suppliers
  getAll: async (): Promise<Supplier[]> => {
    const response = await api.get('/suppliers');
    return response.data;
  },

  // Get a supplier by ID
  getById: async (id: string): Promise<Supplier> => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },

  // Create a new supplier
  create: async (supplierData: SupplierInput): Promise<Supplier> => {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },

  // Update a supplier
  update: async (id: string, supplierData: SupplierInput): Promise<Supplier> => {
    const response = await api.patch(`/suppliers/${id}`, supplierData);
    return response.data;
  },

  // Delete a supplier
  delete: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  }
};

// Export individual functions for flexibility
export const getAllSuppliers = suppliersAPI.getAll;
export const getSupplierById = suppliersAPI.getById;
export const createSupplier = suppliersAPI.create;
export const updateSupplier = suppliersAPI.update;
export const deleteSupplier = suppliersAPI.delete;


// ============================
//      Contact API
// ============================
// Contact interfaces

// frontend/src/utils/contactsApi.ts
interface Contact {
  _id?: string;
  name: string;
  email?: string;
  phone: string;
  company?: string;
  position?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const BASE_URL = 'contacts';

// Get all contacts
export const getContacts = async (): Promise<Contact[]> => {
  const response = await api.get('/contacts');
  return response.data;
};

// Get a single contact
export const getContact = async (id: string): Promise<Contact> => {
  const response = await api.get(`/contacts/${id}`);
  return response.data;
};

// Create a new contact
export const createContact = async (contactData: Contact): Promise<Contact> => {
  const response = await api.post('/contacts', contactData);
  return response.data;
};

// Update an existing contact
export const updateContact = async (id: string, contactData: Partial<Contact>): Promise<Contact> => {
  const response = await api.put(`/contacts/${id}`, contactData);
  return response.data;
};

// Delete a contact
export const deleteContact = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/contacts/${id}`);
  return response.data;
};

// Search contacts
export const searchContacts = async (query: string): Promise<Contact[]> => {
  const response = await api.get(`/contacts/search?query=${encodeURIComponent(query)}`);
  return response.data;
};

export type { Contact };

// ============================
//        Analytics API
// ============================

// Get dashboard analytics data
export const getDashboardAnalytics = async () => {
  const response = await api.get('/analytics/dashboard');
  return response.data;
};

// Get sales analytics data
export const getSalesAnalytics = async () => {
  const response = await api.get('/analytics/sales');
  return response.data;
};

// Get inventory analytics data
export const getInventoryAnalytics = async () => {
  const response = await api.get('/analytics/inventory');
  return response.data;
};


// ============================
//        Reports API
// ============================

export const reportsAPI = {
  // Get product categories data
  getProductCategories: async (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const response = await api.get(`/reports/product-categories?${params.toString()}`);
    return response.data;
  },

  // Get sales over time data
  getSalesOverTime: async (from: string, to: string) => {
    const params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);

    const response = await api.get(`/reports/sales-over-time?${params.toString()}`);
    return response.data;
  },

  // Get top selling products
  getTopSellingProducts: async (from?: string, to?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (limit) params.append('limit', limit.toString());

    const response = await api.get(`/reports/top-products?${params.toString()}`);
    return response.data;
  },

  // Get inventory status
  getInventoryStatus: async () => {
    const response = await api.get('/reports/inventory-status');
    return response.data;
  },

  // Get order status
  getOrderStatus: async (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const response = await api.get(`/reports/order-status?${params.toString()}`);
    return response.data;
  },

  // Export reports to CSV
  exportReport: async (reportType: string, params: any = {}) => {
    const queryParams = new URLSearchParams();

    // Add all parameters to the query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value as string);
      }
    });

    const response = await api.get(`/reports/export/${reportType}?${queryParams.toString()}`, {
      responseType: 'blob'
    });

    return response.data;
  }
};

// Export individual functions for flexibility
export const getProductCategories = reportsAPI.getProductCategories;
export const getSalesOverTime = reportsAPI.getSalesOverTime;
export const getTopSellingProducts = reportsAPI.getTopSellingProducts;
export const getInventoryStatus = reportsAPI.getInventoryStatus;
export const getOrderStatus = reportsAPI.getOrderStatus;
export const exportReport = reportsAPI.exportReport;

// ============================
//        Settings API
// ============================

// Settings enums and interfaces
export enum SettingScope {
  GLOBAL = 'global',
  ORGANIZATION = 'organization',
  USER = 'user'
}

export interface Setting {
  _id?: string;
  key: string;
  value: any;
  scope: SettingScope;
  userId?: string;
  organizationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  orderNotifications: boolean;
  inventoryAlerts: boolean;
  weeklyReports: boolean;
  supplierUpdates: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  sidebarCollapsed: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number; // in minutes
  lastPasswordChange?: Date;
}

export const settingsAPI = {
  // Get settings with optional key and format parameters
  getSettings: async (scope: SettingScope, key?: string, format: 'keyValue' | 'array' = 'array') => {
    const params = new URLSearchParams();
    params.append('scope', scope);

    if (key) {
      params.append('key', key);
    }

    if (format === 'keyValue') {
      params.append('format', 'keyValue');
    }

    const response = await api.get(`/settings?${params.toString()}`);
    return response.data;
  },

  // Update a single setting
  updateSetting: async (key: string, value: any, scope: SettingScope) => {
    const response = await api.put('/settings', { key, value, scope });
    return response.data;
  },

  // Bulk update settings
  bulkUpdateSettings: async (settings: Array<{ key: string, value: any }>, scope: SettingScope) => {
    const response = await api.put('/settings/bulk', { settings, scope });
    return response.data;
  },

  // Delete a setting
  deleteSetting: async (id: string) => {
    const response = await api.delete(`/settings/${id}`);
    return response.data;
  },

  // Get user profile settings
  getUserProfile: async () => {
    const response = await api.get('/settings?scope=user&key=profile&format=keyValue');
    return response.data.profile || {};
  },

  // Update user profile settings
  updateUserProfile: async (profileData: UserProfileSettings) => {
    const response = await api.put('/settings', {
      key: 'profile',
      value: profileData,
      scope: SettingScope.USER
    });
    return response.data;
  },

  // Get notification settings
  getNotificationSettings: async () => {
    const response = await api.get('/settings?scope=user&key=notifications&format=keyValue');
    return response.data.notifications || {
      emailNotifications: true,
      orderNotifications: true,
      inventoryAlerts: true,
      weeklyReports: true,
      supplierUpdates: true
    };
  },

  // Update notification settings
  updateNotificationSettings: async (notificationData: NotificationSettings) => {
    const response = await api.put('/settings', {
      key: 'notifications',
      value: notificationData,
      scope: SettingScope.USER
    });
    return response.data;
  },

  // Get appearance settings
  getAppearanceSettings: async () => {
    const response = await api.get('/settings?scope=user&key=appearance&format=keyValue');
    return response.data.appearance || {
      theme: 'system',
      compactMode: false,
      fontSize: 'medium',
      sidebarCollapsed: false
    };
  },

  // Update appearance settings
  updateAppearanceSettings: async (appearanceData: AppearanceSettings) => {
    const response = await api.put('/settings', {
      key: 'appearance',
      value: appearanceData,
      scope: SettingScope.USER
    });
    return response.data;
  },

  // Get security settings
  getSecuritySettings: async () => {
    const response = await api.get('/settings?scope=user&key=security&format=keyValue');
    return response.data.security || {
      twoFactorEnabled: false,
      sessionTimeout: 30
    };
  },

  // Update security settings
  updateSecuritySettings: async (securityData: SecuritySettings) => {
    const response = await api.put('/settings', {
      key: 'security',
      value: securityData,
      scope: SettingScope.USER
    });
    return response.data;
  }
};

// Export individual functions for flexibility
export const getSettings = settingsAPI.getSettings;
export const updateSetting = settingsAPI.updateSetting;
export const bulkUpdateSettings = settingsAPI.bulkUpdateSettings;
export const deleteSetting = settingsAPI.deleteSetting;
export const getUserProfile = settingsAPI.getUserProfile;
export const updateUserProfile = settingsAPI.updateUserProfile;
export const getNotificationSettings = settingsAPI.getNotificationSettings;
export const updateNotificationSettings = settingsAPI.updateNotificationSettings;
export const getAppearanceSettings = settingsAPI.getAppearanceSettings;
export const updateAppearanceSettings = settingsAPI.updateAppearanceSettings;
export const getSecuritySettings = settingsAPI.getSecuritySettings;
export const updateSecuritySettings = settingsAPI.updateSecuritySettings;

// ============================
//        Admin API
// ============================

// Admin interfaces
export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: string;
  details: string;
  ipAddress: string;
}

export interface AdminUser {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

export interface AdminGeneralSettings {
  companyName: string;
  supportEmail: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
}

export interface AdminSecuritySettings {
  requireMfa: boolean;
  passwordComplexity: string;
  sessionTimeout: string;
  maxLoginAttempts: string;
  allowPasswordReset: boolean;
}

export interface AdminNotificationSettings {
  emailNotifications: boolean;
  systemAlerts: boolean;
  userActivityAlerts: boolean;
  maintenanceAlerts: boolean;
}

export interface AdminBackupSettings {
  autoBackup: boolean;
  backupFrequency: string;
  retentionPeriod: string;
  lastBackupDate: string;
  backupLocation: string;
}

export interface RBACRole {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RBACPermission {
  _id: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const adminAPI = {
  // Get admin stats
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get activity logs
  getLogs: async () => {
    const response = await api.get('/admin/logs');
    return response.data;
  },

  // User management
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  createUser: async (userData: any) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (userId: string, userData: any) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Settings management
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateGeneralSettings: async (settings: AdminGeneralSettings) => {
    const response = await api.put('/admin/settings/general', settings);
    return response.data;
  },

  updateSecuritySettings: async (settings: AdminSecuritySettings) => {
    const response = await api.put('/admin/settings/security', settings);
    return response.data;
  },

  updateNotificationSettings: async (settings: AdminNotificationSettings) => {
    const response = await api.put('/admin/settings/notifications', settings);
    return response.data;
  },

  updateBackupSettings: async (settings: AdminBackupSettings) => {
    const response = await api.put('/admin/settings/backup', settings);
    return response.data;
  },

  // Backup management
  triggerManualBackup: async () => {
    const response = await api.post('/admin/backup/manual');
    return response.data;
  },

  // RBAC management
  getRoles: async () => {
    const response = await api.get('/admin/rbac/roles');
    return response.data;
  },

  createRole: async (roleData: { name: string; description?: string; permissions: string[] }) => {
    const response = await api.post('/admin/rbac/roles', roleData);
    return response.data;
  },

  updateRole: async (roleId: string, roleData: { name: string; description?: string; permissions: string[] }) => {
    const response = await api.put(`/admin/rbac/roles/${roleId}`, roleData);
    return response.data;
  },

  deleteRole: async (roleId: string) => {
    const response = await api.delete(`/admin/rbac/roles/${roleId}`);
    return response.data;
  },

  getPermissions: async () => {
    const response = await api.get('/admin/rbac/permissions');
    return response.data;
  },

  assignRolesToUser: async (userId: string, roleIds: string[]) => {
    const response = await api.put(`/admin/rbac/users/${userId}/roles`, { roleIds });
    return response.data;
  },

  getUserPermissions: async (userId: string) => {
    const response = await api.get(`/admin/rbac/users/${userId}/permissions`);
    return response.data;
  }
};

// Export individual admin functions
export const getAdminStats = adminAPI.getStats;
export const getActivityLogs = adminAPI.getLogs;
export const getAdminUsers = adminAPI.getUsers;
export const createAdminUser = adminAPI.createUser;
export const updateAdminUser = adminAPI.updateUser;
export const deleteAdminUser = adminAPI.deleteUser;
export const getAdminSettings = adminAPI.getSettings;
export const updateAdminGeneralSettings = adminAPI.updateGeneralSettings;
export const updateAdminSecuritySettings = adminAPI.updateSecuritySettings;
export const updateAdminNotificationSettings = adminAPI.updateNotificationSettings;
export const updateAdminBackupSettings = adminAPI.updateBackupSettings;
export const triggerAdminManualBackup = adminAPI.triggerManualBackup;
export const getAdminRoles = adminAPI.getRoles;
export const createAdminRole = adminAPI.createRole;
export const updateAdminRole = adminAPI.updateRole;
export const deleteAdminRole = adminAPI.deleteRole;
export const getAdminPermissions = adminAPI.getPermissions;
export const assignUserRoles = adminAPI.assignRolesToUser;
export const getUserRolePermissions = adminAPI.getUserPermissions;