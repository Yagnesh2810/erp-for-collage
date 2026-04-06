// path: frontend/src/lib/productsAPI.ts
import api from './client';

export const productsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("/api/products", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  create: async (productData: any) => {
    const response = await api.post("/api/products", productData);
    return response.data;
  },

  update: async (id: string, productData: any) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },
};

// Export individual functions for flexibility
export const fetchProduct = async (id: string) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

export const getAllProducts = productsAPI.getAll;
export const getProductById = productsAPI.getById;
export const createProduct = productsAPI.create;
export const updateProduct = productsAPI.update;
export const deleteProduct = productsAPI.delete;

export default productsAPI;