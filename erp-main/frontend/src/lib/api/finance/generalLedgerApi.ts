const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
};

const makeRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('API Request failed:', error);
    // Return mock data on error to prevent UI crashes
    return null;
  }
};

export const generalLedgerApi = {
  // Chart of Accounts
  getAccounts: async (filters?: { type?: string; search?: string }) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.search) queryParams.append('search', filters.search);
      
      const url = `${API_BASE}/api/finance/general-ledger/accounts?${queryParams}`;
      const result = await makeRequest(url);
      
      if (result) return result;
    } catch (error) {
      console.warn('Using mock data due to API error:', error);
    }
    
    // Fallback to mock data
    const mockAccounts = [
      { id: '1', code: '1000', name: 'Cash', type: 'asset', balance: 50000, isActive: true },
      { id: '2', code: '1100', name: 'Accounts Receivable', type: 'asset', balance: 25000, isActive: true },
      { id: '3', code: '2000', name: 'Accounts Payable', type: 'liability', balance: 15000, isActive: true },
      { id: '4', code: '3000', name: 'Owner Equity', type: 'equity', balance: 100000, isActive: true },
      { id: '5', code: '4000', name: 'Sales Revenue', type: 'revenue', balance: 75000, isActive: true },
      { id: '6', code: '5000', name: 'Office Expenses', type: 'expense', balance: 12000, isActive: true }
    ];
    
    let filtered = mockAccounts;
    if (filters?.type && filters.type !== 'all') {
      filtered = filtered.filter(acc => acc.type === filters.type);
    }
    if (filters?.search) {
      filtered = filtered.filter(acc => 
        acc.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        acc.code.includes(filters.search!)
      );
    }
    
    return new Promise(resolve => setTimeout(() => resolve(filtered), 300));
  },
  
  createAccount: async (data: { code: string; name: string; type: string; parentId?: string }) => {
    return new Promise(resolve => 
      setTimeout(() => resolve({ 
        id: Date.now().toString(), 
        ...data, 
        balance: 0, 
        isActive: true 
      }), 500)
    );
  },
  
  updateAccount: async (id: string, data: Partial<any>) => {
    return new Promise(resolve => 
      setTimeout(() => resolve({ success: true, id, ...data }), 400)
    );
  },
  
  deleteAccount: async (id: string) => {
    return new Promise(resolve => 
      setTimeout(() => resolve({ success: true, id }), 300)
    );
  },

  // Journal Entries
  getJournalEntries: async (filters?: { dateFrom?: string; dateTo?: string; status?: string }) => {
    const mockEntries = [
      {
        id: '1',
        date: '2024-01-15',
        reference: 'JE001',
        description: 'Initial cash deposit',
        totalDebit: 50000,
        totalCredit: 50000,
        status: 'posted',
        lines: [
          { id: '1', accountId: '1', accountName: 'Cash', debit: 50000, credit: 0, description: 'Initial deposit' },
          { id: '2', accountId: '4', accountName: 'Owner Equity', debit: 0, credit: 50000, description: 'Initial capital' }
        ]
      },
      {
        id: '2',
        date: '2024-01-16',
        reference: 'JE002',
        description: 'Office supplies purchase',
        totalDebit: 500,
        totalCredit: 500,
        status: 'posted',
        lines: [
          { id: '3', accountId: '6', accountName: 'Office Expenses', debit: 500, credit: 0, description: 'Office supplies' },
          { id: '4', accountId: '1', accountName: 'Cash', debit: 0, credit: 500, description: 'Payment for supplies' }
        ]
      },
      {
        id: '3',
        date: '2024-01-17',
        reference: 'JE003',
        description: 'Service revenue',
        totalDebit: 2500,
        totalCredit: 2500,
        status: 'draft',
        lines: [
          { id: '5', accountId: '1', accountName: 'Cash', debit: 2500, credit: 0, description: 'Service payment received' },
          { id: '6', accountId: '5', accountName: 'Sales Revenue', debit: 0, credit: 2500, description: 'Service revenue earned' }
        ]
      }
    ];
    
    return new Promise(resolve => setTimeout(() => resolve(mockEntries), 400));
  },
  
  createJournalEntry: async (data: any) => {
    return new Promise(resolve => 
      setTimeout(() => resolve({ 
        id: Date.now().toString(), 
        ...data, 
        status: 'draft' 
      }), 600)
    );
  },
  
  updateJournalEntry: async (id: string, data: any) => {
    return new Promise(resolve => 
      setTimeout(() => resolve({ success: true, id, ...data }), 500)
    );
  },
  
  postJournalEntry: async (id: string) => {
    return new Promise(resolve => 
      setTimeout(() => resolve({ success: true, id, status: 'posted' }), 400)
    );
  },

  // Account Ledger
  getAccountLedger: async (accountId: string, dateFrom?: string, dateTo?: string) => {
    const mockLedger = [
      {
        id: '1',
        date: '2024-01-15',
        reference: 'JE001',
        description: 'Initial cash deposit',
        debit: 50000,
        credit: 0,
        balance: 50000
      },
      {
        id: '2',
        date: '2024-01-16',
        reference: 'JE002',
        description: 'Office supplies purchase',
        debit: 0,
        credit: 500,
        balance: 49500
      }
    ];
    
    return new Promise(resolve => setTimeout(() => resolve(mockLedger), 300));
  },

  // Trial Balance
  getTrialBalance: async (asOfDate?: string) => {
    const mockTrialBalance = [
      { accountId: '1', accountCode: '1000', accountName: 'Cash', debit: 49500, credit: 0 },
      { accountId: '2', accountCode: '1100', accountName: 'Accounts Receivable', debit: 25000, credit: 0 },
      { accountId: '3', accountCode: '2000', accountName: 'Accounts Payable', debit: 0, credit: 15000 },
      { accountId: '4', accountCode: '3000', accountName: 'Owner Equity', debit: 0, credit: 100000 },
      { accountId: '5', accountCode: '4000', accountName: 'Sales Revenue', debit: 0, credit: 75000 },
      { accountId: '6', accountCode: '5000', accountName: 'Office Expenses', debit: 12500, credit: 0 }
    ];
    
    return new Promise(resolve => setTimeout(() => resolve(mockTrialBalance), 400));
  },

  // Reports
  getAccountsReport: async (type?: string) => {
    return new Promise(resolve => setTimeout(() => resolve([]), 300));
  },
  
  getJournalReport: async (dateFrom?: string, dateTo?: string) => {
    return new Promise(resolve => setTimeout(() => resolve([]), 300));
  }
};