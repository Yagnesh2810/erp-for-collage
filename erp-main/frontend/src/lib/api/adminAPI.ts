import api from './client';
// path: frontend/src/lib/adminApi.ts
import axios from "axios";

const ADMIN_API_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL;

export const adminApi = axios.create({
  baseURL: `${ADMIN_API_URL}/admin`,
  withCredentials: true,
});


// Types
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  systemAlerts: number;
}

export interface AdminUser {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: string;
  details: string;
  ipAddress: string;
}

export interface AdminGeneralSettings {
  companyName: string;
  supportEmail: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
}

export interface AdminSecuritySettings {
  requireMfa: boolean;
  passwordComplexity: string;
  sessionTimeout: string;
  maxLoginAttempts: string;
  allowPasswordReset: boolean;
}

export interface AdminNotificationSettings {
  emailNotifications: boolean;
  systemAlerts: boolean;
  userActivityAlerts: boolean;
  maintenanceAlerts: boolean;
}

export interface AdminBackupSettings {
  autoBackup: boolean;
  backupFrequency: string;
  retentionPeriod: string;
  lastBackupDate: string;
  backupLocation: string;
}

export interface AdminSettings {
  general: AdminGeneralSettings;
  security: AdminSecuritySettings;
  notifications: AdminNotificationSettings;
  backup: AdminBackupSettings;
}

// Default export with all admin functions
const adminAPI = {
  // Admin Stats
  getStats: async (): Promise<AdminStats> => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  // User Management
  getUsers: async (): Promise<AdminUser[]> => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  createUser: async (userData: any): Promise<AdminUser> => {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (userId: string, userData: any): Promise<AdminUser> => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (userId: string): Promise<void> => {
    try {
      await api.delete(`/admin/users/${userId}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Activity Logs
  getLogs: async (params?: any): Promise<ActivityLog[]> => {
    try {
      const response = await api.get('/admin/logs', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  },

  // Settings
  getSettings: async (): Promise<AdminSettings> => {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  },

  updateGeneralSettings: async (settings: AdminGeneralSettings): Promise<AdminGeneralSettings> => {
    try {
      const response = await api.put('/admin/settings/general', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating general settings:', error);
      throw error;
    }
  },

  updateSecuritySettings: async (settings: AdminSecuritySettings): Promise<AdminSecuritySettings> => {
    try {
      const response = await api.put('/admin/settings/security', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  },

  updateNotificationSettings: async (settings: AdminNotificationSettings): Promise<AdminNotificationSettings> => {
    try {
      const response = await api.put('/admin/settings/notifications', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  },

  updateBackupSettings: async (settings: AdminBackupSettings): Promise<AdminBackupSettings> => {
    try {
      const response = await api.put('/admin/settings/backup', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating backup settings:', error);
      throw error;
    }
  },

  triggerManualBackup: async (): Promise<{ success: boolean; timestamp: string }> => {
    try {
      const response = await api.post('/admin/backup/manual');
      return response.data;
    } catch (error) {
      console.error('Error triggering manual backup:', error);
      throw error;
    }
  },

  // Role Management
  getRoles: async (): Promise<any[]> => {
    try {
      const response = await api.get('/auth/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  },

  assignRolesToUser: async (userId: string, roleIds: string[]): Promise<AdminUser> => {
    try {
      const response = await api.put(`/auth/users/${userId}/role`, { role: roleIds[0] });
      return response.data.user;
    } catch (error) {
      console.error('Error assigning roles to user:', error);
      throw error;
    }
  },

  updateUserRole: async (userId: string, role: string): Promise<AdminUser> => {
    try {
      const response = await api.put(`/auth/users/${userId}/role`, { role });
      return response.data.user;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },
};

export default adminAPI;