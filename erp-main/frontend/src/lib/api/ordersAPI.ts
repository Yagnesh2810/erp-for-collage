// path: frontend/src/lib/ordersAPI.ts
import { ReactNode } from 'react';
import api from './client';

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
  orderNumber: ReactNode;
  _id: string;
  customer: string | any; // Using any instead of Customer to avoid circular dependencies
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
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

  getAll: async (params: OrderFilterParams = {}) => {
    const response = await api.get("/api/orders", { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },

  create: async (orderData: OrderInput) => {
    // Calculate total amount if not provided
    if (!orderData.totalAmount && orderData.products.length > 0) {
      orderData.totalAmount = calculateOrderTotal(orderData.products);
    }
    
    const response = await api.post("/api/orders", orderData);
    return response.data;
  },

  update: async (id: string, orderData: Partial<OrderInput>) => {
    // Calculate total amount if products are being updated but total not provided
    if (orderData.products && !orderData.totalAmount) {
      orderData.totalAmount = calculateOrderTotal(orderData.products);
    }
    
    const response = await api.put(`/api/orders/${id}`, orderData);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.put(`/api/orders/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/orders/${id}`);
    return response.data;
  },
  
  getByCustomer: async (customerId: string) => {
    const response = await api.get(`/api/orders/customer/${customerId}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get(`/api/orders/stats`);
    return response.data;
  },
  
  // Added to validate order before submission
  validateOrder: async (orderData: OrderInput) => {
    const response = await api.post("/api/orders/validate", orderData);
    return response.data;
  },

  // New functions for order fulfillment and completion
  fulfillOrder: async (id: string, fulfillmentData: FulfillOrderInput) => {
    const response = await api.put(`/api/orders/${id}/fulfill`, fulfillmentData);
    return response.data;
  },
  
  completeOrder: async (id: string, completionData: CompleteOrderInput) => {
    const response = await api.put(`/api/orders/${id}/complete`, completionData);
    return response.data;
  },
  
  generateInvoice: async (id: string) => {
    const response = await api.get(`/api/orders/${id}/invoice`);
    return response.data;
  },
  
  archiveOrder: async (id: string) => {
    const response = await api.put(`/api/orders/${id}/archive`, { isArchived: true });
    return response.data;
  },
  
  getAuditTrail: async (id: string) => {
    const response = await api.get(`/api/orders/${id}/audit-trail`);
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

export default ordersAPI;