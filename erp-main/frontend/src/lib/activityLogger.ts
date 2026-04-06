const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ActivityLogData {
  action: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout' | 'export' | 'import';
  resource: string;
  details: string;
  status?: 'success' | 'error' | 'warning';
  metadata?: Record<string, any>;
}

class ActivityLogger {
  private static instance: ActivityLogger;
  private queue: ActivityLogData[] = [];
  private isProcessing = false;

  static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  async log(data: ActivityLogData) {
    this.queue.push({ ...data, status: data.status || 'success' });
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    const batch = this.queue.splice(0, 10); // Process in batches
    
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) return;

      await fetch(`${API_URL}/api/activity/batch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logs: batch })
      });
    } catch (error) {
      console.error('Failed to log activities:', error);
      // Re-queue failed items
      this.queue.unshift(...batch);
    } finally {
      this.isProcessing = false;
      // Process remaining items
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }
}

export const logActivity = (data: ActivityLogData) => {
  ActivityLogger.getInstance().log(data);
};

// Convenience methods
export const logUserAction = (action: ActivityLogData['action'], userId: string, details: string, metadata?: Record<string, any>) => {
  logActivity({ action, resource: 'user', details: `User ${userId}: ${details}`, metadata });
};

export const logSystemAction = (action: ActivityLogData['action'], details: string, metadata?: Record<string, any>) => {
  logActivity({ action, resource: 'system', details, metadata });
};

export const logError = (resource: string, details: string, error?: any) => {
  logActivity({ 
    action: 'view', 
    resource, 
    details, 
    status: 'error',
    metadata: { error: error?.message || error }
  });
};

export const getActivityLogs = async (filters?: {
  action?: string;
  status?: string;
  resource?: string;
  user?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const token = localStorage.getItem('auth-token');
    if (!token) return { logs: [], total: 0, page: 1, totalPages: 1 };

    const params = new URLSearchParams();
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });

    const response = await fetch(`${API_URL}/api/activity/logs?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return await response.json();
    }
    return { logs: [], total: 0, page: 1, totalPages: 1 };
  } catch (error) {
    logError('activity', 'Failed to fetch activity logs', error);
    return { logs: [], total: 0, page: 1, totalPages: 1 };
  }
};

export const getActivityStats = async () => {
  try {
    const token = localStorage.getItem('auth-token');
    if (!token) return null;

    const response = await fetch(`${API_URL}/api/activity/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    logError('activity', 'Failed to fetch activity stats', error);
    return null;
  }
};