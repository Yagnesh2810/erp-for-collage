// path: frontend/src/lib/suppliersAPI.ts
import api from './client';

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
    const response = await api.get('/api/suppliers');
    return response.data;
  },

  // Get a supplier by ID
  getById: async (id: string): Promise<Supplier> => {
    const response = await api.get(`/api/suppliers/${id}`);
    return response.data;
  },

  // Create a new supplier
  create: async (supplierData: SupplierInput): Promise<Supplier> => {
    const response = await api.post('/api/suppliers', supplierData);
    return response.data;
  },

  // Update a supplier
  update: async (id: string, supplierData: SupplierInput): Promise<Supplier> => {
    const response = await api.patch(`/api/suppliers/${id}`, supplierData);
    return response.data;
  },

  // Delete a supplier
  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/suppliers/${id}`);
  }
};

// Export individual functions for flexibility
export const getAllSuppliers = suppliersAPI.getAll;
export const getSupplierById = suppliersAPI.getById;
export const createSupplier = suppliersAPI.create;
export const updateSupplier = suppliersAPI.update;
export const deleteSupplier = suppliersAPI.delete;

export default suppliersAPI;