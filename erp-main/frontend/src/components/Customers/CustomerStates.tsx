import { useState } from 'react';
import { Customer, updateCustomerStatus } from '@/lib/api/index';
import { toast } from 'react-hot-toast';
import CustomerButton from './CustomerButton';

interface CustomerStatesProps {
  customer: Customer;
  onUpdate?: (updatedCustomer: Customer) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function CustomerStates({ 
  customer, 
  onUpdate,
  size = 'md',
  showLabel = true 
}: CustomerStatesProps) {
  const [loading, setLoading] = useState(false);
  
  // Ensure customer exists before rendering
  if (!customer) {
    return null;
  }
  
  const states = [
    { id: 'active', label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
    { id: 'inactive', label: 'Inactive', color: 'bg-red-100 text-red-800 border-red-200' },
    { id: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'blocked', label: 'Blocked', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ];

  // Simple mapping from boolean active to our state IDs
  // Use optional chaining to prevent errors if active is undefined
  const currentState = customer?.active ? 'active' : 'inactive';

  const updateState = async (stateId: string) => {
    // If current state is already set, do nothing
    if (stateId === currentState) return;
    
    // Make sure customer and _id exist
    if (!customer || !customer._id) {
      toast.error('Cannot update customer: Invalid customer data');
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert state ID to active boolean
      const isActive = stateId === 'active';
      
      // Call API to update customer status
      const updatedCustomer = await updateCustomerStatus(customer._id, isActive);
      
      toast.success(`Customer status updated to ${stateId}`);
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate(updatedCustomer);
      }
    } catch (error) {
      console.error('Error updating customer state:', error);
      toast.error('Failed to update customer status');
    } finally {
      setLoading(false);
    }
  };

  // Different styles based on size
  const getStateClasses = (stateId: string) => {
    const isActive = stateId === currentState;
    const baseClasses = 'rounded-full border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };
    
    // State is active - show solid background
    if (isActive) {
      const state = states.find(s => s.id === stateId);
      return `${baseClasses} ${sizeClasses[size]} ${state?.color} cursor-default`;
    }
    
    // State is not active - show outlined button
    return `${baseClasses} ${sizeClasses[size]} bg-white text-gray-700 border-gray-300 hover:bg-gray-50`;
  };

  return (
    <div className="flex flex-col space-y-2">
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700">Customer Status</label>
      )}
      
      <div className="flex space-x-2">
        {states.map((state) => (
          <button
            key={state.id}
            className={getStateClasses(state.id)}
            onClick={() => updateState(state.id)}
            disabled={loading || state.id === currentState}
          >
            {state.label}
          </button>
        ))}
      </div>
      
      {loading && (
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Updating status...
        </div>
      )}
    </div>
  );
}

// Additional component for displaying just the current state
export function CustomerState({ customer, size = 'md' }: { customer: Customer, size?: 'sm' | 'md' | 'lg' }) {
  // Handle case where customer is undefined
  if (!customer) {
    return null;
  }
  
  const stateColor = customer?.active 
    ? 'bg-green-100 text-green-800 border-green-200' 
    : 'bg-red-100 text-red-800 border-red-200';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };
  
  return (
    <span className={`inline-flex items-center rounded-full border ${stateColor} ${sizeClasses[size]}`}>
      {customer?.active ? 'Active' : 'Inactive'}
    </span>
  );
}