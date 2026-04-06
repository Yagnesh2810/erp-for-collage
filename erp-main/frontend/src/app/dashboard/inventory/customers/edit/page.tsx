'use client';

import { Suspense } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Component that uses useSearchParams
function CustomerEditContent() {
  const { useSearchParams } = require('next/navigation');
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');
  
  // Import CustomerForm inside the component
  const CustomerForm = require('@/components/Forms/CustomerForm').default;
  
  return (
    <CustomerForm customerId={id || ''} isEditing={true} />
  );
}

// Loading fallback
function CustomerEditLoading() {
  return <div className="p-4">Loading customer edit form...</div>;
}

// Main page component with Suspense boundary
export default function EditCustomerPage() {
  return (
    <Layout>
      <ProtectedRoute>
        <Suspense fallback={<CustomerEditLoading />}>
          <CustomerEditContent />
        </Suspense>
      </ProtectedRoute>
    </Layout>
  );
}