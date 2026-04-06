// API client configuration
import axios from "axios";

// Validate API_URL is set
const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL environment variable is not set");
}

// Create unified Axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      console.log("Adding auth token to request:", config.url);
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Clean up URL paths
    if (config.url) {
      config.url = config.url.replace(/([^:])\/\/{2,}/g, '$1/');
      if (config.url.startsWith('/api') && config.baseURL?.endsWith('/api')) {
        config.url = config.url.substring(4);
      }
    }
    
    console.log(`API URL being used: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Request Error:', error.message);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem("auth-token");
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;