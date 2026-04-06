
//frontend\src\app\dashboard\customer\edit\page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import dynamic from 'next/dynamic';

// Define the prop types for CustomerDashboard to match what you're passing
interface CustomerDashboardProps {
  customerId: string;
  isEditing: boolean;
}

// Dynamically import CustomerDashboard with type information
const CustomerDashboard = dynamic<CustomerDashboardProps>(
  () => import('@/components/Customers/CustomerDashboard'),
  {
    loading: () => <div>Loading dashboard...</div>,
  }
);

// Content component that uses useSearchParams
function CustomerEditContent() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');
  
  return (
    <CustomerDashboard customerId={id || ''} isEditing={true} />
  );
}

// Loading fallback
function LoadingCustomerEdit() {
  return <div className="p-4">Loading customer edit page...</div>;
}

// Main page component with Suspense boundary
export default function EditCustomerPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingCustomerEdit />}>
        <CustomerEditContent />
      </Suspense>
    </ProtectedRoute>
  );
}