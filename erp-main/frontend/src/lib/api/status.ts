// API Status Checker - helps debug API issues
import api from './index';

export const checkAPIStatus = async () => {
  const endpoints = [
    '/employees',
    '/attendance/today-stats', 
    '/leaves',
    '/inventory/summary',
    '/projects/stats',
    '/orders/stats',
    '/customers/stats'
  ];

  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      await api.get(endpoint, { timeout: 5000 });
      results.push({ endpoint, status: 'OK', error: null });
    } catch (error: any) {
      const status = error.response?.status || 'NETWORK_ERROR';
      const message = error.response?.data?.message || error.message;
      results.push({ endpoint, status, error: message });
    }
  }
  
  return results;
};

// Helper to check if user has required permissions
export const checkPermissions = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Permission check failed:', error);
    return null;
  }
};