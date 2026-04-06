import apiClient from '../client';

export interface BudgetCategory {
  _id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  utilization: number;
  status: 'active' | 'exceeded' | 'completed';
  description: string;
}

export interface ProjectBudget {
  _id: string;
  projectId: string;
  totalBudget: number;
  spentAmount: number;
  remainingBudget: number;
  budgetUtilization: number;
  categories: BudgetCategory[];
  createdBy: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetOverview {
  totalBudget: number;
  spentAmount: number;
  remainingBudget: number;
  budgetUtilization: number;
  categories: BudgetCategory[];
}

export interface CreateBudgetData {
  totalBudget: number;
  categories: {
    name: string;
    allocatedAmount: number;
    description: string;
  }[];
}

export interface CreateCategoryData {
  name: string;
  allocatedAmount: number;
  description: string;
}

// Get budget overview for a project
export const getBudgetOverview = async (projectId: string): Promise<BudgetOverview> => {
  const response = await apiClient.get(`/project-budgets/${projectId}/overview`);
  return response.data.data;
};

// Get project budget
export const getProjectBudget = async (projectId: string): Promise<ProjectBudget> => {
  const response = await apiClient.get(`/project-budgets/${projectId}`);
  return response.data.data;
};

// Create project budget
export const createProjectBudget = async (projectId: string, budgetData: CreateBudgetData): Promise<ProjectBudget> => {
  const response = await apiClient.post(`/project-budgets/${projectId}`, budgetData);
  return response.data.data;
};

// Update project budget
export const updateProjectBudget = async (
  projectId: string, 
  budgetData: Partial<CreateBudgetData>
): Promise<ProjectBudget> => {
  const response = await apiClient.put(`/project-budgets/${projectId}`, budgetData);
  return response.data.data;
};

// Add budget category
export const addBudgetCategory = async (
  projectId: string, 
  categoryData: CreateCategoryData
): Promise<ProjectBudget> => {
  const response = await apiClient.post(`/project-budgets/${projectId}/categories`, categoryData);
  return response.data.data;
};

// Update budget category
export const updateBudgetCategory = async (
  projectId: string, 
  categoryId: string, 
  categoryData: Partial<CreateCategoryData>
): Promise<ProjectBudget> => {
  const response = await apiClient.put(`/project-budgets/${projectId}/categories/${categoryId}`, categoryData);
  return response.data.data;
};

// Delete budget category
export const deleteBudgetCategory = async (projectId: string, categoryId: string): Promise<ProjectBudget> => {
  const response = await apiClient.delete(`/project-budgets/${projectId}/categories/${categoryId}`);
  return response.data.data;
};