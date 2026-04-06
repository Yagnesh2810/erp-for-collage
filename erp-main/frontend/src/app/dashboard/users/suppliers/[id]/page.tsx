'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { suppliersAPI, Supplier } from '@/lib/api/index';
import Layout from '@/components/Layout';


interface SupplierDetailPageProps {
  params: {
    id: string;
  };
}

export default function SupplierDetailPage({ params }: SupplierDetailPageProps) {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setIsDeleting(true);
      try {
        await suppliersAPI.delete(id);
        router.push('/dashboard/suppliers');
      } catch (err) {
        console.error('Failed to delete supplier:', err);
        setError('Failed to delete supplier. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading supplier details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
        <div className="mt-4">
          <Link href="/dashboard/suppliers" className="text-blue-600 hover:underline">
            Back to Suppliers
          </Link>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Supplier not found</p>
        <div className="mt-4">
          <Link href="/dashboard/suppliers" className="text-blue-600 hover:underline">
            Back to Suppliers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Layout>
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{supplier.name}</h1>
          <div className="flex space-x-4">
            <Link
              href="/dashboard/suppliers"
              className="text-blue-600 hover:underline"
            >
              Back to Suppliers
            </Link>
            <Link
              href={`/dashboard/suppliers/edit/${supplier._id}`}
              className="text-indigo-600 hover:underline"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:underline disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Supplier Information</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-600">Name:</span>
                <p>{supplier.name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <p>{supplier.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Phone:</span>
                <p>{supplier.phone}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Contact Person:</span>
                <p>{supplier.contactPerson}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Address & Details</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-600">Address:</span>
                <p>{supplier.address}</p>
              </div>
              {supplier.createdAt && (
                <div>
                  <span className="font-medium text-gray-600">Created On:</span>
                  <p>{new Date(supplier.createdAt).toLocaleDateString()}</p>
                </div>
              )}
              {supplier.updatedAt && (
                <div>
                  <span className="font-medium text-gray-600">Last Updated:</span>
                  <p>{new Date(supplier.updatedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {supplier.products && supplier.products.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Supplied Products</h2>
            <div className="border rounded-md overflow-hidden">
              <p className="p-4">This supplier has {supplier.products.length} products.</p>
            </div>
          </div>
        )}
      </div>
    </div></Layout>
  );
}