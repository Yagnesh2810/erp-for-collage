import { useState } from 'react';
import { financeApi } from '@/lib/api/financeApi';

export const useFinance = () => {
  const [dashboard, setDashboard] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financeApi.getDashboard();
      setDashboard(data);
    } catch (error: any) {
      console.error('Error fetching finance dashboard:', error);
      setError('Failed to fetch dashboard data');
      // Provide fallback data
      setDashboard({ 
        summary: { 
          totalAssets: 0, 
          totalLiabilities: 0, 
          totalEquity: 0, 
          totalRevenue: 0, 
          totalExpenses: 0, 
          netIncome: 0 
        } 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await financeApi.getSettings();
      setSettings(data);
    } catch (error: any) {
      console.error('Error fetching finance settings:', error);
      setError('Failed to fetch settings');
      setSettings({
        autoPostJournals: false,
        requireApproval: true,
        allowNegativeInventory: false,
        decimalPlaces: 2
      });
    }
  };

  const updateSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await financeApi.updateSummary();
      setDashboard(data);
    } catch (error: any) {
      console.error('Error updating finance summary:', error);
      setError('Failed to update summary');
    } finally {
      setLoading(false);
    }
  };

  return { 
    dashboard, 
    settings, 
    loading, 
    error,
    fetchDashboard, 
    fetchSettings, 
    updateSummary 
  };
};