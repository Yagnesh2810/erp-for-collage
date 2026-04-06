'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomer, CustomerInput } from '@/lib/api/index';
import CustomerForm from '@/components/Forms/CustomerForm';
import { toast } from 'react-hot-toast';
import Layout from '@/components/Layout';

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CustomerInput) => {
    try {
      setLoading(true);
      await createCustomer(data);
      toast.success('Customer created successfully');
      router.push('/dashboard/customers');
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Customer</h1>
        <button
          onClick={() => router.push('/dashboard/customers')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <CustomerForm 
          onSubmit={handleSubmit} 
          onCancel={() => router.push('/dashboard/customers')}
          isSubmitting={loading}
        />
      </div>
    </div></Layout>
  );
}