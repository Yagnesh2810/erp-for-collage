import ActivityLog from '../models/ActivityLog';

interface LogActivityParams {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  metadata?: any;
  status?: 'success' | 'error' | 'warning';
  ipAddress?: string;
}

export const logActivity = async (params: LogActivityParams): Promise<void> => {
  try {
    const activityLog = new ActivityLog({
      user: params.userId,
      action: params.action,
      resource: params.resource,
      details: params.details,
      status: params.status || 'success',
      ipAddress: params.ipAddress || '127.0.0.1'
    });

    await activityLog.save();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};