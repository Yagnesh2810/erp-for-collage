import apiClient from '../client';

export interface Payment {
  _id: string;
  projectId: string;
  paymentNumber: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  date: string;
  method: 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'paypal';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference: string;
  linkedInvoiceId?: string;
  clientName?: string;
  vendorName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  totalPayments: number;
  totalIncoming: number;
  totalOutgoing: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  paymentsByStatus: {
    pending: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  paymentsByMethod: {
    bank_transfer: number;
    credit_card: number;
    cash: number;
    check: number;
    paypal: number;
  };
}

export interface CreatePaymentData {
  paymentNumber?: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  date: string;
  method: 'bank_transfer' | 'credit_card' | 'cash' | 'check' | 'paypal';
  description: string;
  reference: string;
  linkedInvoiceNumber?: string;
  clientName?: string;
  vendorName?: string;
}

export interface PaymentFilters {
  status?: string;
  type?: string;
  method?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// Get payment summary for a project
export const getPaymentSummary = async (projectId: string): Promise<PaymentSummary> => {
  const response = await apiClient.get(`/payments/${projectId}/summary`);
  return response.data.data;
};

// Get all payments for a project
export const getProjectPayments = async (
  projectId: string, 
  filters?: PaymentFilters
): Promise<{ payments: Payment[]; pagination: any }> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.method) params.append('method', filters.method);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.search) params.append('search', filters.search);

  const response = await apiClient.get(`/payments/${projectId}?${params.toString()}`);
  return response.data.data;
};

// Get specific payment
export const getPaymentById = async (projectId: string, paymentId: string): Promise<Payment> => {
  const response = await apiClient.get(`/payments/${projectId}/payment/${paymentId}`);
  return response.data.data;
};

// Create new payment
export const createPayment = async (projectId: string, paymentData: CreatePaymentData): Promise<Payment> => {
  const response = await apiClient.post(`/payments/${projectId}`, paymentData);
  return response.data.data;
};

// Update payment
export const updatePayment = async (
  projectId: string, 
  paymentId: string, 
  paymentData: Partial<CreatePaymentData>
): Promise<Payment> => {
  const response = await apiClient.put(`/payments/${projectId}/payment/${paymentId}`, paymentData);
  return response.data.data;
};

// Update payment status
export const updatePaymentStatus = async (
  projectId: string, 
  paymentId: string, 
  status: string
): Promise<Payment> => {
  const response = await apiClient.patch(`/payments/${projectId}/payment/${paymentId}/status`, { status });
  return response.data.data;
};

// Delete payment
export const deletePayment = async (projectId: string, paymentId: string): Promise<void> => {
  await apiClient.delete(`/payments/${projectId}/payment/${paymentId}`);
};