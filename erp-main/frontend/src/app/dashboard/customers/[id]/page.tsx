'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Customer, getCustomerById, updateCustomer, deleteCustomer } from '@/lib/api/index';
import CustomerForm from '@/components/Forms/CustomerForm';
import { toast } from 'react-hot-toast';
import Layout from '@/components/Layout';

// Remove the params from props completely
export default function CustomerDetailPage() {
  // Get the ID using useParams hook which is meant for client components
  const params = useParams();
  const id = params?.id as string;
  
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const data = await getCustomerById(id);
      setCustomer(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load customer details');
      setLoading(false);
      console.error(err);
    }
  };

  const handleUpdate = async (formData: Partial<Customer>) => {
    try {
      await updateCustomer(id, formData);
      toast.success('Customer updated successfully');
      fetchCustomer();
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update customer');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
        toast.success('Customer deleted successfully');
        router.push('/dashboard/customers');
      } catch (err) {
        toast.error('Failed to delete customer');
        console.error(err);
      }
    }
  };

  if (loading) {
    
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error || !customer) {
    return (<Layout>
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error || 'Customer not found'}
      </div></Layout>
    );
  }

  return (<Layout>
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Details</h1>
        <div className="space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
          {!isEditing && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => router.push('/dashboard/customers')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to List
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <CustomerForm 
            initialData={customer} 
            onSubmit={handleUpdate} 
            onCancel={() => setIsEditing(false)} 
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-500 text-sm">Name</label>
                  <div className="font-medium">{customer.name}</div>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Email</label>
                  <div className="font-medium">{customer.email}</div>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Phone</label>
                  <div className="font-medium">{customer.phone}</div>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Type</label>
                  <div className="font-medium capitalize">{customer.customerType}</div>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Status</label>
                  <div className={`font-medium ${customer.active ? 'text-green-600' : 'text-red-600'}`}>
                    {customer.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Address</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-500 text-sm">Street</label>
                  <div className="font-medium">{customer.address.street}</div>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">City</label>
                  <div className="font-medium">{customer.address.city}</div>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">State</label>
                  <div className="font-medium">{customer.address.state}</div>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Zip Code</label>
                  <div className="font-medium">{customer.address.zipCode}</div>
                </div>
                <div>
                  <label className="block text-gray-500 text-sm">Country</label>
                  <div className="font-medium">{customer.address.country}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-500 text-sm">Contact Person</label>
                    <div className="font-medium">{customer.contactPerson || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm">Tax ID</label>
                    <div className="font-medium">{customer.taxId || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm">Credit Limit</label>
                    <div className="font-medium">
                      {customer.creditLimit ? `$${customer.creditLimit.toLocaleString()}` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-gray-500 text-sm">Payment Terms</label>
                    <div className="font-medium">{customer.paymentTerms || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm">Total Orders</label>
                    <div className="font-medium">{customer.totalOrders || 0}</div>
                  </div>
                  <div>
                    <label className="block text-gray-500 text-sm">Total Spent</label>
                    <div className="font-medium">
                      {customer.totalSpent ? `$${customer.totalSpent.toLocaleString()}` : '$0'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {customer.notes && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Notes</h2>
              <div className="bg-gray-50 p-4 rounded">
                {customer.notes}
              </div>
            </div>
          )}
          
          {customer.tags && customer.tags.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div></Layout>
  );
}