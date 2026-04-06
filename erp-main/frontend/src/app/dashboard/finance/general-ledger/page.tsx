'use client';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, FileText, Calculator, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import { useGeneralLedger } from '@/hooks/finance/useGeneralLedger';

interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  parentId?: string;
}

interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted';
}

export default function GeneralLedgerPage() {
  const { loading } = useGeneralLedger();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState('all');
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [isNewJournalOpen, setIsNewJournalOpen] = useState(false);
  
  // Mock data
  const [accounts] = useState<Account[]>([
    { id: '1', code: '1000', name: 'Cash', type: 'asset', balance: 50000 },
    { id: '2', code: '1100', name: 'Accounts Receivable', type: 'asset', balance: 25000 },
    { id: '3', code: '2000', name: 'Accounts Payable', type: 'liability', balance: 15000 },
    { id: '4', code: '3000', name: 'Owner Equity', type: 'equity', balance: 100000 },
    { id: '5', code: '4000', name: 'Sales Revenue', type: 'revenue', balance: 75000 },
    { id: '6', code: '5000', name: 'Office Expenses', type: 'expense', balance: 12000 }
  ]);
  
  const [journalEntries] = useState<JournalEntry[]>([
    { id: '1', date: '2024-01-15', reference: 'JE001', description: 'Initial cash deposit', totalDebit: 50000, totalCredit: 50000, status: 'posted' },
    { id: '2', date: '2024-01-16', reference: 'JE002', description: 'Office supplies purchase', totalDebit: 500, totalCredit: 500, status: 'posted' },
    { id: '3', date: '2024-01-17', reference: 'JE003', description: 'Service revenue', totalDebit: 2500, totalCredit: 2500, status: 'draft' }
  ]);

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         account.code.includes(searchTerm);
    const matchesType = selectedAccountType === 'all' || account.type === selectedAccountType;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      asset: 'bg-green-100 text-green-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-blue-100 text-blue-800',
      revenue: 'bg-purple-100 text-purple-800',
      expense: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">General Ledger</h1>
            <p className="text-muted-foreground mt-1">Chart of accounts, journal entries, and ledger management</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isNewAccountOpen} onOpenChange={setIsNewAccountOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                  <Plus className="h-4 w-4 mr-2" />
                  New Account
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="account-code">Account Code</Label>
                    <Input id="account-code" placeholder="e.g., 1200" />
                  </div>
                  <div>
                    <Label htmlFor="account-name">Account Name</Label>
                    <Input id="account-name" placeholder="e.g., Inventory" />
                  </div>
                  <div>
                    <Label htmlFor="account-type">Account Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asset">Asset</SelectItem>
                        <SelectItem value="liability">Liability</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Create Account</Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isNewJournalOpen} onOpenChange={setIsNewJournalOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">
                  <Plus className="h-4 w-4 mr-2" />
                  New Double-Entry Transaction
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create Double-Entry Journal Entry</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Double-entry bookkeeping: Every transaction affects at least 2 accounts. Total debits must equal total credits.
                  </p>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="je-date">Date</Label>
                      <Input id="je-date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="je-reference">Reference</Label>
                      <Input id="je-reference" placeholder="JE004" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="je-description">Description</Label>
                    <Textarea id="je-description" placeholder="Journal entry description" />
                  </div>
                  
                  {/* Double-Entry Template Selector */}
                  <div className="border rounded p-4 bg-blue-50">
                    <h4 className="font-medium mb-2 text-blue-800">📋 Quick Templates (Double-Entry)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-left justify-start">
                        💰 Cash Sale
                      </Button>
                      <Button variant="outline" size="sm" className="text-left justify-start">
                        📦 Purchase Inventory
                      </Button>
                      <Button variant="outline" size="sm" className="text-left justify-start">
                        💳 Pay Expense
                      </Button>
                      <Button variant="outline" size="sm" className="text-left justify-start">
                        💵 Receive Payment
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Double-Entry Lines</h4>
                      <Badge variant="outline" className="text-xs">
                        Debits = Credits Rule
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-5 gap-2 text-sm font-medium">
                        <span>Account</span>
                        <span>Description</span>
                        <span className="text-green-600">Debit (+)</span>
                        <span className="text-red-600">Credit (-)</span>
                        <span>Action</span>
                      </div>
                      
                      {/* Line 1 */}
                      <div className="grid grid-cols-5 gap-2 p-2 bg-green-50 rounded">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Debit account" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.filter(a => ['asset', 'expense'].includes(a.type)).map(account => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.code} - {account.name} ({account.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input placeholder="What increased?" />
                        <Input type="number" placeholder="0.00" className="bg-green-100" />
                        <Input type="number" placeholder="0.00" disabled className="bg-gray-100" />
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Line 2 */}
                      <div className="grid grid-cols-5 gap-2 p-2 bg-red-50 rounded">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Credit account" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.filter(a => ['liability', 'equity', 'revenue'].includes(a.type)).map(account => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.code} - {account.name} ({account.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input placeholder="What decreased/earned?" />
                        <Input type="number" placeholder="0.00" disabled className="bg-gray-100" />
                        <Input type="number" placeholder="0.00" className="bg-red-100" />
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Balance Check */}
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-center text-sm">
                        <span>Total Debits:</span>
                        <span className="font-mono text-green-600">$0.00</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Total Credits:</span>
                        <span className="font-mono text-red-600">$0.00</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-medium border-t pt-2 mt-2">
                        <span>Balance Status:</span>
                        <Badge variant="destructive">Not Balanced</Badge>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Another Line
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1" disabled>
                      Create Double-Entry (Balance Required)
                    </Button>
                    <Button variant="outline">
                      Validate Balance
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.length}</div>
              <Badge variant="secondary">Active</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{journalEntries.length}</div>
              <Badge variant="outline">This Month</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trial Balance</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Balanced</div>
              <Badge variant="default">Current</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0))}
              </div>
              <Badge variant="secondary">Current</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
            <TabsTrigger value="journal">Journal Entries</TabsTrigger>
            <TabsTrigger value="ledger">Account Ledger</TabsTrigger>
            <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedAccountType} onValueChange={setSelectedAccountType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="asset">Assets</SelectItem>
                  <SelectItem value="liability">Liabilities</SelectItem>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Accounts Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-mono">{account.code}</TableCell>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>
                          <Badge className={getAccountTypeColor(account.type)}>
                            {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(account.balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="journal" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Double-Entry Journal Entries</h3>
              <Badge variant="outline" className="text-xs">
                ⚖️ All entries follow double-entry rules
              </Badge>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right text-green-600">Total Debits</TableHead>
                      <TableHead className="text-right text-red-600">Total Credits</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries.map((entry) => {
                      const isBalanced = Math.abs(entry.totalDebit - entry.totalCredit) < 0.01;
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-mono">{entry.reference}</TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell className="text-right font-mono text-green-600">
                            {formatCurrency(entry.totalDebit)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-red-600">
                            {formatCurrency(entry.totalCredit)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={isBalanced ? 'default' : 'destructive'} className="text-xs">
                              {isBalanced ? '✓ Balanced' : '⚠ Unbalanced'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={entry.status === 'posted' ? 'default' : 'secondary'}>
                              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" title="View double-entry details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Edit (if draft)">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Double-Entry Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">📋 Double-Entry System Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {journalEntries.filter(e => Math.abs(e.totalDebit - e.totalCredit) < 0.01).length}
                    </div>
                    <div className="text-muted-foreground">Balanced Entries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatCurrency(journalEntries.reduce((sum, e) => sum + e.totalDebit, 0))}
                    </div>
                    <div className="text-muted-foreground">Total Debits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatCurrency(journalEntries.reduce((sum, e) => sum + e.totalCredit, 0))}
                    </div>
                    <div className="text-muted-foreground">Total Credits</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ledger" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Ledger</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Select an account to view its detailed ledger transactions.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trial-balance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Trial Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 font-medium border-b pb-2">
                    <span>Account</span>
                    <span className="text-right">Debit</span>
                    <span className="text-right">Credit</span>
                  </div>
                  {accounts.map((account) => (
                    <div key={account.id} className="grid grid-cols-3 gap-4">
                      <span>{account.code} - {account.name}</span>
                      <span className="text-right font-mono">
                        {['asset', 'expense'].includes(account.type) && account.balance > 0 
                          ? formatCurrency(account.balance) : '-'}
                      </span>
                      <span className="text-right font-mono">
                        {['liability', 'equity', 'revenue'].includes(account.type) && account.balance > 0 
                          ? formatCurrency(account.balance) : '-'}
                      </span>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-4 font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-right">
                      {formatCurrency(accounts.filter(a => ['asset', 'expense'].includes(a.type)).reduce((sum, a) => sum + a.balance, 0))}
                    </span>
                    <span className="text-right">
                      {formatCurrency(accounts.filter(a => ['liability', 'equity', 'revenue'].includes(a.type)).reduce((sum, a) => sum + a.balance, 0))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}