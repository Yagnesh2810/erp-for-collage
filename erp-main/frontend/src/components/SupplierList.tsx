//path: frontend/src/components/SupplierList.tsx
import React from 'react';
import Link from 'next/link';
import { Supplier } from '@/lib/api/index';

interface SupplierListProps {
  suppliers: Supplier[];
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onDelete, isDeleting }) => {
  if (suppliers.length === 0) {
    return (
      <div className="bg-card text-card-foreground rounded-md shadow-sm p-6 text-center">
        <p className="text-muted-foreground">No suppliers found</p>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-md shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Address
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Contact Person
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {suppliers.map((supplier) => (
              <tr key={supplier._id} className="hover:bg-muted">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-foreground">
                    <Link href={`/dashboard/suppliers/${supplier._id}`} className="hover:text-blue-600">
                      {supplier.name}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">{supplier.email}</div>
                  <div className="text-sm text-muted-foreground">{supplier.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">{supplier.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">{supplier.contactPerson}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-3">
                    <Link
                      href={`/dashboard/suppliers/${supplier._id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/suppliers/edit/${supplier._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onDelete(supplier._id)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
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
    </div>
  );
};

export default SupplierList;