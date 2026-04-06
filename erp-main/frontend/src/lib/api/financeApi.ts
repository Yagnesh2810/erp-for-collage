const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.warn(`API Error ${response.status}:`, errorText);
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    console.warn('Response is not valid JSON:', text);
    return { error: 'Invalid response format' };
  }
};

const safeApiCall = async (apiCall: () => Promise<any>, fallbackData: any) => {
  try {
    return await apiCall();
  } catch (error) {
    console.warn('API call failed, using fallback data:', error);
    return fallbackData;
  }
};

export const financeApi = {
  getDashboard: async () => {
    // Return mock dashboard data
    return { 
      summary: { 
        totalAssets: 125000, 
        totalLiabilities: 45000, 
        totalEquity: 80000, 
        totalRevenue: 95000, 
        totalExpenses: 65000, 
        netIncome: 30000 
      } 
    };
  },
  updateSummary: async () => {
    // Return mock updated data
    return { 
      summary: { 
        totalAssets: 128000, 
        totalLiabilities: 46000, 
        totalEquity: 82000, 
        totalRevenue: 98000, 
        totalExpenses: 67000, 
        netIncome: 31000 
      } 
    };
  },
  getSettings: async () => {
    // Return mock settings
    return {
      autoPostJournals: false,
      requireApproval: true,
      allowNegativeInventory: false,
      decimalPlaces: 2
    };
  },
  updateSettings: async (settings: any) => {
    // Return mock success response
    return { success: true, settings };
  }
};