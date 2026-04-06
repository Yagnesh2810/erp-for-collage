'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SupplierForm from '@/components/Forms/SupplierForm';
import { suppliersAPI, SupplierInput } from '@/lib/api/index';
import Layout from '@/components/Layout';


export default function NewSupplierPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (data: SupplierInput) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Creating supplier with data:", data);
      await suppliersAPI.create(data);
      // Navigate back to suppliers list
      router.push('/dashboard/suppliers');
    } catch (err: any) {
      console.error('Failed to create supplier:', err);
      setError(err.response?.data?.message || 'Failed to create supplier. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Add New Supplier</h1>
          <Link
            href="/dashboard/suppliers"
            className="text-blue-600 hover:underline"
          >
            Back to Suppliers
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <SupplierForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
    </Layout>
  );
}