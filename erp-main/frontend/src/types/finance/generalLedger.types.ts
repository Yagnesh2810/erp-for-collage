export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  parentId?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'reversed';
  createdBy?: string;
  postedBy?: string;
  postedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JournalLine {
  id: string;
  accountId: string;
  accountName?: string;
  debit: number;
  credit: number;
  description: string;
}

export interface AccountLedger {
  id: string;
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface TrialBalanceItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface CreateAccountRequest {
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentId?: string;
}

export interface CreateJournalEntryRequest {
  date: string;
  reference: string;
  description: string;
  lines: {
    accountId: string;
    debit: number;
    credit: number;
    description: string;
  }[];
}

export interface AccountFilters {
  type?: string;
  search?: string;
  isActive?: boolean;
}

export interface JournalEntryFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  accountId?: string;
}

export interface LedgerFilters {
  dateFrom?: string;
  dateTo?: string;
}