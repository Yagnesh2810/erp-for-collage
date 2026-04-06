'use client';

import { useState, useEffect } from 'react';
import { getOrderAuditTrail } from '@/lib/api/index';
import { toast } from 'react-hot-toast';

interface AuditEntry {
  event: string;
  date: string;
  user: string | {
    _id: string;
    name: string;
    email: string;
  };
  details?: string;
}

interface OrderAuditTrailProps {
  orderId: string;
}

const OrderAuditTrail: React.FC<OrderAuditTrailProps> = ({ orderId }) => {
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuditTrail = async () => {
      setIsLoading(true);
      try {
        const response = await getOrderAuditTrail(orderId);
        setAuditTrail(response.data || []);
      } catch (err) {
        setError('Failed to fetch audit trail');
        toast.error('Failed to fetch audit trail');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditTrail();
  }, [orderId]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatEventName = (event: string) => {
    return event
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getEventIcon = (event: string) => {
    if (event.includes('created')) return '🆕';
    if (event.includes('status_changed')) return '🔄';
    if (event.includes('fulfilled')) return '📦';
    if (event.includes('completed')) return '✅';
    if (event.includes('invoice')) return '📄';
    if (event.includes('payment')) return '💰';
    if (event.includes('loyalty')) return '⭐';
    if (event.includes('archived')) return '🗃️';
    return '📝';
  };

  const getEventColor = (event: string) => {
    if (event.includes('created')) return 'bg-blue-50 border-blue-200';
    if (event.includes('status_changed_to_processing')) return 'bg-blue-50 border-blue-200';
    if (event.includes('status_changed_to_shipped')) return 'bg-purple-50 border-purple-200';
    if (event.includes('status_changed_to_fulfilled')) return 'bg-indigo-50 border-indigo-200';
    if (event.includes('fulfilled')) return 'bg-indigo-50 border-indigo-200';
    if (event.includes('status_changed_to_completed')) return 'bg-green-50 border-green-200';
    if (event.includes('completed')) return 'bg-green-50 border-green-200';
    if (event.includes('invoice')) return 'bg-yellow-50 border-yellow-200';
    if (event.includes('payment')) return 'bg-green-50 border-green-200';
    if (event.includes('cancelled')) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getUserName = (user: string | { _id: string; name: string; email: string }) => {
    if (typeof user === 'object' && user !== null) {
      return user.name;
    }
    return 'System';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-md">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (auditTrail.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No audit trail available for this order.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {auditTrail.map((entry, index) => (
          <li key={index}>
            <div className="relative pb-8">
              {index !== auditTrail.length - 1 ? (
                <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div>
                  <div className={`relative px-1 ${getEventColor(entry.event)} h-10 w-10 rounded-full flex items-center justify-center border`}>
                    <span className="text-xl" aria-hidden="true">{getEventIcon(entry.event)}</span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-1.5">
                  <div className="text-sm text-gray-500">
                    <div className="font-medium text-gray-900">
                      {formatEventName(entry.event)}
                    </div>
                    <span className="text-gray-500 whitespace-nowrap">{formatDate(entry.date)}</span>
                    {entry.details && (
                      <p className="mt-1 text-gray-700">{entry.details}</p>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    <span className="font-medium text-gray-600">By: </span>
                    {getUserName(entry.user)}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderAuditTrail;