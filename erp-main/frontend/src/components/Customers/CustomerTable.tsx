import { Customer, deleteCustomer, updateCustomerStatus } from '@/lib/api/index';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  onViewCustomer: (id: string) => void;
  onRefresh: () => void;
}

export default function CustomerTable({ customers, loading, onViewCustomer, onRefresh }: CustomerTableProps) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        setActionLoading(id);
        await deleteCustomer(id);
        toast.success('Customer deleted successfully');
        onRefresh();
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast.error('Failed to delete customer');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setActionLoading(id);
      await updateCustomerStatus(id, !currentStatus);
      toast.success(`Customer ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      onRefresh();
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No customers found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 text-gray-600 text-left text-sm uppercase font-semibold">
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">Email</th>
            <th className="py-3 px-4">Phone</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Country</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm">
          {customers.map((customer) => (
            <tr key={customer._id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4 font-medium">{customer.name}</td>
              <td className="py-3 px-4">{customer.email}</td>
              <td className="py-3 px-4">{customer.phone}</td>
              <td className="py-3 px-4 capitalize">{customer.customerType}</td>
              <td className="py-3 px-4">{customer.address.country}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    customer.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {customer.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewCustomer(customer._id)}
                    className="text-blue-500 hover:text-blue-700"
                    disabled={actionLoading === customer._id}
                  >
                    View
                  </button>
                  <button
                    onClick={() => toggleStatus(customer._id, customer.active)}
                    className={`${
                      customer.active ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'
                    }`}
                    disabled={actionLoading === customer._id}
                  >
                    {actionLoading === customer._id ? (
                      <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : customer.active ? (
                      'Deactivate'
                    ) : (
                      'Activate'
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(customer._id)}
                    className="text-red-500 hover:text-red-700"
                    disabled={actionLoading === customer._id}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}