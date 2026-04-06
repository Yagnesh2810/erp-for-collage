// Finance module configuration
export const FINANCE_CONFIG = {
  // Disable socket connections for finance module to prevent xhr poll errors
  USE_SOCKET: false,
  API_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  MOCK_DATA_ENABLED: true
};

// Safe API wrapper that doesn't use sockets
export const createFinanceApiCall = (endpoint: string, options: RequestInit = {}) => {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Disable any socket-related options
    mode: 'cors',
    credentials: 'include',
  }).catch(error => {
    console.warn(`Finance API call failed for ${endpoint}:`, error);
    throw error;
  });
};