// Unified API exports - single source of truth
export { default as api } from './index';

// Employee APIs
export { employeesAPI, getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, getSalesReps } from './employeesAPI';

// Attendance APIs  
export { default as attendanceAPI } from './attendanceAPI';

// Leave APIs
export { default as leaveAPI } from './leaveAPI';

// Inventory APIs
export { 
  inventoryAPI, 
  getInventory, 
  getInventoryById, 
  createInventory, 
  updateInventory, 
  adjustInventory, 
  getInventoryTransactions, 
  getLowStockItems, 
  deleteInventory, 
  getInventorySummary, 
  validateInventoryStock 
} from './inventoryAPI';

// Reports APIs
export { 
  reportsAPI, 
  getProductCategories, 
  getSalesOverTime, 
  getTopSellingProducts, 
  getInventoryStatus, 
  getOrderStatus, 
  getProjectReports, 
  getTaskReports, 
  getTeamProductivity, 
  exportReport 
} from './reportsAPI';

// Projects APIs
export { 
  projectsAPI, 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject, 
  getProjectTasks, 
  createProjectTask, 
  updateProjectTask, 
  deleteProjectTask, 
  getProjectStats 
} from './projectsAPI';

// Tasks APIs
export { 
  tasksAPI 
} from './tasksAPI';

// Main API functions from api.ts
export {
  authAPI,
  productsAPI,
  ordersAPI,
  customersAPI,
  suppliersAPI,
  settingsAPI,
  adminAPI
} from '../api';