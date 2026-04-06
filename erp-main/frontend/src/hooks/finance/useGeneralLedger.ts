import { useState } from 'react';
import { generalLedgerApi } from '@/lib/api/finance/generalLedgerApi';
import { Account, JournalEntry, AccountLedger, TrialBalanceItem, AccountFilters, JournalEntryFilters } from '@/types/finance/generalLedger.types';

export const useGeneralLedger = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [accountLedger, setAccountLedger] = useState<AccountLedger[]>([]);
  const [trialBalance, setTrialBalance] = useState<TrialBalanceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async (filters?: AccountFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generalLedgerApi.getAccounts(filters);
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to fetch accounts');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (accountData: any) => {
    setLoading(true);
    try {
      const newAccount = await generalLedgerApi.createAccount(accountData);
      setAccounts(prev => [...prev, newAccount]);
      return newAccount;
    } catch (error) {
      console.error('Error creating account:', error);
      setError('Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (id: string, data: Partial<Account>) => {
    setLoading(true);
    try {
      const updated = await generalLedgerApi.updateAccount(id, data);
      setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...data } : acc));
      return updated;
    } catch (error) {
      console.error('Error updating account:', error);
      setError('Failed to update account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (id: string) => {
    setLoading(true);
    try {
      await generalLedgerApi.deleteAccount(id);
      setAccounts(prev => prev.filter(acc => acc.id !== id));
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchJournalEntries = async (filters?: JournalEntryFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generalLedgerApi.getJournalEntries(filters);
      setJournalEntries(data || []);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      setError('Failed to fetch journal entries');
      setJournalEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const createJournalEntry = async (entryData: any) => {
    setLoading(true);
    try {
      const newEntry = await generalLedgerApi.createJournalEntry(entryData);
      setJournalEntries(prev => [...prev, newEntry]);
      return newEntry;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      setError('Failed to create journal entry');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const postJournalEntry = async (id: string) => {
    setLoading(true);
    try {
      await generalLedgerApi.postJournalEntry(id);
      setJournalEntries(prev => 
        prev.map(entry => 
          entry.id === id ? { ...entry, status: 'posted' as const } : entry
        )
      );
    } catch (error) {
      console.error('Error posting journal entry:', error);
      setError('Failed to post journal entry');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountLedger = async (accountId: string, dateFrom?: string, dateTo?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generalLedgerApi.getAccountLedger(accountId, dateFrom, dateTo);
      setAccountLedger(data || []);
    } catch (error) {
      console.error('Error fetching account ledger:', error);
      setError('Failed to fetch account ledger');
      setAccountLedger([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrialBalance = async (asOfDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generalLedgerApi.getTrialBalance(asOfDate);
      setTrialBalance(data || []);
    } catch (error) {
      console.error('Error fetching trial balance:', error);
      setError('Failed to fetch trial balance');
      setTrialBalance([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    accounts,
    journalEntries,
    accountLedger,
    trialBalance,
    loading,
    error,
    
    // Account operations
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    
    // Journal entry operations
    fetchJournalEntries,
    createJournalEntry,
    postJournalEntry,
    
    // Ledger operations
    fetchAccountLedger,
    fetchTrialBalance
  };
};