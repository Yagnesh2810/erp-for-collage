// Original path: frontend/src/app/dashboard/suppliers/edit/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SupplierForm from '@/components/Forms/SupplierForm';
import { suppliersAPI, Supplier, SupplierInput } from '@/lib/api/index';
import Layout from '@/components/Layout';

interface EditSupplierPageProps {
  params: {
    id: string;
  };
}

export default function EditSupplierPage({ params }: EditSupplierPageProps) {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const fetchSupplier = async () => {
      setIsLoading(true);
      try {
        const data = await suppliersAPI.getById(id);
        setSupplier(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch supplier:', err);
        setError('Failed to load supplier details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSupplier();
    }
  }, [id]);

  const handleSubmit = async (data: SupplierInput) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await suppliersAPI.update(id, data);
      // Navigate back to suppliers list
      router.push('/dashboard/suppliers');
    } catch (err: any) {
      console.error('Failed to update supplier:', err);
      setError(err.response?.data?.message || 'Failed to update supplier. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Supplier</h1>
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

      {isLoading ? (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-muted border-t-blue-600"></div>
          <p className="mt-2 text-muted-foreground">Loading supplier details...</p>
        </div>
      ) : supplier ? (
        <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md">
          <SupplierForm
            initialData={supplier}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : (
        <div className="text-center p-8">
          <p className="text-red-600">Supplier not found</p>
        </div>
      )}
    </div>
    </Layout>
  );
}