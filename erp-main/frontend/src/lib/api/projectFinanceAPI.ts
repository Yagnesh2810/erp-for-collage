//path: frontend/src/lib/api/projectFinanceAPI.ts
import { api } from '@/utils/api';

export interface ProjectExpense {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  projectId: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  receipts: string[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';
  approvedBy?: string;
  approvedAt?: string;
  reimbursedAt?: string;
  sourceModule: 'PMS' | 'FINANCE';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInvoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  description: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFinanceData {
  budget: number;
  totalExpenses: number;
  totalRevenue: number;
  profitLoss: number;
  remainingBudget: number;
  expenses: ProjectExpense[];
  invoices: ProjectInvoice[];
}

export interface ProjectFinanceReports {
  summary: {
    budget: number;
    totalExpenses: number;
    remainingBudget: number;
    budgetUtilization: number;
  };
  expensesByCategory: Record<string, number>;
  monthlyExpenses: Record<string, number>;
  recentExpenses: ProjectExpense[];
}

// Get project finance data
export const getProjectFinance = async (projectId: string): Promise<ProjectFinanceData> => {
  const response = await api.get(`/projects/${projectId}/finance`);
  return response.data;
};

// Create project expense
export const createProjectExpense = async (
  projectId: string, 
  expenseData: Partial<ProjectExpense>
): Promise<ProjectExpense> => {
  const response = await api.post(`/projects/${projectId}/finance/expenses`, expenseData);
  return response.data;
};

// Update project expense
export const updateProjectExpense = async (
  projectId: string,
  expenseId: string,
  expenseData: Partial<ProjectExpense>
): Promise<ProjectExpense> => {
  const response = await api.put(`/projects/${projectId}/finance/expenses/${expenseId}`, expenseData);
  return response.data;
};

// Delete project expense
export const deleteProjectExpense = async (
  projectId: string,
  expenseId: string
): Promise<void> => {
  await api.delete(`/projects/${projectId}/finance/expenses/${expenseId}`);
};

// Update project budget
export const updateProjectBudget = async (
  projectId: string,
  budget: number
): Promise<{ budget: number }> => {
  const response = await api.put(`/projects/${projectId}/finance/budget`, { budget });
  return response.data;
};

// Get project finance reports
export const getProjectFinanceReports = async (projectId: string): Promise<ProjectFinanceReports> => {
  const response = await api.get(`/projects/${projectId}/finance/reports`);
  return response.data;
};

// Invoice management
export const getProjectInvoices = async (projectId: string): Promise<ProjectInvoice[]> => {
  const response = await api.get(`/projects/${projectId}/finance/invoices`);
  return response.data;
};

export const createProjectInvoice = async (
  projectId: string, 
  invoiceData: Partial<ProjectInvoice>
): Promise<ProjectInvoice> => {
  const response = await api.post(`/projects/${projectId}/finance/invoices`, invoiceData);
  return response.data;
};

export const updateProjectInvoice = async (
  projectId: string,
  invoiceId: string,
  invoiceData: Partial<ProjectInvoice>
): Promise<ProjectInvoice> => {
  const response = await api.put(`/projects/${projectId}/finance/invoices/${invoiceId}`, invoiceData);
  return response.data;
};

export const deleteProjectInvoice = async (
  projectId: string,
  invoiceId: string
): Promise<void> => {
  await api.delete(`/projects/${projectId}/finance/invoices/${invoiceId}`);
};