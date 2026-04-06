//path: frontend/src/app/dashboard/suppliers/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { suppliersAPI, Supplier } from '@/lib/api/index';
import SupplierList from '@/components/SupplierList';
import Layout from '@/components/Layout';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSuppliers = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching suppliers...");
        const data = await suppliersAPI.getAll();
        console.log("Suppliers data:", data);
        console.log("Data type:", typeof data, Array.isArray(data));
        setSuppliers(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch suppliers:', err);
        setError('Failed to load suppliers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleDeleteSupplier = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setIsDeleting(true);
      try {
        await suppliersAPI.delete(id);
        setSuppliers((prevSuppliers) =>
          prevSuppliers.filter((supplier) => supplier._id !== id)
        );
      } catch (err) {
        console.error('Failed to delete supplier:', err);
        setError('Failed to delete supplier. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Link
          href="/dashboard/suppliers/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Supplier
        </Link>
      </div>

      {/* Search and filter */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 p-2 border border-input bg-background text-foreground rounded-md"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      {isLoading ? (
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-muted border-t-blue-600"></div>
          <p className="mt-2 text-muted-foreground">Loading suppliers...</p>
        </div>
      ) : (
        <SupplierList
          suppliers={filteredSuppliers}
          onDelete={handleDeleteSupplier}
          isDeleting={isDeleting}
        />
      )}
    </div>
    </Layout>
  );
}