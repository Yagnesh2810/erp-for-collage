"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { 
  getProjectPayments, 
  createPayment, 
  updatePayment, 
  deletePayment,
  updatePaymentStatus,
  type Payment
} from "@/lib/api/finance/paymentApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  CreditCard, 
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote
} from "lucide-react";

interface PaymentManagementProps {
  projectId: string;
  canEdit: boolean;
  canDelete: boolean;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({ 
  projectId, 
  canEdit, 
  canDelete 
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    paymentNumber: '',
    type: 'incoming' as 'incoming' | 'outgoing',
    amount: 0,
    date: '',
    method: 'bank_transfer' as Payment['method'],
    description: '',
    reference: '',
    linkedInvoiceNumber: '',
    clientName: '',
    vendorName: ''
  });

  useEffect(() => {
    fetchPayments();
  }, [projectId, searchTerm, statusFilter, typeFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        page: 1,
        limit: 50
      };
      
      const data = await getProjectPayments(projectId, filters);
      setPayments(data.payments);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'incoming' ? 
      <ArrowDownLeft className="h-4 w-4 text-green-600" /> : 
      <ArrowUpRight className="h-4 w-4 text-red-600" />;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card': return <CreditCard className="h-4 w-4" />;
      case 'cash': return <Banknote className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const handleSavePayment = async () => {
    try {
      if (editingPayment) {
        await updatePayment(projectId, editingPayment._id, formData);
        toast({
          title: "Success",
          description: "Payment updated successfully",
        });
      } else {
        await createPayment(projectId, formData);
        toast({
          title: "Success",
          description: "Payment created successfully",
        });
      }
      
      await fetchPayments();
      resetForm();
      setEditingPayment(null);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error saving payment:', error);
      toast({
        title: "Error",
        description: "Failed to save payment",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      paymentNumber: '',
      type: 'incoming',
      amount: 0,
      date: '',
      method: 'bank_transfer',
      description: '',
      reference: '',
      linkedInvoiceNumber: '',
      clientName: '',
      vendorName: ''
    });
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      paymentNumber: payment.paymentNumber,
      type: payment.type,
      amount: payment.amount,
      date: payment.date,
      method: payment.method,
      description: payment.description,
      reference: payment.reference,
      linkedInvoiceNumber: payment.linkedInvoiceNumber || '',
      clientName: payment.clientName || '',
      vendorName: payment.vendorName || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deletePayment(projectId, paymentId);
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });
      await fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (paymentId: string, newStatus: string) => {
    try {
      await updatePaymentStatus(projectId, paymentId, newStatus);
      toast({
        title: "Success",
        description: `Payment ${newStatus} successfully`,
      });
      await fetchPayments();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  const totalPayments = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalIncoming = filteredPayments.filter(p => p.type === 'incoming').reduce((sum, payment) => sum + payment.amount, 0);
  const totalOutgoing = filteredPayments.filter(p => p.type === 'outgoing').reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = filteredPayments.filter(p => p.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold">${filteredPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">${pendingPayments.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Incoming</p>
                <p className="text-2xl font-bold text-green-600">${totalIncoming.toLocaleString()}</p>
              </div>
              <ArrowDownLeft className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outgoing</p>
                <p className="text-2xl font-bold text-red-600">${totalOutgoing.toLocaleString()}</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="incoming">Incoming</SelectItem>
                <SelectItem value="outgoing">Outgoing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payments ({filteredPayments.length})</CardTitle>
            {canEdit && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingPayment(null);
                    resetForm();
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingPayment ? 'Edit Payment' : 'Add New Payment'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paymentNumber">Payment Number</Label>
                        <Input
                          id="paymentNumber"
                          value={formData.paymentNumber}
                          onChange={(e) => setFormData({...formData, paymentNumber: e.target.value})}
                          placeholder="PAY-2024-001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select 
                          value={formData.type} 
                          onValueChange={(value: 'incoming' | 'outgoing') => setFormData({...formData, type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="incoming">Incoming</SelectItem>
                            <SelectItem value="outgoing">Outgoing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                          placeholder="Enter amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="method">Payment Method</Label>
                      <Select 
                        value={formData.method} 
                        onValueChange={(value: Payment['method']) => setFormData({...formData, method: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="reference">Reference</Label>
                      <Input
                        id="reference"
                        value={formData.reference}
                        onChange={(e) => setFormData({...formData, reference: e.target.value})}
                        placeholder="Transaction reference"
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkedInvoice">Linked Invoice (Optional)</Label>
                      <Input
                        id="linkedInvoice"
                        value={formData.linkedInvoiceNumber}
                        onChange={(e) => setFormData({...formData, linkedInvoiceNumber: e.target.value})}
                        placeholder="INV-2024-001"
                      />
                    </div>

                    {formData.type === 'incoming' ? (
                      <div>
                        <Label htmlFor="clientName">Client Name</Label>
                        <Input
                          id="clientName"
                          value={formData.clientName}
                          onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                          placeholder="Client name"
                        />
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="vendorName">Vendor Name</Label>
                        <Input
                          id="vendorName"
                          value={formData.vendorName}
                          onChange={(e) => setFormData({...formData, vendorName: e.target.value})}
                          placeholder="Vendor name"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Payment description"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSavePayment}>
                        {editingPayment ? 'Update' : 'Add'} Payment
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(payment.type)}
                      <h4 className="font-medium">{payment.paymentNumber}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{payment.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(payment.status)}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1">{payment.status}</span>
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canEdit && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditPayment(payment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeletePayment(payment._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className={`font-medium text-lg ${payment.type === 'incoming' ? 'text-green-600' : 'text-red-600'}`}>
                      {payment.type === 'incoming' ? '+' : '-'}${payment.amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Method</p>
                    <div className="flex items-center gap-1">
                      {getMethodIcon(payment.method)}
                      <p className="font-medium capitalize">{payment.method.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reference</p>
                    <p className="font-medium text-sm">{payment.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {payment.type === 'incoming' ? 'Client' : 'Vendor'}
                    </p>
                    <p className="font-medium">
                      {payment.type === 'incoming' ? payment.clientName : payment.vendorName}
                    </p>
                  </div>
                </div>

                {payment.linkedInvoiceId && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-800">
                      Linked to Invoice: {payment.linkedInvoiceId}
                    </p>
                  </div>
                )}

                {payment.status === 'pending' && canEdit && (
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-green-600 border-green-600"
                      onClick={() => handleStatusChange(payment._id, 'completed')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark as Completed
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 border-red-600"
                      onClick={() => handleStatusChange(payment._id, 'failed')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Mark as Failed
                    </Button>
                  </div>
                )}

                {payment.status === 'failed' && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mt-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <p className="text-sm text-red-800">Payment failed - requires attention</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {filteredPayments.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payments found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters' 
                    : 'Add your first payment to get started'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};