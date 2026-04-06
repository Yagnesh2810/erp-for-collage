// frontend/src/lib/services/inventoryService.ts

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api/inventory`;

// Types
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

// Updated inventory form data interface to include forceUpdate flag
export interface InventoryFormData {
  productId: string;
  quantity: number;
  location: string;
  minimumStockLevel?: number;
  maximumStockLevel?: number;
  reorderPoint?: number;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
  forceUpdate?: boolean;
}

// Response interface with confirmUpdate flag
export interface InventoryResponse {
  success: boolean;
  data?: any;
  error?: string;
  confirmUpdate?: boolean;
  message?: string;
  suggestion?: string;
}

// Get all inventory items with pagination and filtering
// Ensure these functions explicitly include the auth token
export const getInventory = async (page = 1, limit = 10, status = '', location = '', search = '') => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (status) params.append('status', status);
    if (location) params.append('location', location);
    if (search) params.append('search', search);
    
    // FIX: Use direct API URL without redundancy
    const url = `${API_BASE_URL}/api/inventory`;
    
    console.log(`Making inventory request to: ${url}?${params.toString()}`);
    
    const response = await axios.get(url, {
      params: Object.fromEntries(params),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    console.error("Inventory fetch error:", error);
    throw error;
  }
};

// Get inventory item by ID
export const getInventoryById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new inventory item with option to force update
export const createInventory = async (inventoryData: InventoryFormData): Promise<InventoryResponse> => {
  try {
    const response = await axios.post(API_URL, inventoryData, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error: any) {
    // Handle existing inventory response from backend
    if (error.response?.status === 409 && error.response?.data?.data) {
      return {
        success: false,
        confirmUpdate: true,
        data: error.response.data.data,
        message: error.response.data.error,
        suggestion: error.response.data.suggestion
      };
    }
    
    // Return other errors
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to create inventory'
    };
  }
};

// Update inventory item (except quantity)
export const updateInventory = async (id: string, updateData: {
  minimumStockLevel?: number;
  maximumStockLevel?: number;
  reorderPoint?: number;
  location?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updateData, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Adjust inventory quantity
export const adjustInventory = async (id: string, adjustmentData: {
  quantity: number;
  type: 'receive' | 'issue' | 'adjustment' | 'transfer' | 'return';
  reason: string;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
}) => {
  try {
    // Ensure quantity is sent as a number
    const dataToSend = {
      ...adjustmentData,
      quantity: Number(adjustmentData.quantity)
    };
    
    // Changed from put to post to match backend route
    const response = await axios.post(`${API_URL}/${id}/adjust`, dataToSend, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Adjustment request failed:', error.response?.data || error.message);
    throw error;
  }
};

// Get inventory transactions
export const getInventoryTransactions = async (id: string, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await axios.get(`${API_URL}/${id}/transactions?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get low stock items
export const getLowStockItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/low-stock`, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete inventory item
export const deleteInventory = async (id: string) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get inventory summary
export const getInventorySummary = async () => {
  try {
    // FIX: Use direct API URL without redundancy
    const url = `${API_BASE_URL}/api/inventory/summary`;
    
    console.log(`Making inventory summary request to: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    console.error("Inventory summary fetch error:", error);
    throw error;
  }
};

// Service object with all functions (for backward compatibility)
const inventoryService = {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  adjustInventory,
  getInventoryTransactions,
  getLowStockItems,
  deleteInventory,
  getInventorySummary
};

export default inventoryService;