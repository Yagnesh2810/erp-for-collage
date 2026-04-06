// path: frontend/src/lib/api/inventoryAPI.ts
import api from './client';
import { AxiosError } from 'axios';

// Enhanced type definitions
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

export interface StockValidationItem {
  product: string;
  quantity: number;
}

export interface StockValidationResult {
  valid: boolean;
  invalidItems?: Array<{
    productId: string;
    productName: string;
    requested: number;
    available: number;
  }>;
  message?: string;
}

// Error handling utility
const handleApiError = (error: unknown, defaultMessage: string): never => {
  // If it's an axios error with response data
  if (error instanceof AxiosError && error.response?.data) {
    console.error('Inventory API Error:', error.response.data);
    throw new Error(
      typeof error.response.data.message === 'string' 
        ? error.response.data.message 
        : defaultMessage
    );
  } 
  
  // For network errors or other issues
  console.error('Inventory API Error:', error);
  throw new Error(defaultMessage);
};

// Inventory API functions with improved error handling and typing
export const inventoryAPI = {
  // Get all inventory with pagination and filters
  getAll: async (
    page = 1, 
    limit = 10, 
    status?: string, 
    location?: string, 
    search?: string
  ): Promise<{ data: InventoryItem[], pagination: { total: number, page: number, limit: number, pages: number } }> => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (status) params.append('status', status);
      if (location) params.append('location', location);
      if (search) params.append('search', search);
      
      const response = await api.get(`/inventory?${params.toString()}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch inventory items');
    }
  },

  // Get inventory by ID with type safety
  getById: async (id: string): Promise<InventoryItem> => {
    try {
      const response = await api.get(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch inventory item with ID: ${id}`);
    }
  },

  // Create new inventory with better typing
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
  }): Promise<InventoryItem> => {
    try {
      const response = await api.post('/inventory', inventoryData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to create inventory item');
    }
  },

  // Update inventory with improved error handling
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
  ): Promise<InventoryItem> => {
    try {
      const response = await api.put(`/inventory/${id}`, updateData);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to update inventory item with ID: ${id}`);
    }
  },

  // Adjust inventory quantity with better typing
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
  ): Promise<InventoryItem> => {
    try {
      const response = await api.post(`/inventory/${id}/adjust`, adjustmentData);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to adjust quantity for inventory item with ID: ${id}`);
    }
  },

  // Get inventory transactions with pagination
  getTransactions: async (id: string, page = 1, limit = 10): Promise<{ 
    data: InventoryTransaction[], 
    pagination: { total: number, page: number, limit: number, pages: number } 
  }> => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const response = await api.get(`/inventory/${id}/transactions?${params.toString()}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch transactions for inventory item with ID: ${id}`);
    }
  },

  // Get low stock items with better return type
  getLowStock: async (): Promise<InventoryItem[]> => {
    try {
      const response = await api.get(`/inventory/low-stock`);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch low stock items');
    }
  },

  // Delete inventory with response typing
  delete: async (id: string): Promise<{ success: boolean, message: string }> => {
    try {
      const response = await api.delete(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to delete inventory item with ID: ${id}`);
    }
  },

  // Get inventory summary with retries and better error handling
  getSummary: async (retries = 2): Promise<InventorySummary> => {
    let attempt = 0;
    
    while (attempt <= retries) {
      try {
        console.log(`Fetching inventory summary (attempt ${attempt + 1}/${retries + 1})...`);
        const response = await api.get('/inventory/summary');
        return response.data;
      } catch (error) {
        attempt++;
        
        // If it's the last attempt, throw the error
        if (attempt > retries) {
          return handleApiError(error, 'Failed to fetch inventory summary');
        }
        
        // Otherwise wait before retrying
        console.warn(`Inventory summary fetch failed, retrying in ${attempt * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
    
    // This should never happen due to the throw in the catch block, but TypeScript needs it
    throw new Error('Failed to fetch inventory summary after all retries');
  },
  
  // Validate stock with better typing
  validateStock: async (products: StockValidationItem[]): Promise<StockValidationResult> => {
    try {
      const response = await api.post('/inventory/validate-stock', { products });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to validate stock levels');
    }
  },
  
  // Add batch operations for efficiency
  batchUpdate: async (updates: Array<{ id: string, updates: Partial<InventoryItem> }>): Promise<{ 
    success: boolean, 
    updated: number, 
    errors: Array<{ id: string, error: string }> 
  }> => {
    try {
      const response = await api.post('/inventory/batch-update', { updates });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to perform batch update on inventory items');
    }
  },
  
  // Get inventory for a specific product
  getByProduct: async (productId: string): Promise<InventoryItem[]> => {
    try {
      const response = await api.get(`/inventory/product/${productId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, `Failed to fetch inventory for product ID: ${productId}`);
    }
  },
  
  // Get inventory statistics
  getStats: async (): Promise<{
    totalCount: number,
    totalValue: number,
    averageStockLevel: number,
    averageReorderPoint: number,
    lowStockPercentage: number,
    outOfStockCount: number
  }> => {
    try {
      const response = await api.get('/inventory/stats');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch inventory statistics');
    }
  }
};

// Export individual functions with improved typing
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
export const batchUpdateInventory = inventoryAPI.batchUpdate;
export const getInventoryByProduct = inventoryAPI.getByProduct;
export const getInventoryStats = inventoryAPI.getStats;

export default inventoryAPI;