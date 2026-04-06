import apiClient from '../client';

export interface Expense {
  _id: string;
  projectId: string;
  employeeId: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  employeeName: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';
  receipts: string[];
  approvedBy?: string;
  approvedAt?: string;
  reimbursedAt?: string;
  sourceModule?: 'PMS' | 'FINANCE';
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  totalExpenses: number;
  approvedExpenses: number;
  pendingExpenses: number;
  rejectedExpenses: number;
  expensesByCategory: Record<string, number>;
  expensesByStatus: {
    draft: number;
    submitted: number;
    approved: number;
    rejected: number;
    reimbursed: number;
  };
}

export interface CreateExpenseData {
  category: string;
  amount: number;
  date: string;
  description: string;
  employeeName: string;
}

export interface ExpenseFilters {
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// Get expense summary for a project
export const getExpenseSummary = async (projectId: string): Promise<ExpenseSummary> => {
  const response = await apiClient.get(`/expenses/${projectId}/summary`);
  return response.data.data;
};

// Get all expenses for a project
export const getProjectExpenses = async (
  projectId: string, 
  filters?: ExpenseFilters
): Promise<{ expenses: Expense[]; pagination: any }> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.search) params.append('search', filters.search);

  const response = await apiClient.get(`/project-finance/${projectId}/expenses?${params.toString()}`);
  return response.data.data;
};

// Get specific expense
export const getExpenseById = async (projectId: string, expenseId: string): Promise<Expense> => {
  const response = await apiClient.get(`/project-finance/${projectId}/expenses/${expenseId}`);
  return response.data.data;
};

// Create new expense
export const createProjectExpense = async (projectId: string, expenseData: CreateExpenseData): Promise<Expense> => {
  const response = await apiClient.post(`/project-finance/${projectId}/expenses`, {
    ...expenseData,
    projectId,
    sourceModule: 'PMS'
  });
  return response.data.data;
};

// Update expense
export const updateProjectExpense = async (
  projectId: string, 
  expenseId: string, 
  expenseData: Partial<CreateExpenseData>
): Promise<Expense> => {
  const response = await apiClient.put(`/project-finance/${projectId}/expenses/${expenseId}`, expenseData);
  return response.data.data;
};

// Update expense status
export const updateExpenseStatus = async (
  projectId: string, 
  expenseId: string, 
  status: string
): Promise<Expense> => {
  const response = await apiClient.patch(`/project-finance/${projectId}/expenses/${expenseId}/status`, { status });
  return response.data.data;
};

// Delete expense
export const deleteProjectExpense = async (projectId: string, expenseId: string): Promise<void> => {
  await apiClient.delete(`/project-finance/${projectId}/expenses/${expenseId}`);
};

// Approve expense
export const approveExpense = async (projectId: string, expenseId: string): Promise<Expense> => {
  const response = await apiClient.put(`/project-finance/${projectId}/expenses/${expenseId}/approve`);
  return response.data.data;
};

// Reject expense
export const rejectExpense = async (projectId: string, expenseId: string, reason?: string): Promise<Expense> => {
  const response = await apiClient.put(`/project-finance/${projectId}/expenses/${expenseId}/reject`, { reason });
  return response.data.data;
};