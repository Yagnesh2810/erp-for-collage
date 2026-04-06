'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersAPI, fulfillOrder, completeOrder, generateInvoice } from '@/lib/api/index';
import Layout from '@/components/Layout';
import { toast } from 'react-hot-toast';
import OrderAuditTrail from '@/components/OrderAuditTrail';
import { use } from 'react';

interface Product {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
}

interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

interface PaymentReconciliation {
  status: string;
  date?: string;
  method: string;
  reference?: string;
  amount: number;
  notes?: string;
}

interface LoyaltyUpdate {
  previousPoints?: number;
  currentPoints?: number;
  pointsEarned: number;
  updateDate: string;
}

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

interface Order {
  _id: string;
  orderNumber: string;
  customer: Customer | string;
  products: Product[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  status: string;
  // Fulfillment fields
  fulfillmentStatus?: string;
  fulfillmentDate?: string;
  trackingInfo?: TrackingInfo;
  // Completion fields
  completionDate?: string;
  paymentReconciliation?: PaymentReconciliation;
  loyaltyUpdate?: LoyaltyUpdate;
  isArchived?: boolean;
  // Audit trail
  auditTrail?: AuditEntry[];
  createdAt: string;
  updatedAt: string;
}

const OrderDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  // Use React.use to unwrap the params Promise
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);
  const [showFulfillmentModal, setShowFulfillmentModal] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [fulfillmentData, setFulfillmentData] = useState<{
    carrier: string;
    trackingNumber: string;
    trackingUrl: string;
    estimatedDelivery: string;
    notes: string;
  }>({
    carrier: '',
    trackingNumber: '',
    trackingUrl: '',
    estimatedDelivery: '',
    notes: ''
  });
  const [completionData, setCompletionData] = useState<{
    paymentStatus: string;
    pointsEarned: number;
    notes: string;
    archiveOrder: boolean;
  }>({
    paymentStatus: 'complete',
    pointsEarned: 0,
    notes: '',
    archiveOrder: false
  });

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await ordersAPI.getById(orderId);
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch order details');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    
    setStatusUpdating(true);
    try {
      const response = await ordersAPI.updateStatus(orderId, newStatus);
      setOrder(response.data);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      setError('Failed to update order status');
      toast.error('Failed to update order status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleFulfillOrder = async () => {
    if (!order) return;
    
    setStatusUpdating(true);
    try {
      const data = {
        trackingInfo: {
          carrier: fulfillmentData.carrier,
          trackingNumber: fulfillmentData.trackingNumber,
          trackingUrl: fulfillmentData.trackingUrl || undefined,
          estimatedDelivery: fulfillmentData.estimatedDelivery || undefined
        },
        notes: fulfillmentData.notes
      };
      
      const response = await fulfillOrder(orderId, data);
      setOrder(response.data);
      setShowFulfillmentModal(false);
      toast.success('Order successfully fulfilled');
    } catch (err) {
      setError('Failed to fulfill order');
      toast.error('Failed to fulfill order');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!order) return;
    
    setStatusUpdating(true);
    try {
      const data = {
        paymentReconciliation: {
          status: completionData.paymentStatus,
          date: new Date().toISOString(),
          method: order.paymentMethod,
          amount: order.totalAmount
        },
        loyaltyPoints: {
          pointsEarned: completionData.pointsEarned
        },
        notes: completionData.notes,
        archiveOrder: completionData.archiveOrder
      };
      
      const response = await completeOrder(orderId, data);
      setOrder(response.data);
      setShowCompletionModal(false);
      toast.success('Order successfully completed');
    } catch (err) {
      setError('Failed to complete order');
      toast.error('Failed to complete order');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Generating invoice...');
      
      // Call the API to generate invoice
      const response = await generateInvoice(orderId);
      
      // Close loading toast
      toast.dismiss(loadingToast);
      
      // If the response includes a PDF URL, download it
      if (response.data && response.data.pdfUrl) {
        // Create an anchor element for downloading
        const downloadLink = document.createElement('a');
        downloadLink.href = response.data.pdfUrl;
        downloadLink.download = `Invoice-${response.data.invoiceNumber || order?.orderNumber}.pdf`;
        downloadLink.target = '_blank';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        toast.success('Invoice downloaded successfully');
      } 
      // If the API is set up to return PDF data directly as a blob
      else if (response.data && response.data.pdfBlob) {
        // Create a Blob from the PDF data
        const blob = new Blob([response.data.pdfBlob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Create an anchor element for downloading
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `Invoice-${response.data.invoiceNumber || order?.orderNumber}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(url);
        
        toast.success('Invoice downloaded successfully');
      }
      // Fallback if the API doesn't return PDF data yet
      else {
        toast.success('Invoice generated successfully');
        
        // For implementation guidance/future implementation:
        console.log('PDF download not implemented in API yet. Response:', response.data);
        toast.success('Invoice generated. Download feature coming soon.');
      }
    } catch (err) {
      toast.error('Failed to generate invoice');
      console.error('Invoice generation error:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'fulfilled':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPaymentMethod = (method: string) => {
    return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (<Layout>
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 p-4 rounded-md">
          <p className="text-red-800">{error || 'Order not found'}</p>
        </div>
      </div></Layout>
    );
  }

  return (<Layout>
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/orders" className="text-blue-600 hover:text-blue-800">
          ← Back to Orders
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Order Details</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <Link
                href={`/dashboard/orders/${order._id}/edit`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Edit Order
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold mb-3">Order Information</h2>
              <p className="mb-2"><span className="font-medium">Order ID:</span> {order._id}</p>
              <p className="mb-2"><span className="font-medium">Order Number:</span> {order.orderNumber}</p>
              <p className="mb-2"><span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
              <p className="mb-2">
                <span className="font-medium">Payment Method:</span> {formatPaymentMethod(order.paymentMethod)}
              </p>
              <p className="mb-2">
                <span className="font-medium">Payment Status:</span> {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Customer Information</h2>
              <p className="mb-2"><span className="font-medium">Name:</span> {typeof order.customer === 'object' ? order.customer.name : 'Customer'}</p>
              <p className="mb-2"><span className="font-medium">Email:</span> {typeof order.customer === 'object' ? order.customer.email : 'Email not available'}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
            <p className="mb-1">{order.shippingAddress.street}</p>
            <p className="mb-1">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>

          {/* Fulfillment Information - New Section */}
          {(order.status === 'fulfilled' || order.status === 'completed') && order.trackingInfo && (
            <div className="mb-8 bg-blue-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-3">Fulfillment Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2"><span className="font-medium">Status:</span> {order.fulfillmentStatus}</p>
                  <p className="mb-2"><span className="font-medium">Fulfillment Date:</span> {order.fulfillmentDate ? new Date(order.fulfillmentDate).toLocaleDateString() : 'Not specified'}</p>
                </div>
                <div>
                  <p className="mb-2"><span className="font-medium">Carrier:</span> {order.trackingInfo.carrier}</p>
                  <p className="mb-2">
                    <span className="font-medium">Tracking Number:</span> {' '}
                    {order.trackingInfo.trackingUrl ? (
                      <a href={order.trackingInfo.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {order.trackingInfo.trackingNumber}
                      </a>
                    ) : (
                      order.trackingInfo.trackingNumber
                    )}
                  </p>
                  {order.trackingInfo.estimatedDelivery && (
                    <p className="mb-2">
                      <span className="font-medium">Estimated Delivery:</span> {new Date(order.trackingInfo.estimatedDelivery).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Completion Information - New Section */}
          {order.status === 'completed' && (
            <div className="mb-8 bg-green-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-3">Completion Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2"><span className="font-medium">Completion Date:</span> {order.completionDate ? new Date(order.completionDate).toLocaleDateString() : 'Not specified'}</p>
                  {order.paymentReconciliation && (
                    <>
                      <p className="mb-2"><span className="font-medium">Payment Status:</span> {order.paymentReconciliation.status}</p>
                      <p className="mb-2"><span className="font-medium">Payment Date:</span> {order.paymentReconciliation.date ? new Date(order.paymentReconciliation.date).toLocaleDateString() : 'Not specified'}</p>
                    </>
                  )}
                </div>
                <div>
                  {order.loyaltyUpdate && (
                    <>
                      <p className="mb-2"><span className="font-medium">Loyalty Points Earned:</span> {order.loyaltyUpdate.pointsEarned}</p>
                      <p className="mb-2"><span className="font-medium">New Points Balance:</span> {order.loyaltyUpdate.currentPoints}</p>
                    </>
                  )}
                  <p className="mb-2">
                    <span className="font-medium">Archived:</span> {order.isArchived ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left">Product</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.products.map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 px-4">{typeof item.product === 'object' ? item.product.name : 'Product'}</td>
                      <td className="py-3 px-4 text-right">${item.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">{item.quantity}</td>
                      <td className="py-3 px-4 text-right">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right font-semibold">Total:</td>
                    <td className="py-3 px-4 text-right font-semibold">${order.totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Audit Trail - New Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Audit Trail</h2>
            <OrderAuditTrail orderId={orderId} />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Actions</h2>
            
            {/* Status Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-md font-medium mb-2">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'processing', 'shipped', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={statusUpdating || order.status === status || order.status === 'fulfilled' || order.status === 'completed'}
                      className={`px-4 py-2 rounded-md ${
                        order.status === status
                          ? 'bg-gray-300 cursor-not-allowed'
                          : order.status === 'fulfilled' || order.status === 'completed'
                          ? 'bg-gray-200 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Fulfillment & Completion Buttons */}
              <div>
                <h3 className="text-md font-medium mb-2">Order Fulfillment & Completion</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowFulfillmentModal(true)}
                    disabled={order.status !== 'processing' && order.status !== 'shipped'}
                    className={`px-4 py-2 rounded-md ${
                      order.status === 'processing' || order.status === 'shipped'
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-gray-200 cursor-not-allowed'
                    }`}
                  >
                    Fulfill Order
                  </button>
                  
                  <button
                    onClick={() => setShowCompletionModal(true)}
                    disabled={order.status !== 'fulfilled'}
                    className={`px-4 py-2 rounded-md ${
                      order.status === 'fulfilled'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-200 cursor-not-allowed'
                    }`}
                  >
                    Complete Order
                  </button>
                  
                  <button
                    onClick={handleGenerateInvoice}
                    className="px-4 py-2 rounded-md bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Generate Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fulfillment Modal */}
      {showFulfillmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Fulfill Order</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Carrier</label>
              <input
                type="text"
                value={fulfillmentData.carrier}
                onChange={(e) => setFulfillmentData({...fulfillmentData, carrier: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="FedEx, UPS, USPS, etc."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Tracking Number</label>
              <input
                type="text"
                value={fulfillmentData.trackingNumber}
                onChange={(e) => setFulfillmentData({...fulfillmentData, trackingNumber: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Tracking number"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Tracking URL (Optional)</label>
              <input
                type="text"
                value={fulfillmentData.trackingUrl}
                onChange={(e) => setFulfillmentData({...fulfillmentData, trackingUrl: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="https://tracking.carrier.com/..."
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Estimated Delivery (Optional)</label>
              <input
                type="date"
                value={fulfillmentData.estimatedDelivery}
                onChange={(e) => setFulfillmentData({...fulfillmentData, estimatedDelivery: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
              <textarea
                value={fulfillmentData.notes}
                onChange={(e) => setFulfillmentData({...fulfillmentData, notes: e.target.value})}
                className="w-full p-2 border rounded"
                rows={2}
                placeholder="Any notes about this fulfillment"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowFulfillmentModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleFulfillOrder}
                disabled={!fulfillmentData.carrier || !fulfillmentData.trackingNumber}
                className={`px-4 py-2 rounded text-white ${
                  !fulfillmentData.carrier || !fulfillmentData.trackingNumber
                    ? 'bg-indigo-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Fulfill Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Complete Order</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Payment Status</label>
              <select
                value={completionData.paymentStatus}
                onChange={(e) => setCompletionData({...completionData, paymentStatus: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="complete">Complete</option>
                <option value="partial">Partial</option>
                <option value="discrepancy">Discrepancy</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Loyalty Points Earned</label>
              <input
                type="number"
                value={completionData.pointsEarned}
                onChange={(e) => setCompletionData({...completionData, pointsEarned: parseInt(e.target.value) || 0})}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
              <textarea
                value={completionData.notes}
                onChange={(e) => setCompletionData({...completionData, notes: e.target.value})}
                className="w-full p-2 border rounded"
                rows={2}
                placeholder="Any notes about this completion"
              />
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={completionData.archiveOrder}
                  onChange={(e) => setCompletionData({...completionData, archiveOrder: e.target.checked})}
                  className="mr-2"
                />
                <span>Archive Order</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteOrder}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Complete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div></Layout>
  );
};

export default OrderDetail;