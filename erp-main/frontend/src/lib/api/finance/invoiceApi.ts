import apiClient from '../client';

export interface InvoiceItem {
  _id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  _id: string;
  projectId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  description: string;
  items: InvoiceItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSummary {
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  invoicesByStatus: {
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    cancelled: number;
  };
}

export interface CreateInvoiceData {
  invoiceNumber?: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  description: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
  }[];
}

export interface InvoiceFilters {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// Get invoice summary for a project
export const getInvoiceSummary = async (projectId: string): Promise<InvoiceSummary> => {
  const response = await apiClient.get(`/project-finance/${projectId}/summary`);
  return response.data.data;
};

// Get all invoices for a project
export const getProjectInvoices = async (
  projectId: string, 
  filters?: InvoiceFilters
): Promise<{ invoices: Invoice[]; pagination: any }> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.search) params.append('search', filters.search);

  const response = await apiClient.get(`/project-finance/${projectId}?${params.toString()}`);
  return response.data.data;
};

// Get specific invoice
export const getInvoiceById = async (projectId: string, invoiceId: string): Promise<Invoice> => {
  const response = await apiClient.get(`/project-finance/${projectId}/invoices/${invoiceId}`);
  return response.data.data;
};

// Create new invoice
export const createInvoice = async (projectId: string, invoiceData: CreateInvoiceData): Promise<Invoice> => {
  const response = await apiClient.post(`/project-finance/${projectId}`, invoiceData);
  return response.data.data;
};

// Update invoice
export const updateInvoice = async (
  projectId: string, 
  invoiceId: string, 
  invoiceData: Partial<CreateInvoiceData>
): Promise<Invoice> => {
  const response = await apiClient.put(`/project-finance/${projectId}/invoices/${invoiceId}`, invoiceData);
  return response.data.data;
};

// Update invoice status
export const updateInvoiceStatus = async (
  projectId: string, 
  invoiceId: string, 
  status: string
): Promise<Invoice> => {
  const response = await apiClient.patch(`/project-finance/${projectId}/invoices/${invoiceId}/status`, { status });
  return response.data.data;
};

// Delete invoice
export const deleteInvoice = async (projectId: string, invoiceId: string): Promise<void> => {
  await apiClient.delete(`/project-finance/${projectId}/invoices/${invoiceId}`);
};

// Send invoice
export const sendInvoice = async (projectId: string, invoiceId: string): Promise<Invoice> => {
  const response = await apiClient.post(`/project-finance/${projectId}/invoices/${invoiceId}/send`);
  return response.data.data;
};

// Mark invoice as paid
export const markInvoiceAsPaid = async (projectId: string, invoiceId: string): Promise<Invoice> => {
  const response = await apiClient.post(`/project-finance/${projectId}/invoices/${invoiceId}/mark-paid`);
  return response.data.data;
};